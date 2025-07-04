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
import { handleValidation } from '../utils/validationHandle.js'

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getOrganization);
router.post('/', organizationCheck, handleValidation, auth, role('admin', 'superadmin'), upload.single('logo'), createOrganization);
router.put('/', organizationCheck, handleValidation, auth, role('admin', 'superadmin'), upload.single('logo'), updateOrganization);

export default router;
