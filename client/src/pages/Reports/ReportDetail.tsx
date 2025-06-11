import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonText,
    IonLoading,
    IonButton,
    useIonRouter,
    IonItem,
    IonIcon,
    IonLabel,
} from '@ionic/react';

import {
    personCircleOutline,
    person,
    calendar,
    heart,
    home,
    logIn,
    statsChart,
    chevronBack,
    peopleOutline,
    paperPlane,
    book
} from 'ionicons/icons';
import { useLocation, useParams } from 'react-router-dom';
import { getReportById,getReportPdfBase64} from '../../services/reportService';
import Header from '../../components/Header';
import '../Admin/Styles/AdminEdit.css';
import '../Admin/Styles/AdminDetail.css';

import { IReport } from '../../interfaces/IReport';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const ReportDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const token = localStorage.getItem('token') || '';
    const router = useIonRouter();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const index = queryParams.get('index');

    const [report, setReport] = useState<IReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState(0);

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
        const fetchReport = async () => {
            try {
                const response = await getReportById(numericId, token);
                setReport(response);
                const base64 = await getReportPdfBase64(numericId, token);
                const base64String = base64.pdfBase64.split(',')[1]; 
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
        <IonPage className="admin-user-detail-page">
            <Header title="Detalle del Reporte" grayBackground />
            <div className="admin-user-detail-content">
                <div className="admin-user-detail-card">
                    {error && (
                        <IonText color="danger" className="admin-user-edit-message error">
                            <p>{error}</p>
                        </IonText>
                    )}

                    {report && (
                        <div className="admin-user-detail-items-container">
                            <IonText className="admin-user-edit-username">
                                <h2>Reporte #{index}</h2>
                            </IonText>
                            {report.date && (
                                <IonItem>
                                    <IonIcon icon={calendar} slot='start'/>
                                    <IonLabel>
                                        <h2>Fecha</h2>
                                        <p>{new Date(report.date).toLocaleDateString()}</p>
                                    </IonLabel>
                                </IonItem>
                                
                            )}
                            {report.description && (
                                <IonItem>
                                    <IonIcon icon={book} slot='start'/>
                                    <IonLabel>
                                        <h2>Descripción</h2>
                                        <p>{report.description}</p>
                                    </IonLabel>
                                </IonItem>
                            )}
                            <IonItem>
                                <IonIcon icon={person} slot='start'/>
                                <IonLabel>
                                    <h2>Residente</h2>
                                    <p>{report.resident?.nombre}</p>
                                </IonLabel>
                            </IonItem>
                            {report.sender && (
                                <IonItem>
                                    <IonIcon icon={person} slot='start'/>
                                    <IonLabel>
                                        <h2>Remitente</h2>
                                        <p>{report.sender?.name}</p>
                                    </IonLabel>
                                </IonItem>
                            )}

                            {pdfUrl && (
                                <button
                                    className="pdf-detail-button"
                                    onClick={() => window.open(pdfUrl, '_blank')}
                                >
                                    Ver PDF
                                </button>
                            )}
                            
                            <button
                                className="admin-user-detail-button"
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
                            </button>
                            <IonButton
                                expand="block"
                                fill="outline"
                                color="medium"
                                onClick={() => router.push(`/app/reports/resident/${report.resident.id}`)}
                            >
                                Volver
                            </IonButton>
                        </div>
                    )}
                </div>
            </div>
        </IonPage>
    );
};
