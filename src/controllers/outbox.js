import Outbox from '../models/outbox.js';
import { minioClient } from '../config/minio.js';

const BUCKET_NAME = process.env.MINIO_BUCKET;

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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'wait' };

    if (req.query.origin) {
      query.origin = req.query.origin;
    }

    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    const [outboxes, total] = await Promise.all([
      Outbox.find(query)
        .select('status date destination category summary createdBy number attachment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Outbox.countDocuments(query)
    ]);

    res.status(200).json({
      message: 'ok',
      data: outboxes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    console.error('Error getOutboxDisposisi:', err); // optional for debugging
    res.status(500).json({ message: 'Server Error' });
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
