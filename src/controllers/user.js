import User from '../models/user';
import { minioClient } from '../config/minio.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BUCKET_NAME = process.env.MINIO_BUCKET;
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL;

// update diri

export const updateUserSelf = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const { name, address, position, number } = req.body;

    if (name) user.name = name;
    if (address) user.address = address;
    if (position) user.position = position;
    if (number) user.number = number;

    // update minio delet klo ada
    if (req.file) {
      if (user.pictureUrl) {
        const objectName = user.pictureUrl.split(`/${BUCKET_NAME}/`)[1];
        if (objectName) {
          await minioClient.removeObject(BUCKET_NAME, objectName);
        }
      }

      const ext = req.file.originalname.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        req.file.buffer,
        req.file.size,
        req.file.mimetype
      );

      user.pictureUrl = `${PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
    }

    await user.save();

    res.status(200).json({
      message: 'ok',
      user: {
        name: user.name,
        username: user.username,
        address: user.address,
        position: user.position,
        number: user.number,
        pictureUrl: user.pictureUrl
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

// ganti password

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password lama salah' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'ok' });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

