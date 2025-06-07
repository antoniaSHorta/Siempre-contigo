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
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.use(protect)

router.get('/activeAndInactive', authorize('Admin'), getAllResidentsInactiveAndActive);
router.put('/active/:id', authorize('Admin'), activateResident);  
router.get('/', getAllResidents);
router.get('/:id', getResidentById);
router.post('/', authorize('Admin'), createResident);
router.put('/:id', authorize('Admin'), updateResident);
router.delete('/:id', authorize('Admin'), deleteResident);

export default router; 