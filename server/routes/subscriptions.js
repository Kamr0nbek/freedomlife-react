import express from 'express';
import { 
  getSubscription, 
  purchaseSubscription, 
  activatePromoCode, 
  adminUpdateSubscription,
  createPromoCode,
  getAllPromoCodes
} from '../controllers/subscriptionController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Защищённые роуты (пользователи)
router.get('/', authenticate, getSubscription);
router.post('/purchase', authenticate, purchaseSubscription);
router.post('/activate', authenticate, activatePromoCode);

// Админ роуты
router.put('/admin/update', authenticate, requireAdmin, adminUpdateSubscription);
router.post('/promo/create', authenticate, requireAdmin, createPromoCode);
router.get('/promo/all', authenticate, requireAdmin, getAllPromoCodes);

export default router;
