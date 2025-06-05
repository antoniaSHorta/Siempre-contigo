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
import Header from '../../components/Header';

export const AdminHome: React.FC = () => {
    const router = useIonRouter();
    const { user } = useAuth();

    const goToUsers = () => {
        router.push('/app/admin/users', 'forward');
    };

    const goToResidents = () => {
        router.push('/app/admin/residents', 'forward');
    };

    return (
        <IonPage className="admin-home-page">
            <Header title='Panel de Administración'></Header>
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

                    <IonCard button onClick={goToResidents} className="admin-home-card">
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonIcon icon={peopleOutline} />
                                Gestión de Residentes
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            Crear, editar o desactivar residentes.
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};
