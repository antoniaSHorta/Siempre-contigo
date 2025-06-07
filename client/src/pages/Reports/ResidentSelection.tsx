import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToast,
    IonAvatar
} from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { IResident } from '../../interfaces/IResident';
import { getAllResidents, getAllResidentsInactiveAndActive } from '../../services/residentService'; 
import Header from '../../components/Header';
import '../Admin/Styles/AdminUsers.css' 

export const ResidentSelection: React.FC = () => {
    const router = useIonRouter();
    const token = localStorage.getItem('token');
    const [residents, setResidents] = useState<IResident[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [searchName, setSearchName] = useState('');
    const [filterState, setFilterState] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const residentsPerPage = 5;

    const role = localStorage.getItem('role'); 
    const userId = Number(localStorage.getItem('userId'));

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterState, searchName]);

    const fetchResidents = async () => {
        try {
            setLoading(true);
            const data = await getAllResidents(token!);

            let filteredData = data;

            if (role === 'Cuidador') {
                filteredData = data.filter((resident: IResident) =>
                    resident.cuidadores?.some((c: any) => c.id === userId)
                );
            } else if (role === 'Familiar') {
                filteredData = data.filter((resident: IResident) =>
                    resident.familiares?.some((f: any) => f.id === userId)
                );
            }

            setResidents(filteredData);
        } catch (err) {
            setToastMessage('Error al cargar residentes');
        } finally {
            setLoading(false);
        }
    };

    const filteredResidents = residents.filter(resident => {
        const matchState = filterState === 'Todos' || resident.estado_salud === filterState;
        const matchName = resident.nombre?.toLowerCase().includes(searchName.toLowerCase());
        return matchState && matchName;
    });

    const totalPages = Math.ceil(filteredResidents.length / residentsPerPage);
    const indexOfLast = currentPage * residentsPerPage;
    const indexOfFirst = indexOfLast - residentsPerPage;
    const currentResidents = filteredResidents.slice(indexOfFirst, indexOfLast);

    const goToResidentReports = (id: number) => {
        router.push(`/app/reports/resident/${id}`, 'forward');
    };

    return (
        <IonPage className="admin-users-page">
            <Header title="Seleccionar residente" grayBackground />

            <div className="admin-users-filters">
                <IonItem className="admin-filter-item">
                    <IonInput
                        label="Buscar por nombre"
                        labelPlacement="stacked"
                        placeholder="Ej: Carmen López"
                        value={searchName}
                        onIonInput={(e) => setSearchName(e.detail.value!)}
                    />
                </IonItem>
                <IonItem className="admin-filter-item">
                    <IonSelect
                        label="Filtrar por estado"
                        labelPlacement="stacked"
                        interface="popover"
                        value={filterState}
                        onIonChange={(e) => setFilterState(e.detail.value)}
                    >
                        <IonSelectOption value="Todos">Todos</IonSelectOption>
                        <IonSelectOption value="Bueno">Bueno</IonSelectOption>
                        <IonSelectOption value="Regular">Regular</IonSelectOption>
                        <IonSelectOption value="Delicado">Delicado</IonSelectOption>
                        <IonSelectOption value="Crítico">Crítico</IonSelectOption>
                        <IonSelectOption value="Recuperación">Recuperación</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </div>

            <div className="admin-users-content">
                {loading ? (
                    <p>Cargando residentes...</p>
                ) : currentResidents.length === 0 ? (
                    <p className="admin-no-users-message">No hay residentes disponibles.</p>
                ) : (
                    <IonList className="admin-users-list">
                        {currentResidents.map(resident => (
                            <IonItem
                                key={resident.id}
                                className="admin-users-item"
                                lines="inset"
                                button
                                onClick={() => goToResidentReports(resident.id)}
                            >
                                <IonAvatar slot="start">
                                    <IonIcon icon={personCircleOutline} style={{ fontSize: '32px' }} />
                                </IonAvatar>
                                <IonLabel>
                                    <h2 className="admin-users-name">{resident.nombre}</h2>
                                    <p>Habitación: {resident.habitacion || 'N/A'}</p>
                                    <p>Estado: {resident.estado_salud || 'N/A'}</p>
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </div>

            {filteredResidents.length > 0 && (
                <div className="admin-users-pagination-fixed">
                    <div className="admin-users-pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="admin-users-pagination-btn"
                        >
                            Anterior
                        </button>
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <button
                                    key={pageNumber}
                                    className={`admin-users-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="admin-users-pagination-btn"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
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
