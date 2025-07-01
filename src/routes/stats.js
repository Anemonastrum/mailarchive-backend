import express from 'express';
import {
  getStats,
  getMonthlyLetterStats,
  getOutboxStatsByCategory,
  getTotalWaitingInbox
} from '../controllers/stats.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/total', auth, getStats);
router.get('/bulanan/:year', auth, getMonthlyLetterStats);
router.get('/kategori', auth, getOutboxStatsByCategory);
router.get('/disposisi', getTotalWaitingInbox);

export default router;
