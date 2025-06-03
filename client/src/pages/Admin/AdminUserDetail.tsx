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
} from '@ionic/react';

import { useParams} from 'react-router-dom';
import { getUserByIdAdmin, toggleStatusUser,updateUserAdmin } from '../../services/adminService'; 
import { IUser } from '../../interfaces/IUser';
import { chevronBackOutline, personCircleOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import './AdminUserDetail.css'

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

    if (loading) return <IonLoading isOpen={true} message="Cargando..." />;

    return (
        <IonPage className="admin-user-detail-page">
            <IonHeader className="admin-user-detail-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <button className="admin-back-btn" onClick={() => router.push('/admin/users')}>
                            <IonIcon icon={chevronBackOutline} />
                        </button>
                    </IonButtons>
                <IonTitle>Detalle del Usuario</IonTitle>
                </IonToolbar>
            </IonHeader>
            <div className="admin-user-detail-content">
                {user && (
                <div className='admin-user-detail-card'>
                    <IonIcon
                        icon={personCircleOutline}
                        className="admin-user-detail-avatar-icon"
                    />
                    <IonText className="admin-user-detail-info">
                        <p><strong>ID:</strong> {user.id ? user.id : 'Error al encontrar usuario'}</p>
                        <p><strong>Estado:</strong> {user.isActive ? 'Activo' : 'Inactivo'}</p>
                        <p><strong>Conectado:</strong> {user.isConnected ? 'Sí' : 'No'}</p>
                        <p><strong>Creado:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Sin información'}</p>
                        <p><strong>Actualizado:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Sin información'}</p>
                    </IonText>

                    <button
                        className="admin-user-detail-button"
                        onClick={() => router.push(`/admin/users/edit/${numericId}`)}
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
                </div>
                )}
            </div>
        </IonPage>
    );
};
