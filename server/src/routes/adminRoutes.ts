import express from 'express';
import { createUser, getAllUsers , getUserById, updateUser, toggleStatusUser, checkEmail} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', [protect, authorize('Admin')], createUser);         
router.get('/', [protect, authorize('Admin')], getAllUsers);         
router.get('/:id', [protect, authorize('Admin')], getUserById);      
router.put('/:id', [protect, authorize('Admin')], updateUser);       
router.put('/status/:id', [protect, authorize('Admin')], toggleStatusUser);
router.post('/check-email', checkEmail);

export default router; 