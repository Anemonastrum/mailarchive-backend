import express from 'express';

import { 
    registerSuperAdmin, 
    registerAdminMember, 
    loginUser, getUser 
} from '../controllers/auth.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import { registerCheck, loginCheck} from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerCheck, registerSuperAdmin);
router.post('/register/member', registerCheck, registerAdminMember);
router.post('/login', loginCheck, loginUser);
router.get('/user', auth, getUser);
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false // ganti true jika sudah pakai HTTPS di production
    });
    res.json({ message: 'Logout success' });
  });

export default router;
