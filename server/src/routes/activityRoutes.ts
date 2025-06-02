import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} from '../controllers/activityController';

const router = express.Router();

router.use(protect);

router.post('/', createActivity);
router.get('/', getActivities);
router.get('/:id', getActivityById);

router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router; 