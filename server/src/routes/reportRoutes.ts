
import { Router } from 'express';
import { generatePdfReport, listReports, getReportById, getReportPdfBase64 } from '../controllers/reportController';

const router = Router();

router.get('/resident/:residentId', listReports);


router.get('/:id', getReportById);
router.get('/:id/pdf/base64',getReportPdfBase64)

router.post('/generate/pdf/:residentId/:from/:to', generatePdfReport);

export default router;