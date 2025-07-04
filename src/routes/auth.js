import express from 'express';

import { 
    registerSuperAdmin, 
    loginUser, getUser 
} from '../controllers/auth.js';

import auth from '../middleware/auth.js';
import { registerCheck, loginCheck} from '../utils/validators.js';
import { handleValidation } from '../utils/validationHandle.js'

const router = express.Router();

router.post('/register', registerCheck, handleValidation, registerSuperAdmin);
router.post('/login', loginCheck, handleValidation, loginUser);
router.get('/user', auth, getUser);
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false
    });
    res.json({ message: 'Logout success' });
  });

export default router;
