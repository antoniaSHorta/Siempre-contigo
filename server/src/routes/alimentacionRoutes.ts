import express from 'express';
import {
  createAlimentacion,
  getAllAlimentaciones,
  getAlimentacionById,
  updateAlimentacion,
  deleteAlimentacion,
  getAlimentacionesByTipo,
} from '../controllers/alimentacionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createAlimentacion);                  
router.get('/', getAllAlimentaciones);                 
router.get('/:id', getAlimentacionById);                
router.put('/:id', updateAlimentacion);               
router.delete('/:id', deleteAlimentacion);            

router.get('/tipo/:tipo', getAlimentacionesByTipo);     

export default router; 