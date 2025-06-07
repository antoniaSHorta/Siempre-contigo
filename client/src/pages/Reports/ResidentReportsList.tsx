import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToast,
    IonAvatar,
    IonIcon,
    IonFab,
    IonFabButton
} from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import { IReport } from '../../interfaces/IReport';
import { generatePdfReport, listReportsByResident } from '../../services/reportService';
import Header from '../../components/Header';
import '../Admin/Styles/AdminUsers.css' 

export const ResidentReportsList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const residentId = parseInt(id);
    const token = localStorage.getItem('token');
    const router = useIonRouter();

    const [reports, setReports] = useState<IReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    console.log(reports)

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await listReportsByResident(residentId, token!);
            setReports(data);
        } catch (error) {
            setToastMessage('Error al cargar reportes del residente');
        } finally {
            setLoading(false);
        }
    };

    const goToReportDetail = (reportId: number) => {
        router.push(`/app/reports/detail/${reportId}`, 'forward');
    };

    const handleGenerateReport = async () => {
        const to = new Date();
        const fromDate = new Date(to);
        fromDate.setDate(to.getDate() - 7);

        const from = fromDate.toISOString().split('T')[0];
        const toStr = to.toISOString().split('T')[0];

        const descripcion = 'Reporte de la última semana';
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = parseInt(user.id);

        if (!userId) {
            setToastMessage('No se pudo obtener el usuario actual');
            return;
        }

        try {
            setLoading(true);

            const response = await generatePdfReport(residentId, from, toStr, descripcion, userId, token!);

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte_${residentId}_${toStr}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            await fetchReports();
            setToastMessage('Reporte generado y descargado');
        } catch (error) {
            setToastMessage('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage className="admin-users-page">
            <Header title="Reportes del residente" grayBackground />

            <IonContent>
                <div className="admin-users-content">
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Cargando reportes...</p>
                    ) : reports.length === 0 ? (
                        <p className="admin-no-users-message">No hay reportes disponibles.</p>
                    ) : (
                        <IonList className="admin-users-list">
                            {reports.map((report, index) => (
                                <IonItem
                                    key={report.id}
                                    className="admin-users-item"
                                    button
                                    onClick={() => goToReportDetail(report.id)}
                                >
                                    <IonAvatar slot="start">
                                        <IonIcon icon={documentTextOutline} style={{ fontSize: '28px' }} />
                                    </IonAvatar>
                                    <IonLabel>
                                        <h2 className="admin-users-name">Reporte {index + 1}</h2>
                                        <p>{report.date ? new Date(report.date).toLocaleDateString() : 'Sin fecha'}</p>
                                        <p>{report.description || 'Sin descripción'}</p>
                                    </IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    )}
                </div>
            </IonContent>
            <IonFab vertical="bottom" horizontal="end" slot="fixed" className="admin-users-fab">
                <IonFabButton onClick={handleGenerateReport}>
                    <IonIcon icon={documentTextOutline} />
                </IonFabButton>
            </IonFab>

            <IonToast
                isOpen={!!toastMessage}
                message={toastMessage}
                duration={2000}
                onDidDismiss={() => setToastMessage('')}
                position="bottom"
            />
        </IonPage>
    );
};
