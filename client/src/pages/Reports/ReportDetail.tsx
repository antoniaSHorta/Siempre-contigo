import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonText,
    IonLoading,
    IonButton,
    useIonRouter,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { getReportById,getReportPdfBase64} from '../../services/reportService';
import Header from '../../components/Header';
import '../Admin/Styles/AdminEdit.css';

import { IReport } from '../../interfaces/IReport';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const ReportDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const token = localStorage.getItem('token') || '';
    const router = useIonRouter();

    const [report, setReport] = useState<IReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const base64ToBlob =(base64Data: string, contentType = 'application/pdf'): Blob  =>{
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    }

    useEffect(() => {
    return () => {
        if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        }
    };
    }, [pdfUrl]);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await getReportById(numericId, token);
                console.log(response.pdf.data)
                setReport(response);
                const base64 = await getReportPdfBase64(numericId, token);
                console.log(base64.pdfBase64)
                const base64String = base64.pdfBase64.split(',')[1]; // quitar el prefijo
                const blob = base64ToBlob(base64String);
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (err) {
                setError('No se pudo cargar el reporte.');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return <IonLoading isOpen={true} message="Cargando reporte..." />;

    return (
        <IonPage className="admin-user-edit-page">
            <Header title="Detalle del Reporte" grayBackground />
            <div className="admin-user-edit-content">
                <div className="admin-user-edit-container">
                    {error && (
                        <IonText color="danger" className="admin-user-edit-message error">
                            <p>{error}</p>
                        </IonText>
                    )}

                    {report && (
                        <>
                            <IonText className="admin-user-edit-username">
                                <h2>Reporte #{report.id}</h2>
                            </IonText>
                            {report.date && (
                                <p><strong>Fecha:</strong> {new Date(report.date).toLocaleDateString()}</p>
                            )}
                            {report.description && (
                                <p><strong>Descripción:</strong> {report.description}</p>
                            )}
                            <p><strong>Residente ID:</strong> {report.residentId}</p>
                            {report.senderId && (
                                <p><strong>Remitente ID:</strong> {report.senderId}</p>
                            )}

                            {pdfUrl && (
                                <div style={{ margin: '1rem 0' }}>
                                    <strong>Documento PDF:</strong>
                                    <iframe
                                        src={pdfUrl}
                                        title="Reporte PDF"
                                        width="100%"
                                        height="500px"
                                        style={{ border: '1px solid #ccc', marginTop: '0.5rem' }}
                                    />
                                    <IonButton
                                    expand="block"
                                    onClick={() => {
                                        if (pdfUrl) {
                                        const link = document.createElement('a');
                                        link.href = pdfUrl;
                                        link.download = `reporte_${report?.id}.pdf`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        }
                                    }}
                                    >
                                        Descargar PDF
                                    </IonButton>
                                </div>
                            )}

                            <IonButton
                                expand="block"
                                fill="outline"
                                color="medium"
                                onClick={() => router.push(`/app/reports/resident/${report.residentId}`)}
                            >
                                Volver
                            </IonButton>
                        </>
                    )}
                </div>
            </div>
        </IonPage>
    );
};
