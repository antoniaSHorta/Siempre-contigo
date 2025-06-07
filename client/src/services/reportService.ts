import axios from 'axios';
import { endpoints } from '../config/api';

export async function listReportsByResident(residentId: number, token: string) {
    try {
        const response = await axios.get(endpoints.report.list(residentId), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en listReportsByResident:', error);
        throw error;
    }
}

export async function getReportById(reportId: number, token: string) {
    try {
        const response = await axios.get(endpoints.report.getById(reportId), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'json' 
        });
        return response.data;
    } catch (error) {
        console.error('Error en getReportById:', error);
        throw error;
    }
}

export async function generatePdfReport(
    residentId: number,
    from: string,
    to: string,
    descripcion: string,
    userId: number,
    token: string
) {
    try {
        const response = await axios.post(
            endpoints.report.generatePdf(residentId, from, to),
            { descripcion, userId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'json' 
            }
        );


        return response;
    } catch (error) {
        console.error('Error en generatePdfReport:', error);
        throw error;
    }
}

export async function getReportPdfBase64(reportId: number, token: string) {
    try {
        const response = await axios.get(endpoints.report.getPdfBase64(reportId), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error('Error en getReportPdfBase64:', error);
        throw error;
    }
}
