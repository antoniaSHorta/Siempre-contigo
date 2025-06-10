import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonLoading,
    useIonRouter,
    IonList,
    IonListHeader,
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
} from 'ionicons/icons';

import { useParams } from 'react-router-dom';
import { IResident } from '../../../interfaces/IResident';
import { getResidentById, deleteResident, activateResident } from '../../../services/residentService'; // ajusta según corresponda
import Header from '../../../components/Header';
import '../Styles/AdminDetail.css';

const AdminResidentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const router = useIonRouter();
    const token = localStorage.getItem('token') || '';

    const [resident, setResident] = useState<IResident | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusLoading, setStatusLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchResident = async () => {
            try {
                const response = await getResidentById(numericId, token);
                setResident(response);
            } catch (err) {
                setError('No se pudo cargar el residente.');
            } finally {
                setLoading(false);
            }
        };
        fetchResident();
    }, [numericId, token]);

    const handleToggleStatus = async () => {
        setStatusLoading(true);
        try {
            if (resident != null) {
                if(resident.activo) await deleteResident(resident.id, token!);
                else await activateResident(resident.id, token!);
                setResident(prev => prev ? { ...prev, activo: !prev.activo } : prev);
            }
        } catch (err) {
            setError('Error al cambiar el estado del residente.');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleReturn = () => {
        router.push(`/app/admin/residents`, 'forward');
        window.location.reload();
    }

    if (loading) return <IonLoading isOpen={true} message="Cargando..." />;

    return (
        <IonPage className="admin-user-detail-page">
            <Header title="Detalle del residente" grayBackground/>
            <div className="admin-user-detail-content">
                {resident && (
                    <div className="admin-user-detail-card">
                        <IonIcon
                            icon={personCircleOutline}
                            className="admin-user-detail-avatar-icon"
                        />
                        <div className="admin-user-detail-items-container">
                            <IonItem>
                                <IonIcon icon={person} slot="start" />
                                <IonLabel>
                                    <h2>Nombre completo</h2>
                                    <p>{resident.nombre || 'No disponible'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={calendar} slot="start" />
                                <IonLabel>
                                    <h2>Fecha de nacimiento</h2>
                                    <p>{resident.nacimiento || 'No disponible'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={heart} slot="start" />
                                <IonLabel>
                                    <h2>Estado de salud</h2>
                                    <p>{resident.estado_salud || 'No disponible'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={home} slot="start" />
                                <IonLabel>
                                    <h2>Habitación</h2>
                                    <p>{resident.habitacion || 'No disponible'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={logIn} slot="start" />
                                <IonLabel>
                                    <h2>Fecha de ingreso</h2>
                                    <p>{resident.ingreso || 'No disponible'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonIcon icon={statsChart} slot="start" />
                                <IonLabel>
                                    <h2>Estado</h2>
                                    <p>{resident.activo ? 'Activo' : 'Inactivo'}</p>
                                </IonLabel>
                            </IonItem>

                            <IonList>
                                    <IonLabel>
                                        <h2>
                                            <IonIcon icon={peopleOutline} /> Cuidadores asignados
                                        </h2>
                                    {resident.cuidadores != null && resident.cuidadores.length > 0 ? (
                                        resident.cuidadores.map((cuidador) => (
                                            <IonItem key={cuidador.id}>
                                                <IonLabel>
                                                    <p >{cuidador.name}</p>
                                                </IonLabel>
                                            </IonItem>
                                        ))
                                    ) : (
                                        <IonItem>No hay cuidadores asignados</IonItem>
                                    )}
                                </IonLabel>
                            </IonList>

                            <IonList>
                                <IonLabel>
                                    <h2>
                                        <IonIcon icon={peopleOutline} /> Familiares asignados
                                    </h2>
                                {resident.familiares != null && resident.familiares.length > 0 ? (
                                    resident.familiares.map((familiar) => (
                                        <IonItem key={familiar.id}>
                                            <IonLabel>
                                                <p >{familiar.name}</p>
                                            </IonLabel>
                                        </IonItem>
                                    ))
                                ) : (
                                    <IonItem>No hay familiares asignados</IonItem>
                                )}
                                </IonLabel>
                            </IonList>
                        </div>

                        

                        <button
                            className="admin-user-detail-button"
                            onClick={() => {
                                router.push(`/app/admin/residents/edit/${numericId}`)
                                window.location.reload();
                            }}
                        >
                            Editar Residente
                        </button>

                        <button
                            className={`admin-user-detail-button ${resident.activo ? 'danger' : 'success'}`}
                            onClick={handleToggleStatus}
                            disabled={statusLoading}
                        >
                            {statusLoading
                                ? 'Procesando...'
                                : resident.activo
                                ? 'Desactivar Residente'
                                : 'Activar Residente'}
                        </button>

                        <IonButton
                            expand="block"
                            fill="outline"
                            color="medium"
                            onClick={handleReturn}
                        >
                            Cancelar
                        </IonButton>
                    </div>
                )}
            </div>
        </IonPage>
    );
};

export default AdminResidentDetail;
