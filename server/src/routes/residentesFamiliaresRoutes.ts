import { Router } from 'express';
import { asignarFamiliares, eliminarFamiliares, actualizarFamiliares} from '../controllers/residentesFamiliaresController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/:residenteId/familiares', asignarFamiliares);
router.delete('/:residenteId/familiares/:familiarId', eliminarFamiliares);
router.put('/:id/familiares', actualizarFamiliares);

export default router;