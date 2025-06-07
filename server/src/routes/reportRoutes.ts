
import { Router } from 'express';
import { generatePdfReport, listReports, getReportById, getReportPdfBase64 } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect)

router.get('/resident/:residentId', listReports);

router.get('/:id', getReportById);
router.get('/:id/pdf/base64',getReportPdfBase64)

router.post('/generate/pdf/:residentId/:from/:to', generatePdfReport);

export default router;