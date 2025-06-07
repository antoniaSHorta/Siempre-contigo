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
    IonFabButton,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonButton
} from '@ionic/react';
import { closeCircle, documentTextOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import { IReport } from '../../interfaces/IReport';
import { generatePdfReport, listReportsByResident } from '../../services/reportService';
import Header from '../../components/Header';
import '../Admin/Styles/AdminUsers.css' 
import '../../components/Admin/AdminForm.css'

export const ResidentReportsList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const residentId = parseInt(id);
    const token = localStorage.getItem('token');
    const router = useIonRouter();

    const [reports, setReports] = useState<IReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [isFromDateModalOpen, setIsFromDateModalOpen] = useState(false);
    const [isToDateModalOpen, setIsToDateModalOpen] = useState(false);
    const [fromDateFilter, setFromDateFilter] = useState<string | null>(null);
    const [toDateFilter, setToDateFilter] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


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

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleGenerateReport = async () => {
        const to = new Date();
        const fromDate = new Date(to);
        fromDate.setDate(to.getDate() - 7);

        const from = formatDate(fromDate);
        const toStr = formatDate(to);

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

            await generatePdfReport(residentId, from, toStr, descripcion, userId, token!);

            await fetchReports();
            setToastMessage('Reporte generado');
        } catch (error) {
            setToastMessage('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    

    const filteredReports = reports.filter((report) => {
        if (!report.date) return false;
        const reportDate = new Date(report.date);

        const from = fromDateFilter ? new Date(fromDateFilter) : null;
        const to = toDateFilter ? new Date(toDateFilter) : null;

        return (!from || reportDate >= from) && (!to || reportDate <= to);
    });

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    return (
        <IonPage className="admin-users-page">
            <Header title="Reportes del residente" grayBackground />
            {(reports && !loading)&& (
                <div 
                className="admin-users-filters" 
                >
                    <IonItem className="admin-filter-item">
                        <IonLabel position="stacked">Desde</IonLabel>
                        <div
                            className="date-filter-display"
                            onClick={() => setIsFromDateModalOpen(true)}
                            style={{
                                padding: '8px', cursor: 'pointer', width: '100%' 
                            }}
                            
                        >
                            {fromDateFilter
                                ? new Date(fromDateFilter).toLocaleDateString()
                                : 'Seleccionar fecha'}
                        </div>
                        
                        <IonModal
                            isOpen={isFromDateModalOpen}
                            onDidDismiss={() => setIsFromDateModalOpen(false)}
                            className="date-picker-modal-form"
                        >
                            <div style={{ padding: '16px',overflowY: 'auto',alignItems: 'center', justifyContent: 'center' }}>
                                <IonDatetime
                                    presentation="date"
                                    value={fromDateFilter || ''}
                                    onIonChange={e => {
                                    const value = e.detail.value;
                                    if (typeof value === 'string') {
                                        setFromDateFilter(value);
                                    } else {
                                        setFromDateFilter(null);
                                    }
                                    }}
                                />
                                {fromDateFilter && (
                                    <div style={{ display: 'flex', justifyContent: 'center',alignItems:'center', marginTop: '12px' }}>
                                        <IonButton
                                        size="small"
                                        fill="outline"
                                        color="danger"
                                        onClick={() => {
                                            setFromDateFilter(null);
                                            setIsFromDateModalOpen(false);
                                        }}
                                        >
                                        Limpiar
                                        </IonButton>
                                    </div>
                                )}
                            </div>
                            
                        </IonModal>
                    </IonItem>
                    
                    <IonItem className="admin-filter-item">
                        <IonLabel position="stacked">Hasta</IonLabel>
                        <div
                            className="date-filter-display"
                            onClick={() => setIsToDateModalOpen(true)}
                            style={{
                                padding: '8px', cursor: 'pointer', width: '100%' 
                            }}
                        >
                            {toDateFilter
                                ? new Date(toDateFilter).toLocaleDateString()
                                : 'Seleccionar fecha'}
                            
                        </div>

                        <IonModal
                            isOpen={isToDateModalOpen}
                            onDidDismiss={() => setIsToDateModalOpen(false)}
                            className="date-picker-modal"
                        >
                            <div style={{ padding: '16px',overflowY: 'auto',alignItems: 'center', justifyContent: 'center' }}>
                                <IonDatetime
                                    presentation="date"
                                    value={toDateFilter || ''}
                                    onIonChange={e => {
                                    const value = e.detail.value;
                                    if (typeof value === 'string') {
                                        setToDateFilter(value);
                                    } else {
                                        setToDateFilter(null);
                                    }
                                    }}
                                />

                                {toDateFilter && (
                                    <div style={{ display: 'flex', justifyContent: 'center',alignItems:'center', marginTop: '12px' }}>
                                        <IonButton
                                        size="small"
                                        fill="outline"
                                        color="danger"
                                        onClick={() => {
                                            setToDateFilter(null);
                                            setIsToDateModalOpen(false);
                                        }}
                                        >
                                        Limpiar
                                        </IonButton>
                                    </div>
                                )}
                            </div>
                        </IonModal>
                    </IonItem>
                </div>
            )}
            <div className="admin-users-content">
                {loading ? (
                    <p className="admin-no-users-message">Cargando reportes...</p>
                ) : reports.length === 0 ? (
                    <p className="admin-no-users-message">No hay reportes disponibles.</p>
                ) : (
                    <IonList className="admin-users-list">
                        {paginatedReports.map((report, index) => (
                            <IonItem
                                key={report.id}
                                className="admin-users-item"
                                button
                                onClick={() => goToReportDetail(report.id)}
                            >
                                <IonAvatar className='large-avatar'>
                                    <IonIcon icon={documentTextOutline} className='report-avatar-icon' />
                                </IonAvatar>
                                <IonLabel>
                                    <h2 className="admin-users-name">Reporte {index + 1 + (currentPage - 1) * itemsPerPage}</h2>
                                    <p className="admin-users-email">{report.date ? new Date(report.date).toLocaleDateString() : 'Sin fecha'}</p>
                                    <p className="admin-users-role">{report.description || 'Sin descripción'}</p>
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </div>

            {(totalPages > 1 && !loading) && (
                <div className="admin-users-pagination-fixed">
                    <div className="admin-users-pagination">
                        <IonItem className='admin-filter-item'>
                            <IonLabel>Página</IonLabel>
                            <IonSelect
                                interface="popover"
                                value={currentPage}
                                onIonChange={(e) => setCurrentPage(Number(e.detail.value))}
                            >
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <IonSelectOption key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    </div>
                </div>
            )}

            {!loading&& (
                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="admin-users-fab">
                    <IonFabButton onClick={handleGenerateReport}>
                        <IonIcon icon={documentTextOutline} />
                    </IonFabButton>
                </IonFab>
            )}
            

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
