import Organization from '../models/organization.js';
import { minioClient } from '../config/minio.js';
import crypto from 'crypto';

// ambil bucket dari .env
const BUCKET_NAME = process.env.MINIO_BUCKET;
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL;

// buat data org, cuma satu doang
export const createOrganization = async (req, res) => {
  try {
    const existing = await Organization.findOne();
    if (existing) return res.status(400).json({ message: 'udah ada, update aja' });

    const { name, address, number, email } = req.body;
    let logoUrl = null;

    // upload logo kalo ada
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        req.file.buffer,
        req.file.size,
        req.file.mimetype
      );

      logoUrl = `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
    }

    const organization = new Organization({
      name,
      address,
      number,
      email,
      logo: logoUrl,
      createdBy: req.user._id,
    });

    await organization.save();
    res.status(201).json({ message: 'ok', organization });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error', err });
  }
};

// update data org
export const updateOrganization = async (req, res) => {
  try {
    const { name, address, number } = req.body;
    const updates = { name, address, number };

    // ganti logo kalo ada file baru
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        req.file.buffer,
        req.file.size,
        req.file.mimetype
      );

      updates.logo = `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
    }

    const organization = await Organization.findOneAndUpdate({}, updates, { new: true });

    if (!organization) return res.status(404).json({ message: 'ga nemu data org' });

    res.json({ message: 'ok', organization });
  } catch (err) {
    res.status(500).json({ message: 'server error', err });
  }
};

// ambil data ingfo
export const getOrganization = async (req, res) => {
  try {
    const ingfo = await Organization.findOne();
    if (!ingfo) return res.status(404).json({ message: 'ga nemu data' });
    res.json(ingfo);
  } catch (err) {
    res.status(500).json({ message: 'server error', err });
  }
};
