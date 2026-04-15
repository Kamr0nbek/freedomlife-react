import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, sendPush } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.post('/push', authenticate, sendPush);

export default router;
