import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonText,
    IonLoading,
    useIonRouter,
    IonButtons,
    IonItem,
    IonLabel,
} from '@ionic/react';

import { useParams} from 'react-router-dom';
import { getUserByIdAdmin, toggleStatusUser,updateUserAdmin } from '../../../services/adminService'; 
import { IUser } from '../../../interfaces/IUser';
import { chevronBackOutline, personCircleOutline, statsChart } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { person, mail, call, location, clipboard, sync, globe} from 'ionicons/icons';
import '../Styles/AdminDetail.css';
import Header from '../../../components/Header';

export const AdminUserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const router = useIonRouter();
    const token = localStorage.getItem('token') || '';

    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusLoading, setStatusLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserByIdAdmin(numericId, token);
                setUser(response.user);
            } catch (err) {
                setError('No se pudo cargar el usuario.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [numericId, token]);

    const handleToggleStatus = async () => {
        setStatusLoading(true);
        try {
            if(user!=null){
                await toggleStatusUser( numericId, token!, !user.isActive);
                setUser(prev  => prev ? { ...prev, isActive: !prev.isActive } : prev);
            }
        } catch (err) {
            setError('Error al cambiar el estado del usuario.');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleReturn = () => {
        router.push(`/app/admin/users`, 'forward');
        window.location.reload();
    }

    if (loading) return <IonLoading isOpen={true} message="Cargando..." />;

    return (
        <IonPage className="admin-user-detail-page">
            <Header title='Detalle del usuario' grayBackground/>
            <div className="admin-user-detail-content">
                {user && (
                <div className='admin-user-detail-card'>
                    <IonIcon
                        icon={personCircleOutline}
                        className="admin-user-detail-avatar-icon"
                    />
                    <div className="admin-user-detail-items-container">
                        <IonItem>
                            <IonIcon icon={person} slot="start" />
                            <IonLabel>
                                <h2>Nombre completo</h2>
                                <p>{user?.name || 'No disponible'}</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem>
                            <IonIcon icon={mail} slot="start" />
                            <IonLabel>
                                <h2>Email</h2>
                                <p>{user?.email || 'No disponible'}</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem>
                            <IonIcon icon={call} slot="start" />
                            <IonLabel>
                                <h2>Teléfono</h2>
                                <p>{user?.phone || 'No disponible'}</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem>
                            <IonIcon icon={location} slot="start" />
                            <IonLabel>
                                <h2>Dirección</h2>
                                <p>{user?.location || 'No disponible'}</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem>
                            <IonIcon icon={statsChart} slot="start" />
                            <IonLabel>
                                <h2>Estado</h2>
                                <p>{user?.isActive ? 'Activo' : 'Inactivo'}</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem>
                            <IonIcon icon={globe} slot="start" />
                            <IonLabel>
                                <h2>Conectado</h2>
                                <p>{user?.isConnected ? 'Sí' : 'No'}</p>
                            </IonLabel>
                        </IonItem>
                    </div>

                    <button
                        className="admin-user-detail-button"
                        onClick={() => {
                            router.push(`/app/admin/users/edit/${numericId}`);
                            window.location.reload();
                        }}
                    >
                        Editar Usuario
                    </button>

                    <button
                        className={`admin-user-detail-button ${user.isActive ? 'danger' : 'success'}`}
                        onClick={handleToggleStatus}
                        disabled={statusLoading}
                    >
                    {statusLoading
                        ? 'Procesando...'
                        : user.isActive
                        ? 'Desactivar Usuario'
                        : 'Activar Usuario'}
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
