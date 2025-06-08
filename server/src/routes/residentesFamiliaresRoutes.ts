import { Router } from 'express';
import { asignarFamiliares, eliminarFamiliares, actualizarFamiliares} from '../controllers/residentesFamiliaresController';
import { authorize, protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/:residenteId/familiares',authorize('Admin'), asignarFamiliares);
router.delete('/:residenteId/familiares/:familiarId',authorize('Admin'), eliminarFamiliares);
router.put('/:id/familiares',authorize('Admin'), actualizarFamiliares);

export default router;