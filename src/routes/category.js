import express from 'express';

import {
    createCategory, 
    updateCategory, 
    getCategory,
    deleteCategory
} from '../controllers/category.js';

import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = express.Router();

router.get('/', auth, getCategory);
router.post('/', auth, role('admin', 'superadmin'), createCategory);
router.put('/:id', auth, role('admin', 'superadmin'), updateCategory);
router.delete('/:id', auth, role('admin', 'superadmin'), deleteCategory);

export default router;
