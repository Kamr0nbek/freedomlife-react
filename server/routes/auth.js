import express from 'express';
import { register, login, getMe, updateProfile, getAllUsers } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Публичные роуты
router.post('/register', register);
router.post('/login', login);

// Защищённые роуты
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Админ роуты
router.get('/users', authenticate, getAllUsers);

export default router;
