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
      summary
    } = req.body;

    const exist = await Inbox.findOne({ number });
    if (exist) return res.status(400).json({ message: 'nomor surat sudah ada' });

    let attachmentUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const ext = file.originalname.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;

        await minioClient.putObject(
          BUCKET_NAME,
          fileName,
          file.buffer,
          file.size,
          file.mimetype
        );

        const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
        attachmentUrls.push(fileUrl);
      }
    }

    const inbox = new Inbox({
      number,
      category,
      date,
      recievedDate,
      origin,
      summary,
      attachment: attachmentUrls.length,
      attachmentUrls,
      createdBy: req.user.name,
    });

    await inbox.save();

    res.status(201).json({ message: 'ok', inbox });

  } catch (err) {
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
        summary
      } = req.body;
  
      // verif data inbox
      const inbox = await Inbox.findById(id);
      if (!inbox) return res.status(404).json({ message: 'data gaada' });
  
      // handle fields
      if (number) inbox.number = number;
      if (category) inbox.category = category;
      if (date) inbox.date = date;
      if (origin) inbox.origin = origin;
      if (recievedDate) inbox.recievedDate = recievedDate;
      if (summary) inbox.summary = summary;
  
      // klo ada file attach
      if (req.files && req.files.length > 0) {
        // hapus data lama dari minio
        if (inbox.attachmentUrls && inbox.attachmentUrls.length > 0) {
          for (const url of inbox.attachmentUrls) {
            const objectName = url.split(`/${BUCKET_NAME}/`)[1];
            if (objectName) {
              await minioClient.removeObject(BUCKET_NAME, objectName);
            }
          }
        }
  
        let newAttachmentUrls = [];
  
        for (const file of req.files) {
          const ext = file.originalname.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${ext}`;
  
          await minioClient.putObject(
            BUCKET_NAME,
            fileName,
            file.buffer,
            file.size,
            file.mimetype
          );
  
          const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
          newAttachmentUrls.push(fileUrl);
        }
  
        inbox.attachment = newAttachmentUrls.length | 1;
        inbox.attachmentUrls = newAttachmentUrls;
      }
  
      await inbox.save();
  
      res.json({ message: 'ok', inbox });
  
    } catch (err) {

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
          .select('status recievedDate origin summary')
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