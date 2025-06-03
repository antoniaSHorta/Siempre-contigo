import React from 'react';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButtons,
} from '@ionic/react';
import { chevronBackOutline, peopleOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminHome.css';

export const AdminHome: React.FC = () => {
    const router = useIonRouter();
    const { user } = useAuth();

    const goToUsers = () => {
        router.push('/admin/users', 'forward');
    };

    return (
        <IonPage className="admin-home-page">
            <IonHeader>
                <IonToolbar className="admin-home-toolbar">
                    <IonButtons slot="start">
                        <button className="admin-back-btn" onClick={() => router.push('/')}>
                            <IonIcon icon={chevronBackOutline} />
                        </button>
                    </IonButtons>
                    <IonTitle className="admin-title">Panel de Administración</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="admin-home-content">
                <div className="admin-home-welcome">
                    <h2>Bienvenido, {user?.name || 'Admin'}</h2>
                    <p>Gestiona tu hogar de reposo desde aquí</p>
                </div>

                <div className="admin-home-card-container">
                    <IonCard button onClick={goToUsers} className="admin-home-card">
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonIcon icon={peopleOutline} />
                                Gestión de Usuarios
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            Crear, editar o desactivar cuidadores y familiares.
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};
