import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// register superadmin cuma buat dev
export const registerSuperAdmin = async (req, res) => {

  const { name, username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ errors: [{ message: 'superadmin sudah ada' }] });

    user = new User({ name, username, password, role: 'superadmin' });
    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ message: 'ok', token });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// register admin sama member
export const registerAdminMember = async (req, res) => {

  const { name, username, password, role } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ errors: [{ message: 'member atau admin sudah ada' }] });

    user = new User({ name, username, password, role });
    await user.save();

    res.status(201).json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// login
export const loginUser = async (req, res, next) => {

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message : 'username atau password tidak cocok' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'username atau password tidak cocok' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

     // Set token di httpOnly cookie
     res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true jika sudah HTTPS
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// get userdata
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({message: 'ok', user});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
