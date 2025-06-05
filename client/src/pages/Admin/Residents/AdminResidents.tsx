import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonFab,
    IonFabButton,
    IonToast,
    IonInput,
    IonButtons,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import {
    eyeOutline,
    pencilOutline,
    personRemoveOutline,
    personAddOutline,
    refreshOutline
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { IResident } from '../../../interfaces/IResident';
import { activateResident, deleteResident, getAllResidentsInactiveAndActive, updateResident } from '../../../services/residentService'; 
import Header from '../../../components/Header';
import '../Styles/AdminUsers.css'; 

export const AdminResidents: React.FC = () => {
    const router = useIonRouter();
    const token = localStorage.getItem('token');
    const [residents, setResidents] = useState<IResident[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [searchName, setSearchName] = useState('');
    const [filterState, setFilterState] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const residentsPerPage = 5;

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterState,searchName]);

    const fetchResidents = async () => {
        try {
            setLoading(true);
            const data = await getAllResidentsInactiveAndActive(token!); 
            setResidents(data);
            setCurrentPage(1);
        } catch (err) {
            setToastMessage('Error al cargar residentes');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (residentId: number, isActive: boolean) => {
        try {
            if(isActive) await deleteResident(residentId, token!);
            else await activateResident(residentId, token!);
            setToastMessage(`Residente ${!isActive ? 'activado' : 'desactivado'} correctamente`);
            fetchResidents();
            console.log(residents)
        } catch (err) {
            setToastMessage('No se pudo actualizar el estado del residente');
        }
    };

    const filteredResidents = residents.filter(resident =>{
        const matchState = filterState === 'Todos' || resident.estado_salud==filterState;
        const matchName = resident.nombre?.toLowerCase().includes(searchName.toLowerCase());
        return matchState && matchName;
    }
        
    );

    const totalPages = Math.ceil(filteredResidents.length / residentsPerPage);
    const indexOfLast = currentPage * residentsPerPage;
    const indexOfFirst = indexOfLast - residentsPerPage;
    const currentResidents = filteredResidents.slice(indexOfFirst, indexOfLast);

    const goToAddResident = () => router.push('/app/admin/residents/add', 'forward');
    const goToEditResident = (id: number) => router.push(`/app/admin/residents/edit/${id}`, 'forward');
    const goToDetailResident = (id: number) => router.push(`/app/admin/residents/detail/${id}`, 'forward');

    return (
        <IonPage className="admin-users-page">
            <Header title='Residentes' />
            {residents.length > 0 && (
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
            )}

            <div className="admin-users-content">
                {loading ? (
                    <p>Cargando residentes...</p>
                ) : currentResidents.length === 0 ? (
                    <p className="admin-no-users-message">No hay residentes disponibles.</p>
                ) : (
                    <IonList className="admin-users-list">
                        {currentResidents.map(resident => (
                            <IonItem key={resident.id} className="admin-users-item" lines="inset">
                                <IonLabel>
                                    <h2 className="admin-users-name">{resident.nombre}</h2>
                                    <p className="admin-users-email">Habitación: {resident.habitacion || 'N/A'}</p>
                                    <p className="admin-users-role">Estado: {resident.estado_salud || 'N/A'}</p>
                                </IonLabel>
                                <IonButtons>
                                    <IonButton className='admin-users-btn-detail' onClick={() => goToDetailResident(resident.id)}>
                                        <IonIcon icon={eyeOutline} />
                                    </IonButton>
                                    <IonButton className='admin-users-btn-edit' onClick={() => goToEditResident(resident.id)}>
                                        <IonIcon icon={pencilOutline} />
                                    </IonButton>
                                    <IonButton
                                        onClick={() => handleToggleStatus(resident.id, resident.activo)}
                                        className={`admin-users-btn-status ${resident.activo ? 'active' : 'inactive'}`}
                                    >
                                        <IonIcon icon={resident.activo ? personRemoveOutline : refreshOutline} />
                                    </IonButton>

                                </IonButtons>
                                
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </div>
            
            {residents.length > 0 && (
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

            <IonFab vertical="bottom" slot="fixed" className="admin-users-fab">
                <IonFabButton onClick={goToAddResident}>
                    <IonIcon icon={personAddOutline} />
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
