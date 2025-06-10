import express from 'express';
import { registerSuperAdmin, registerAdminMember, loginUser, getUser } from '../controllers/auth.js';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import { registerValidation, loginValidation } from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerValidation, registerSuperAdmin);
router.post('/register/member', registerValidation, registerAdminMember);
router.post('/login', loginValidation, loginUser);
router.get('/user', auth, role('admin', 'superadmin', 'user'), getUser);

export default router;
