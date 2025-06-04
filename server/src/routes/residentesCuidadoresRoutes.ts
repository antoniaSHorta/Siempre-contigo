import { Router } from 'express';
import { asignarCuidadores, eliminarCuidadores,actualizarCuidadores } from '../controllers/residentesCuidadoresController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/:residenteId/cuidadores', asignarCuidadores);
router.delete('/:residenteId/cuidadores/:cuidadorId', eliminarCuidadores);
router.put('/:id/cuidadores', actualizarCuidadores);

export default router;
