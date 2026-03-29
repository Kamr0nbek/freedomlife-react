import express from 'express';
import { 
  getMyBookings, 
  createBooking, 
  updateBooking, 
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getAvailableSlots
} from '../controllers/bookingController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Защищённые роуты (пользователи)
router.get('/', authenticate, getMyBookings);
router.post('/', authenticate, createBooking);
router.put('/:id', authenticate, updateBooking);
router.delete('/:id', authenticate, cancelBooking);
router.get('/slots', authenticate, getAvailableSlots);

// Админ роуты
router.get('/all', authenticate, requireAdmin, getAllBookings);
router.put('/:id/status', authenticate, requireAdmin, updateBookingStatus);

export default router;
