import express from 'express';
import {
  createMedicacion,
  getAllMedicaciones,
  getMedicacionById,
  updateMedicacion,
  deleteMedicacion,
  getMedicacionesByResidente,
  updateEstadoMedicacion,
  getMedicacionByFecha
} from '../controllers/medicacionController';
import { protect } from '../middleware/auth';
import {
  validateCreateMedicacion,
  validateUpdateMedicacion,
  validateEstadoMedicacion
} from '../middleware/medicacionValidation';

const router = express.Router();

router.use(protect);

router.post('/', validateCreateMedicacion, createMedicacion);
router.get('/', getAllMedicaciones);
router.get('/:id', getMedicacionById);
router.get('/byFecha/:fecha', getMedicacionByFecha);
router.put('/:id', validateUpdateMedicacion, updateMedicacion);
router.delete('/:id', deleteMedicacion);

router.get('/residente/:residente_id', getMedicacionesByResidente);
router.patch('/:id/estado', validateEstadoMedicacion, updateEstadoMedicacion);

export default router; 