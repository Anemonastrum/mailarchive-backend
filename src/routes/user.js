import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { updateUserSelf } from '../controllers/user.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put('/me', auth, upload.single('picture'), updateUserSelf);
router.put('/me/password', auth, changePassword);

export default router;
