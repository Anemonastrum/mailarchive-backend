import express from 'express';
import multer from 'multer';

import {
  createInbox,
  updateInbox,
  deleteInbox,
  getInbox,
  getInboxById,
  getInboxDisposisi,
  updateInboxAction
} from '../controllers/inbox.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/disposisi', auth, role('superadmin'), getInboxDisposisi);
router.get('/', auth, getInbox);
router.get('/:id', auth, getInboxById);
router.post('/', auth, role('admin', 'superadmin'), upload.array('attachments'), createInbox);
router.put('/:id', auth, role('admin', 'superadmin'), upload.array('attachments'), updateInbox);
router.delete('/:id', auth, role('admin', 'superadmin'), deleteInbox);
router.put('/disposisi/:id', auth, role('superadmin'), updateInboxAction);

export default router;