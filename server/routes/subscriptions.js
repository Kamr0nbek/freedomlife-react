import express from 'express';
import { 
  getSubscription, 
  purchaseSubscription, 
  activatePromoCode, 
  adminUpdateSubscription,
  createPromoCode,
  getAllPromoCodes,
  getUserRequests,
  getPendingRequests,
  approveRequest,
  rejectRequest
} from '../controllers/subscriptionController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Защищённые роуты (пользователи)
router.get('/', authenticate, getSubscription);
router.post('/purchase', authenticate, purchaseSubscription);
router.post('/activate', authenticate, activatePromoCode);
router.get('/requests', authenticate, getUserRequests);

// Админ роуты
router.put('/admin/update', authenticate, requireAdmin, adminUpdateSubscription);
router.post('/promo/create', authenticate, requireAdmin, createPromoCode);
router.get('/promo/all', authenticate, requireAdmin, getAllPromoCodes);

// Админ: Запросы на абонементы
router.get('/admin/requests', authenticate, requireAdmin, getPendingRequests);
router.post('/admin/requests/:id/approve', authenticate, requireAdmin, approveRequest);
router.post('/admin/requests/:id/reject', authenticate, requireAdmin, rejectRequest);

export default router;
