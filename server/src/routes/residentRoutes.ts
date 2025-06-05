import express from 'express';
import { 
  getAllResidents, 
  getAllResidentsInactiveAndActive,
  getResidentById, 
  createResident, 
  updateResident, 
  deleteResident,
  activateResident
} from '../controllers/residentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/activeAndInactive', protect, getAllResidentsInactiveAndActive);
router.put('/active/:id', protect, activateResident);  
router.get('/', protect, getAllResidents);
router.get('/:id', protect, getResidentById);
router.post('/', protect, createResident);
router.put('/:id', protect, updateResident);
router.delete('/:id', protect, deleteResident);

export default router; 