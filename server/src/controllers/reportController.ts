import { Request, Response } from 'express';
import { Report } from '../models/Report';
import puppeteer from 'puppeteer';
import { Activity } from '../models/Activity';
import { Alimentacion } from '../models/Alimentacion';
import { Medicacion } from '../models/Medicacion';
import { generateReportHtml } from '../utils/generateReportHtml'
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import path from 'path';
import fs from 'fs';

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
        const report = await Report.findByPk(id, {
            include: [
                { model: Resident, as: 'resident', attributes: ['id', 'nombre'] },
                { model: User, as: 'sender', attributes: ['id', 'name'] },
            ],
        });
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
        endDate.setUTCHours(23, 59, 59, 999); 

        const resident = await Resident.findByPk(residentId);
        if (!resident) return res.status(404).json({ message: 'Resident not found' });

        const user = await User.findByPk(userId)
        if (!user) return res.status(404).json({ message: 'User not found' });

        const activities = await Activity.findAll({
            where: {
                residente_id: residentId,
                fecha: { 
                [Op.gte]: startDate,
                [Op.lte]: endDate,
                },
            },
            attributes: ['titulo', 'descripcion', 'fecha', 'lugar', 'estado', 'tipo'],
            order: [['fecha', 'ASC']],
        });

        const nutritionRecords = await Alimentacion.findAll({
            where: {
                residente_id: residentId,
                fecha_hora: { 
                [Op.gte]: startDate,
                [Op.lte]: endDate,
                },
            },
            attributes: ['tipo', 'descripcion', 'hora', 'fecha_hora'],
            order: [['fecha_hora', 'ASC']],
        });

        const medicationRecords = await Medicacion.findAll({
            where: {
                residente_id: residentId,
                fecha_hora: { 
                [Op.gte]: startDate,
                [Op.lte]: endDate,
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
            .map((n) => `<strong>${n.tipo || '-'}</strong> (${n.fecha_hora?.toISOString().slice(0, 10) || '-'}): <br>${n.descripcion || '-'} a las ${n.hora}<br>`)
            .join('<br>');

        const activitiesSummary = activities
            .map(
                (a) =>
                `<strong>${a.titulo}</strong> (${a.tipo}) - ${a.fecha.toISOString().slice(0, 10)}<br>${a.descripcion || ''}<br>Estado: ${a.estado}<br><br>`
            )
            .join('');

        const htmlContent = generateReportHtml({
            resident: resident,
            sender: user,
            from,
            to,
            medication,
            nutrition,
            activities: activitiesSummary,
        });

        const logoFilePath = path.join(__dirname, '../assets/logo.png');

        const logoBase64 = fs.existsSync(logoFilePath)
            ? `data:image/png;base64,${fs.readFileSync(logoFilePath).toString('base64')}`
            : '';


        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });


        const pdfBufferRaw = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `
                <style>
                    .header {
                        font-size: 12px;
                        width: 100%;
                        text-align: center;
                        padding: 10px 0;
                        border-bottom: 1px solid #ccc;
                        font-family: Arial, sans-serif;
                        color: #2c3e50;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                </style>
                <div class="header">
                    <img src="${logoBase64}" style="height:30px; vertical-align:middle;"/>
                    <span>SiempreContigo - Reporte del Residente</span>
                </div>
                `,
            footerTemplate: `
                <style>
                    .footer {
                    font-size: 10px;
                    width: 100%;
                    text-align: center;
                    border-top: 1px solid #ccc;
                    padding: 5px 0;
                    font-family: Arial, sans-serif;
                    color: #555;
                    }
                </style>
                <div class="footer">
                    <span>Reporte generado el ${new Date().toLocaleDateString('es-CL')}</span>
                    <span style="float:right;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
                </div>
                `,
            margin: {
                top: '120px', // espacio para header
                bottom: '60px', // espacio para footer
                left: '40px',
                right: '40px',
            }
        });

        const pdfBuffer = Buffer.from(pdfBufferRaw);

        await Report.create({
            date: new Date(), 
            description: descripcion || `Reporte generado del ${from} al ${to}`,
            pdf: pdfBuffer,
            residentId: residentId,
            senderId: userId, 
        });

        await browser.close();

        res.status(201).json({ message: 'PDF report generated successfully' });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ message: 'Error generating PDF report', error });
    }
};

export const getReportPdfBase64 = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await Report.findByPk(id);
        if (!report || !report.pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        const base64 = report.pdf.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        res.json({ pdfBase64: dataUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving PDF', error });
    }
};