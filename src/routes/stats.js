import express from 'express';
import {
  getStats,
  getMonthlyLetterStats,
  getOutboxStatsByCategory
} from '../controllers/stats.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();

router.get('/total', auth, role('admin', 'superadmin'), getStats);
router.get('/bulanan', auth, role('admin', 'superadmin'), getMonthlyLetterStats);
router.get('/kategori', auth, role('admin', 'superadmin'), getOutboxStatsByCategory);

export default router;
