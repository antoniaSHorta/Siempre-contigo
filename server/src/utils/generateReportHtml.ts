import path from "path";
import { Resident } from "../models/Resident";
import { User } from "../models/User";
import fs from 'fs';

interface ReportData {
    resident: Resident;
    sender: User;
    from: string;
    to: string;
    medication: {
        name: string;
        dose: string;
        schedule: string;
        date: string;
        status: string;
    }[];
    nutrition: string;
    activities: string;  
}

export function generateReportHtml(data: ReportData): string {
    const { resident,sender, from, to, medication, nutrition, activities } = data;

    const logoFilePath = path.join(__dirname, '../assets/logo.png');

    const logoBase64 = fs.existsSync(logoFilePath)
        ? `data:image/png;base64,${fs.readFileSync(logoFilePath).toString('base64')}`
        : '';

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <title>Reporte del Residente ${resident.nombre}</title>
        <style>
        @media print {
            body {
                margin: 160px 40px 40px 40px;
            }
        }

        body {
            font-family: Arial, sans-serif;
            margin: 160px 40px 40px 40px;
        }

        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 100px;
            display: flex;
            align-items: center;
            border-bottom: 2px solid #2c3e50;
            padding: 10px 40px;
            background-color: #fff;
        }

        header img {
            height: 60px;
            margin-right: 20px;
        }

        header h1 {
            font-size: 22px;
            margin: 0;
            color: #2c3e50;
        }

        h2 {
            color: #2c3e50;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .section {
            margin-bottom: 40px;
        }
        </style>
    </head>
    <body>

        <header>
            <img src="${logoBase64}" alt="Logo">
            <h1>SiempreContigo - Reporte del Residente</h1>
        </header>
        <main>
            <h2>Información del Residente</h2>
            <p><strong>Nombre:</strong> ${resident.nombre}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${resident.nacimiento?.toISOString().slice(0, 10) || 'N/A'}</p>
            <p><strong>Fecha de Ingreso:</strong> ${resident.ingreso?.toISOString().slice(0, 10) || 'N/A'}</p>
            <p><strong>Número de habitación:</strong> ${resident.habitacion || 'N/A'}</p>
            <p><strong>Estado de salud:</strong> ${resident.estado_salud || 'N/A'}</p>
            <p><strong>Período del reporte:</strong> del ${from} al ${to}</p>

            <div class="section">
                <h2>Medicamentos</h2>
                ${
                    medication.length > 0
                    ? `<table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Dosis</th>
                                <th>Horario</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medication.map((m) => `
                                <tr>
                                    <td>${m.name}</td>
                                    <td>${m.dose}</td>
                                    <td>${m.schedule}</td>
                                    <td>${m.date}</td>
                                    <td>${m.status}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>`
                    : '<p>No se encontraron registros de medicamentos para este período.</p>'
                }
            </div>

            <div class="section">
                <h2>Alimentación</h2>
                ${nutrition ? `<p>${nutrition}</p>` : '<p>No se encontraron registros de alimentación para este período.</p>'}
            </div>

            <div class="section">
                <h2>Actividades</h2>
                ${activities ? `<div>${activities}</div>` : '<p>No se encontraron actividades para este período.</p>'}
            </div>
        </main>

        <footer>
            <p>Reporte generado el ${new Date().toLocaleDateString('es-CL')}</p>
        </footer>
    </body>
    </html>
    `;
}

