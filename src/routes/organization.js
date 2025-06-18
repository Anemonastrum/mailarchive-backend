import express from 'express';
import multer from 'multer';

import { 
    createOrganization, 
    updateOrganization, 
    getOrganization 
} from '../controllers/organization.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import { organizationCheck} from '../utils/validators.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getOrganization);
router.post('/', organizationCheck, auth, role('admin', 'superadmin'), upload.single('logo'), createOrganization);
router.put('/', organizationCheck, auth, role('admin', 'superadmin'), upload.single('logo'), updateOrganization);

export default router;
