import express from 'express';
import { register, login, getMe, logout, updateProfile, updatePassword } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/:id', protect, updateProfile);
router.put('/:id/password', protect, updatePassword);

export default router; 