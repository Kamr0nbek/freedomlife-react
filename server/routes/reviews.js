import express from 'express';
import { getReviews, createReview, getAllReviews, moderateReview } from '../controllers/reviewController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Публичные роуты
router.get('/', getReviews);

// Защищённые роуты
router.post('/', authenticate, createReview);

// Админ роуты
router.get('/all', authenticate, requireAdmin, getAllReviews);
router.put('/:id/moderate', authenticate, requireAdmin, moderateReview);

export default router;
