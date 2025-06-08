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
  if(!admin) return;

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
        resident: resident,
        sender: admin,
        from: oneWeekAgo.toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
        medication,
        nutrition,
        activities: activitiesSummary,
    });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBufferRaw = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    const pdfBuffer = Buffer.from(pdfBufferRaw);

    await Report.create({
        date: new Date(), 
        description: `Reporte semanal generado del ${oneWeekAgo} al ${now}`,
        pdf: pdfBuffer,
        residentId: resident.id,
        senderId: admin?.id, 
    });

    await browser.close();
  }
};
