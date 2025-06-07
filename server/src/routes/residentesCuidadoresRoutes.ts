import { Router } from 'express';
import { asignarCuidadores, eliminarCuidadores,actualizarCuidadores } from '../controllers/residentesCuidadoresController';
import { authorize, protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/:residenteId/cuidadores',authorize('Admin'), asignarCuidadores);
router.delete('/:residenteId/cuidadores/:cuidadorId',authorize('Admin'), eliminarCuidadores);
router.put('/:id/cuidadores',authorize('Admin'), actualizarCuidadores);

export default router;
