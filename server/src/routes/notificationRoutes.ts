import express from 'express';
import {
  createNotificationHttp,
  registerFcmToken,
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.put('/', createNotificationHttp);
router.put('/registerFcmToken/:id', registerFcmToken);

export default router; 