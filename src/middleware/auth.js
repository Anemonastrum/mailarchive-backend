import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const auth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];        
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) return res.status(401).json({message: "mana tokennya?"});

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
          return res.status(401).json({ message: 'token ga valdi' });
      }

      next();
  } catch (err) {
      res.status(401).json({ message: 'token ga valdi'});
  }
};

export default auth;
