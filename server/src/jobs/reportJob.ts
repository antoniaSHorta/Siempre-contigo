import cron from 'node-cron';
import { generateAndSaveWeeklyReports } from '../utils/weeklyReportService';

export const startWeeklyReportJob = () => {
  cron.schedule('0 0 * * 1', async () => {
    console.log('📅 Generando reportes semanales...');
    await generateAndSaveWeeklyReports();
  });
};