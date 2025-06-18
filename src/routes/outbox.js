import express from 'express';
import multer from 'multer';

import {
  createOutbox,
  updateOutbox,
  deleteOutbox,
  getOutbox,
  getOutboxById
} from '../controllers/outbox.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getOutbox);
router.get('/:id', auth, getOutboxById);
router.post('/', auth, role('admin', 'superadmin'), upload.array('attachments'), createOutbox);
router.put('/:id', auth, role('admin', 'superadmin'), upload.array('attachments'), updateOutbox);
router.delete('/:id', auth, role('admin', 'superadmin'), deleteOutbox);

export default router;
