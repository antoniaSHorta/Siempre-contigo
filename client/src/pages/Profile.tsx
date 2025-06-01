import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonAvatar, IonButton, IonIcon, useIonRouter, IonList, IonToggle, IonSelect, IonSelectOption } from '@ionic/react';
import { person, mail, call, location, notificationsOutline, languageOutline, moonOutline, shieldCheckmarkOutline, helpCircleOutline, informationCircleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';
import logo from '../assets/logo.png';

const Profile: React.FC = () => {
  const { logout, user } = useAuth();
  const router = useIonRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login', 'root', 'replace');
  };

  return (
    <IonPage className="profile-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Perfil</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="profile-header">
          <IonAvatar className="profile-avatar">
            <img src="https://i.pravatar.cc/150" alt="Profile" />
          </IonAvatar>
          <h2 className="profile-name">{user?.name || 'Usuario'}</h2>
          <p className="profile-role">{user?.role || 'Participante'}</p>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información Personal</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonIcon icon={person} slot="start" />
              <IonLabel>
                <h2>Nombre Completo</h2>
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
                <p>+56 9 90878856</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonIcon icon={location} slot="start" />
              <IonLabel>
                <h2>Ubicación</h2>
                <p>Chile</p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configuraciones</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={notificationsOutline} slot="start" />
                <IonLabel>Notificaciones</IonLabel>
                <IonToggle slot="end" />
              </IonItem>
              <IonItem>
                <IonIcon icon={languageOutline} slot="start" />
                <IonLabel>Idioma</IonLabel>
                <IonSelect value="es" slot="end">
                  <IonSelectOption value="es">Español</IonSelectOption>
                  <IonSelectOption value="en">English</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonIcon icon={moonOutline} slot="start" />
                <IonLabel>Modo Oscuro</IonLabel>
                <IonToggle slot="end" />
              </IonItem>
              <IonItem>
                <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                <IonLabel>Cambiar Contraseña</IonLabel>
                <IonButton fill="clear" slot="end">
                  Cambiar
                </IonButton>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Ayuda y Soporte</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={helpCircleOutline} slot="start" />
                <IonLabel>Centro de Ayuda</IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={informationCircleOutline} slot="start" />
                <IonLabel>Acerca de</IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <div className="profile-actions">
          <IonButton expand="block" color="primary">
            Editar Perfil
          </IonButton>
          <IonButton expand="block" fill="outline" color="medium" onClick={handleLogout}>
            Cerrar Sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile; 