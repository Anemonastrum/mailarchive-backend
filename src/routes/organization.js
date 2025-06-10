import express from 'express';
import multer from 'multer';
import { createOrganization, updateOrganization, getOrganization} from '../controllers/organization.js';
import auth from '../middleware/auth.js';
import { emptyIngfoValidation} from '../utils/validators.js';
import role from '../middleware/role.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getOrganization);
router.post('/', auth, role('admin', 'superadmin'), upload.single('logo'), createOrganization);
router.put('/', emptyIngfoValidation, auth, role('admin', 'superadmin'), upload.single('logo'), updateOrganization);

export default router;
