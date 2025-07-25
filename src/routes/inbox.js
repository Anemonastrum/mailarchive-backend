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

import { handleValidation } from '../utils/validationHandle.js'
import { createInboxCheck, editInboxCheck } from '../utils/validators.js'

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/disposisi', auth, role('superadmin'), getInboxDisposisi);
router.get('/', auth, getInbox);
router.get('/:id', auth, getInboxById);
router.post(
  '/',
  auth,
  role('admin', 'superadmin'),
  upload.fields([
    { name: 'mailPic', maxCount: 1 },
    { name: 'attachments', maxCount: 10 },
  ]),
  createInboxCheck,
  handleValidation,
  createInbox
);
router.put(
  '/:id',
  auth,
  role('admin', 'superadmin'),
  upload.fields([
    { name: 'mailPic', maxCount: 1 },
    { name: 'attachments', maxCount: 10 },
  ]),
  editInboxCheck,
  handleValidation,
  updateInbox
);
router.delete('/:id', auth, role('admin', 'superadmin'), deleteInbox);
router.put('/disposisi/:id', auth, role('superadmin'), updateInboxAction);

export default router;