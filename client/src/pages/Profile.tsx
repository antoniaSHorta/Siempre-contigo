import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonAvatar, IonButton, IonIcon, useIonRouter, IonList, IonToggle, IonSelect, IonSelectOption, useIonToast } from '@ionic/react';
import { person, mail, call, location, notificationsOutline, languageOutline, moonOutline, shieldCheckmarkOutline, helpCircleOutline, informationCircleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import EditProfileModal, { ProfileData } from '../components/EditProfileModal';
import ChangePasswordModal, { PasswordData } from '../components/ChangePasswordModal';
import ToggleBar from '../components/ToggleBar';
import './Profile.css';
import logo from '../assets/logo.png';

const Profile: React.FC = () => {
  const { logout, user, updateProfile, updatePassword } = useAuth();
  const router = useIonRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [presentToast] = useIonToast();

  const handleLogout = async () => {
    await logout();
    router.push('/login', 'root', 'replace');
  };

  const initialProfileData: ProfileData = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  };

  const handleSaveProfile = async (profileData: ProfileData) => {
    console.log('handleSaveProfile called with:', profileData);
    try {
      await updateProfile(profileData);
      presentToast({
        message: 'Perfil actualizado exitosamente',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error) {
      console.error('Error en handleSaveProfile:', error);
      presentToast({
        message: error instanceof Error ? error.message : 'Error al actualizar el perfil',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleSavePassword = async (passwordData: PasswordData) => {
    try {
      await updatePassword(passwordData);
      presentToast({
        message: 'Contraseña actualizada exitosamente',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error) {
      presentToast({
        message: error instanceof Error ? error.message : 'Error al actualizar la contraseña',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      throw error; 
    }
  };

  return (
    <IonPage className="profile-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <ToggleBar />
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
                <p>{user?.phone || 'No disponible'}</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonIcon icon={location} slot="start" />
              <IonLabel>
                <h2>Ubicación</h2>
                <p>{user?.location || 'No disponible'}</p>
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
                <IonLabel slot="end">Español</IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={moonOutline} slot="start" />
                <IonLabel>Modo Oscuro</IonLabel>
                <IonToggle slot="end" />
              </IonItem>
              <IonItem>
                <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                <IonLabel>Cambiar Contraseña</IonLabel>
                <IonButton fill="clear" slot="end" className='profile-password-button' onClick={() => setIsPasswordModalOpen(true)}>
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
          <IonButton expand="block" className="profile-actions-button" onClick={() => setIsEditModalOpen(true)}>
            Editar Perfil
          </IonButton>
          <IonButton expand="block" fill="outline" color="medium" onClick={handleLogout}>
            Cerrar Sesión
          </IonButton>
        </div>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
          initialData={initialProfileData}
        />

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSave={handleSavePassword}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile; 