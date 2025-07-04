import Inbox from '../models/inbox.js';
import { minioClient } from '../config/minio.js';
import crypto from 'crypto';

const BUCKET_NAME = process.env.MINIO_BUCKET;

// buat surat masuk, status auto wait tunggu superadmin proses
export const createInbox = async (req, res) => {
  try {
    const {
      number,
      category,
      date,
      recievedDate,
      origin,
      summary,
    } = req.body;

    const exist = await Inbox.findOne({ number });
    if (exist) return res.status(400).json({ message: 'nomor surat sudah ada' });

    const mailPicFile = req.files?.mailPic?.[0];
    if (!mailPicFile) {
      return res.status(400).json({ message: 'Gambar surat (mailPic) wajib diunggah' });
    }

    const mailPicExt = mailPicFile.originalname.split('.').pop();
    const mailPicName = `${crypto.randomUUID()}.${mailPicExt}`;
    const mailPicMime = mailPicFile.mimetype || 'application/octet-stream';

    await minioClient.putObject(
      BUCKET_NAME,
      mailPicName,
      mailPicFile.buffer,
      mailPicFile.size,
      { 'Content-Type': mailPicMime }
    );

    const mailUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${mailPicName}`;

    // ✅ Optional: attachments
    const attachmentUrls = [];
    const attachments = req.files?.attachments || [];
    for (const file of attachments) {
      const ext = file.originalname.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const mimeType = file.mimetype || 'application/octet-stream';

      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': mimeType }
      );

      const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
      attachmentUrls.push(fileUrl);
    }

    const inbox = new Inbox({
      number,
      category,
      date,
      recievedDate,
      origin,
      summary,
      mailUrl,
      attachment: attachmentUrls.length,
      attachmentUrls,
      createdBy: req.user.name,
    });

    await inbox.save();

    res.status(201).json({ message: 'ok', inbox });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', err });
  }
};


// edit surat masuk
export const updateInbox = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      number,
      category,
      date,
      recievedDate,
      origin,
      summary,
    } = req.body;

    const inbox = await Inbox.findById(id);
    if (!inbox) return res.status(404).json({ message: 'Data tidak ditemukan' });

    // Update basic fields
    if (number) inbox.number = number;
    if (category) inbox.category = category;
    if (date) inbox.date = date;
    if (recievedDate) inbox.recievedDate = recievedDate;
    if (origin) inbox.origin = origin;
    if (summary) inbox.summary = summary;

    const mailPic = req.files?.mailPic?.[0];
    if (mailPic) {
      if (inbox.mailUrl) {
        const oldMailPicObject = inbox.mailUrl.split(`/${BUCKET_NAME}/`)[1];
        if (oldMailPicObject) {
          await minioClient.removeObject(BUCKET_NAME, oldMailPicObject);
        }
      }

      const mailExt = mailPic.originalname.split('.').pop();
      const mailName = `${crypto.randomUUID()}.${mailExt}`;
      const mailMime = mailPic.mimetype || 'application/octet-stream';

      await minioClient.putObject(
        BUCKET_NAME,
        mailName,
        mailPic.buffer,
        mailPic.size,
        { 'Content-Type': mailMime }
      );

      inbox.mailUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${mailName}`;
    }

    const attachments = req.files?.attachments || [];
    if (attachments.length > 0) {
      if (inbox.attachmentUrls && inbox.attachmentUrls.length > 0) {
        for (const url of inbox.attachmentUrls) {
          const objectName = url.split(`/${BUCKET_NAME}/`)[1];
          if (objectName) {
            await minioClient.removeObject(BUCKET_NAME, objectName);
          }
        }
      }

      const newAttachmentUrls = [];
      for (const file of attachments) {
        const ext = file.originalname.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const mimeType = file.mimetype || 'application/octet-stream';

        await minioClient.putObject(
          BUCKET_NAME,
          fileName,
          file.buffer,
          file.size,
          { 'Content-Type': mimeType }
        );

        const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
        newAttachmentUrls.push(fileUrl);
      }

      inbox.attachmentUrls = newAttachmentUrls;
      inbox.attachment = newAttachmentUrls.length;
    }

    await inbox.save();
    res.json({ message: 'ok', inbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', err });
  }
};

// hapus surat masuk
export const deleteInbox = async (req, res) => {
    try {
      const { id } = req.params;
  
      // verif data inbox
      const inbox = await Inbox.findById(id);
      if (!inbox) return res.status(404).json({ message: 'data tidak ditemukan' });
  
      // hapus data dari minio
      if (inbox.attachmentUrls && inbox.attachmentUrls.length > 0) {
        for (const url of inbox.attachmentUrls) {
          const objectName = url.split(`/${BUCKET_NAME}/`)[1];
          if (objectName) {
            await minioClient.removeObject(BUCKET_NAME, objectName);
          }
        }
      }
  
      await inbox.deleteOne();
  
      res.json({ message: 'ok' });
  
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

// ambil data inbox (include page)
export const getInbox = async (req, res) => {
    try {
      const { page = 1, limit = 10, origin, createdBy } = req.query;
  
      const query = {};
      if (origin) query.origin = origin;
      if (createdBy) query.createdBy = createdBy;
  
      const skip = (page - 1) * limit;
  
      const [inboxes, total] = await Promise.all([
        Inbox.find(query)
          .select('recievedDate number origin summary attachment')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Inbox.countDocuments(query)
      ]);
  
      res.status(200).json({
        message: 'ok',
        data: inboxes,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalData: total,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

// ambil data spesifik inobokxkwsx (pake id) ini buka
export const getInboxById = async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;
  
      const inbox = await Inbox.findById(id);
      if (!inbox) return res.status(404).json({ message: 'data tidak ditemukan' });

      if (userRole === 'user' && inbox.status === 'wait') {
        return res.status(403).json({ message: 'Akses ditolak'});
      }
  
      res.status(200).json({ message: 'ok', inbox });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

// ambil data inbox disposisi (khusus superadmin)

export const getInboxDisposisi = async (req, res) => {
    try {
      const { page = 1, limit = 10, origin, createdBy } = req.query;
  
      const query = { status: 'wait' };
      if (origin) query.origin = origin;
      if (createdBy) query.createdBy = createdBy;
  
      const skip = (page - 1) * limit;
  
      const [inboxes, total] = await Promise.all([
        Inbox.find(query)
          .select('status recievedDate origin summary createdBy number attachment')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Inbox.countDocuments(query)
      ]);
  
      res.status(200).json({
        message: 'ok',
        data: inboxes,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalData: total,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

// aksi superadmin
export const updateInboxAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    const inbox = await Inbox.findById(id);
    if (!inbox) {
      return res.status(404).json({ message: 'Inbox mail not found' });
    }

    inbox.action = action;
    inbox.status = 'done';
    await inbox.save();

    res.status(200).json({ message: 'Inbox updated successfully', inbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', err });
  }
};