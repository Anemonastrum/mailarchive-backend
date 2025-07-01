import Outbox from '../models/outbox.js';
import { minioClient } from '../config/minio.js';
import crypto from 'crypto';

const BUCKET_NAME = process.env.MINIO_BUCKET;

// buat outbox
export const createOutbox = async (req, res) => {
  try {
    const {
      number,
      category,
      date,
      destination,
      content,
      summary,
      sign,
    } = req.body;

    const exist = await Outbox.findOne({ number });
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

    const outbox = new Outbox({
      number,
      category,
      date,
      destination,
      content,
      summary,
      sign,
      attachment: attachmentUrls.length,
      attachmentUrls,
      createdBy: req.user.name,
    });

    await outbox.save();

    res.status(201).json({ message: 'ok', outbox });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

// edit outbox
export const updateOutbox = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        number,
        category,
        date,
        destination,
        content,
        summary,
        sign
      } = req.body;
  
      // verif data outbox
      const outbox = await Outbox.findById(id);
      if (!outbox) return res.status(404).json({ message: 'data gaada' });
  
      // handle fields
      if (number) outbox.number = number;
      if (category) outbox.category = category;
      if (date) outbox.date = date;
      if (destination) outbox.destination = destination;
      if (content) outbox.content = content;
      if (summary) outbox.summary = summary;
      if (sign) outbox.sign = sign;
  
      // klo ada file attach
      if (req.files && req.files.length > 0) {
        // hapus data lama dari minio
        if (outbox.attachmentUrls && outbox.attachmentUrls.length > 0) {
          for (const url of outbox.attachmentUrls) {
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
  
        outbox.attachment = newAttachmentUrls.length;
        outbox.attachmentUrls = newAttachmentUrls;
      }
  
      await outbox.save();
  
      res.json({ message: 'ok', outbox });
  
    } catch (err) {

      res.status(500).json({ message: 'Server Error', err });
    }
};

// hapus outbox
export const deleteOutbox = async (req, res) => {
    try {
      const { id } = req.params;
  
      // verif data outbox
      const outbox = await Outbox.findById(id);
      if (!outbox) return res.status(404).json({ message: 'data tidak ditemukan' });
  
      // hapus data dari minio
      if (outbox.attachmentUrls && outbox.attachmentUrls.length > 0) {
        for (const url of outbox.attachmentUrls) {
          const objectName = url.split(`/${BUCKET_NAME}/`)[1];
          if (objectName) {
            await minioClient.removeObject(BUCKET_NAME, objectName);
          }
        }
      }
  
      await outbox.deleteOne();
  
      res.json({ message: 'ok' });
  
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

// ambil data outbox (include filter sama pagination)
export const getOutbox = async (req, res) => {
    try {
      const { page = 1, limit = 10, category, createdBy } = req.query;
  
      const query = {};
      if (category) query.category = category;
      if (createdBy) query.createdBy = createdBy;
  
      const skip = (page - 1) * limit;
  
      const [outboxes, total] = await Promise.all([
        Outbox.find(query)
          .select('number destination summary attachment date')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Outbox.countDocuments(query)
      ]);
  
      res.status(200).json({
        message: 'ok',
        data: outboxes,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalData: total,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};
  
// ambil data spesifik outbok (pake id)
export const getOutboxById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const outbox = await Outbox.findById(id);
      if (!outbox) return res.status(404).json({ message: 'data tidak ditemukan' });
  
      res.status(200).json({ message: 'ok', outbox });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

//get outbox wait
export const getOutboxDisposisi = async (req, res) => {
    try {
      const { page = 1, limit = 10, origin, createdBy } = req.query;
  
      const query = { status: 'wait' };
      if (origin) query.origin = origin;
      if (createdBy) query.createdBy = createdBy;
  
      const skip = (page - 1) * limit;
  
      const [outboxes, total] = await Promise.all([
        Outbox.find(query)
          .select('status date destination category summary createdBy number attachment')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Outbox.countDocuments(query)
      ]);
  
      res.status(200).json({
        message: 'ok',
        data: outboxes,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalData: total,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};

export const updateOutboxVerif = async (req, res) => {
  try {
    const { id } = req.params;

    const outbox = await Outbox.findById(id);
    if (!outbox) {
      return res.status(404).json({ message: 'Outbox mail not found' });
    }

    outbox.status = 'done';
    await outbox.save();

    res.status(200).json({ message: 'Outbox updated successfully', outbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
