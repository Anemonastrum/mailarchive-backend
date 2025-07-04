import express from 'express';
import multer from 'multer';

import {
  deleteOutbox,
  getOutbox,
  getOutboxById,
  getOutboxDisposisi,
  updateOutboxVerif
} from '../controllers/outbox.js';

import {
  createOutboxPDF,
  updateOutboxPDF
} from '../controllers/pdf.js';

import { createOutboxCheck, editOutboxCheck } from '../utils/validators.js'
import { handleValidation } from '../utils/validationHandle.js'


import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getOutbox);
router.get('/verifikasi', auth, role('admin', 'superadmin'), getOutboxDisposisi);
router.put('/verifikasi/:id', auth, role('superadmin'), updateOutboxVerif);
router.get('/:id', auth, getOutboxById);
router.post('/', auth, role('admin', 'superadmin'), upload.array('attachments'), createOutboxCheck, handleValidation, createOutboxPDF);
router.put('/:id', auth, role('admin', 'superadmin'), upload.array('attachments'), editOutboxCheck, handleValidation, updateOutboxPDF);
router.delete('/:id', auth, role('admin', 'superadmin'), deleteOutbox);


export default router;
