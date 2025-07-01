import User from '../models/user.js';
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

    const { name, address, position, number, nbm } = req.body;

    if (name) user.name = name;
    if (address) user.address = address;
    if (position) user.position = position;
    if (number) user.number = number;
    if (nbm) user.nbm = nbm;

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
        nbm: user.nbm,
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

    user.password = newPassword

    await user.save();

    res.status(200).json({ message: 'ok' });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

// get user list

export const getUserList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ]
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name nbm role status position') // Exclude password
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'ok',
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

// Admin update user
export const manageUser = async (req, res) => {
  try {
    const { id } = req.params; // user ID from URL
    const { name, nbm, position, number, status, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (name) user.name = name;
    if (nbm) user.nbm = nbm;
    if (position) user.position = position;
    if (number) user.number = number;
    if (status) user.status = status;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: 'User berhasil diupdate',
      user: {
        id: user._id,
        name: user.name,
        nbm: user.nbm,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

// Superadmin: register new user
export const registerUser = async (req, res) => {
  try {
    const { name, username, password, address, position, number, role, status, nbm } = req.body;

    // Check required fields
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username, and password are required' });
    }

    // Check if username already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Create user
    const newUser = new User({
      name,
      username,
      password,
      address,
      position,
      number,
      nbm,
      role: role || 'user',
      status: status || 'active',
    });

    await newUser.save();

    res.status(201).json({
      message: 'ok',
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        status: newUser.status,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      message: 'ok',
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};