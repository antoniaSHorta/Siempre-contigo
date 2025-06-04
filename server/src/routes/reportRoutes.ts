
import { Router } from 'express';
import { generatePdfReport, listReports, getReportById } from '../controllers/reportController';

const router = Router();

router.get('/resident/:residentId', listReports);


router.get('/:id', getReportById);

router.get('/generate/pdf/:residentId/:from/:to', generatePdfReport);

export default router;