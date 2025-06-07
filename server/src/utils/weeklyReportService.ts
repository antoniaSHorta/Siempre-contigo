import { Resident } from '../models/Resident';
import { Activity } from '../models/Activity';
import { Alimentacion } from '../models/Alimentacion';
import { Medicacion } from '../models/Medicacion';
import { Report } from '../models/Report';
import { User } from '../models/User';
import { generateReportHtml } from '../utils/generateReportHtml';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';


export const generateAndSaveWeeklyReports = async () => {
  const residents = await Resident.findAll();

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const admin = await User.findOne({ where: { role: 'Admin' } });

  for (const resident of residents) {
    const [activities, food, meds] = await Promise.all([
      Activity.findAll({ where: { residente_id: resident.id, fecha: { $between: [oneWeekAgo, now] } } }),
      Alimentacion.findAll({ where: { residente_id: resident.id, fecha_hora: { $between: [oneWeekAgo, now] } } }),
      Medicacion.findAll({ where: { residente_id: resident.id, fecha_hora: { $between: [oneWeekAgo, now] } } }),
    ]);

    const medication = meds.map((m) => ({
      name: m.nombre || '-',
      dose: m.dosis || '-',
      schedule: m.horario || '-',
      date: m.fecha_hora?.toISOString().slice(0, 10) || '-',
      status: m.estado || '-',
    }));

    const nutrition = food.map((n) =>
      `${n.tipo || '-'}: ${n.descripcion || '-'} (${n.hora || '-'})`
    ).join('<br>');

    const activitiesSummary = activities.map((a) =>
      `<strong>${a.titulo}</strong> (${a.tipo}) - ${a.fecha.toISOString().slice(0, 10)}<br>${a.descripcion || ''}<br>Status: ${a.estado}<br><br>`
    ).join('');

    const html = generateReportHtml({
        residentId: String(resident.id),
        from: oneWeekAgo.toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
        medication,
        nutrition,
        activities: activitiesSummary,
    });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await Report.create({
        date: new Date(), 
        description: `Reporte semanal enerado del ${oneWeekAgo} al ${now}`,
        pdf: buffer,
        residentId: resident.id,
        senderId: admin?.id, 
    });

    await browser.close();

    const pdfDir = path.resolve(__dirname, '../../pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

    const filePath = path.join(pdfDir, `reporte_${resident.id}_${Date.now()}.pdf`);
    fs.writeFileSync(filePath, buffer);
  }
};
