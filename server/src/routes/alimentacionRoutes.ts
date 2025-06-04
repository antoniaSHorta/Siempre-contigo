import express from 'express';
import {
  createAlimentacion,
  getAllAlimentaciones,
  getAlimentacionById,
  updateAlimentacion,
  deleteAlimentacion,
  getAlimentacionesByTipo,
  getAlimentacionesByResidente,
  getAlimentacionesByFecha,
} from '../controllers/alimentacionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createAlimentacion);                  
router.get('/', getAllAlimentaciones);                 
router.get('/:id', getAlimentacionById);  
router.get('/byFecha/:fecha', getAlimentacionesByFecha);              
router.put('/:id', updateAlimentacion);               
router.delete('/:id', deleteAlimentacion);            

router.get('/tipo/:tipo', getAlimentacionesByTipo);     
router.get('/residente/:residente_id', getAlimentacionesByResidente);

export default router; 