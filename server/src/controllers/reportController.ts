import { Request, Response } from 'express';
import { Report } from '../models/Report';
import puppeteer from 'puppeteer';
import { Activity } from '../models/Activity';
import { Alimentacion } from '../models/Alimentacion';
import { Medicacion } from '../models/Medicacion';
import { generateReportHtml } from '../utils/generateReportHtml'

export const listReports = async (req: Request, res: Response) => {
    try {
        const { residentId } = req.params;
        const reports = await Report.findAll({
            where: { residentId },
            order: [['date', 'DESC']],
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error listing reports', error });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await Report.findByPk(id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error getting report', error });
    }
};

export const generatePdfReport = async (req: Request, res: Response) => {
    try {
        const { residentId, from, to } = req.params;
        const { userId, descripcion } = req.body;

        const startDate = new Date(from);
        const endDate = new Date(to);

        const activities = await Activity.findAll({
            where: {
                residente_id: residentId,
                fecha: { 
                $gte: startDate, 
                $lte: endDate 
                },
            },
            attributes: ['titulo', 'descripcion', 'fecha', 'lugar', 'estado', 'tipo'],
            order: [['fecha', 'ASC']],
        });

        const nutritionRecords = await Alimentacion.findAll({
            where: {
                residente_id: residentId,
                fecha_hora: {
                $gte: startDate,
                $lte: endDate,
                },
            },
            attributes: ['tipo', 'descripcion', 'hora', 'fecha_hora'],
            order: [['fecha_hora', 'ASC']],
        });

        const medicationRecords = await Medicacion.findAll({
            where: {
                residente_id: residentId,
                fecha_hora: {
                $gte: startDate,
                $lte: endDate,
                },
            },
            attributes: ['nombre', 'dosis', 'horario', 'fecha_hora', 'estado'],
            order: [['fecha_hora', 'ASC']],
        });

        const medication = medicationRecords.map((m) => ({
            name: m.nombre || '-',
            dose: m.dosis || '-',
            schedule: m.horario || '-',
            date: m.fecha_hora ? m.fecha_hora.toISOString().slice(0, 10) : '-',
            status: m.estado || '-',
        }));

        const nutrition = nutritionRecords
            .map((n) => `${n.tipo || '-'}: ${n.descripcion || '-'} (${n.hora || '-'})`)
            .join('<br>');

        const activitiesSummary = activities
            .map(
                (a) =>
                `<strong>${a.titulo}</strong> (${a.tipo}) - ${a.fecha.toISOString().slice(0, 10)}<br>${a.descripcion || ''}<br>Status: ${a.estado}<br><br>`
            )
            .join('');

        const htmlContent = generateReportHtml({
            residentId,
            from,
            to,
            medication,
            nutrition,
            activities: activitiesSummary,
        });

<<<<<<< HEAD
        console.log(htmlContent);

=======
>>>>>>> 003c797f0aa228765b767c48c58c9cc086b30fe7
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

<<<<<<< HEAD

        const pdfBuffer = await page.pdf({
            path: 'mypdf.pdf',
=======
        

        const pdfBuffer = await page.pdf({
>>>>>>> 003c797f0aa228765b767c48c58c9cc086b30fe7
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        });

<<<<<<< HEAD
        console.log(pdfBuffer);

        await Report.create({
            date: new Date(), 
            description: descripcion || `Reporte generado del ${from} al ${to}`,
            pdf: pdfBuffer,
            residentId: residentId,
            senderId: userId, 
=======
        await Report.create({
            fecha: new Date(), 
            descripcion: descripcion || `Reporte generado del ${from} al ${to}`,
            archivo_pdf: pdfBuffer,
            residente_id: residentId,
            emisor_id: userId, 
>>>>>>> 003c797f0aa228765b767c48c58c9cc086b30fe7
        });

        await browser.close();

<<<<<<< HEAD
        res.status(201).json({ message: 'PDF report generated successfully' });
=======
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=report_${residentId}_${from}_to_${to}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        return res.send(pdfBuffer);
>>>>>>> 003c797f0aa228765b767c48c58c9cc086b30fe7
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ message: 'Error generating PDF report', error });
    }
<<<<<<< HEAD
};

export const getReportPdfBase64 = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await Report.findByPk(id);
        if (!report || !report.pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        console.log(report.pdf);

        const base64 = report.pdf.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        res.json({ pdfBase64: dataUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving PDF', error });
    }
=======
>>>>>>> 003c797f0aa228765b767c48c58c9cc086b30fe7
};