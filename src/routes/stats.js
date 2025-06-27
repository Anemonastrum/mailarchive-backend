import express from 'express';
import {
  getStats,
  getMonthlyLetterStats,
  getOutboxStatsByCategory
} from '../controllers/stats.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/total', auth, getStats);
router.get('/bulanan', auth, getMonthlyLetterStats);
router.get('/kategori', auth, getOutboxStatsByCategory);

export default router;
