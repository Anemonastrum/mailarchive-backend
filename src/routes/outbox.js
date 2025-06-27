import express from 'express';
import multer from 'multer';

import {
  createOutbox,
  updateOutbox,
  deleteOutbox,
  getOutbox,
  getOutboxById
} from '../controllers/outbox.js';

import {
  createOutboxPDF,
  updateOutboxPDF
} from '../controllers/pdf.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getOutbox);
router.get('/:id', auth, getOutboxById);
router.post('/', auth, role('admin', 'superadmin'), upload.array('attachments'), createOutboxPDF);
router.put('/:id', auth, role('admin', 'superadmin'), upload.array('attachments'), updateOutboxPDF);
router.delete('/:id', auth, role('admin', 'superadmin'), deleteOutbox);

export default router;
