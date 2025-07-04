import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import { updateUserSelf, changePassword, getUserList, manageUser, registerUser, getUserById } from '../controllers/user.js';
import { changePasswordCheck, profileUpdateCheck, memberAddCheck } from '../utils/validators.js';
import { handleValidation } from '../utils/validationHandle.js'

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put('/me', auth, upload.single('picture'), profileUpdateCheck, handleValidation, updateUserSelf);
router.put('/me/password', auth, changePasswordCheck, handleValidation, changePassword);
router.get('/list', auth, role('superadmin'), getUserList);
router.put('/manage/:id', auth, role('superadmin'), manageUser);
router.post('/add', auth, role('superadmin'), memberAddCheck, handleValidation, registerUser);
router.get('/:id', auth, getUserById);

export default router;
