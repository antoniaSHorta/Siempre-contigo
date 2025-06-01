import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import './EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  initialData: ProfileData;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialData);

  useEffect(() => {
    setProfileData(initialData);
  }, [initialData]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profileData);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="edit-profile-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar className="modal-toolbar">
          <div className="modal-header-content">
            <h2 className="modal-title">Editar Perfil</h2>
            <IonButton className="close-button" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonItem className="edit-profile-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Nombre Completo</IonLabel>
              <IonInput
                value={profileData.name}
                onIonChange={e => handleInputChange('name', e.detail.value!)}
                required
              />
            </div>
          </IonItem>

          <IonItem className="edit-profile-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Email</IonLabel>
              <IonInput
                type="email"
                value={profileData.email}
                onIonChange={e => handleInputChange('email', e.detail.value!)}
                required
              />
            </div>
          </IonItem>

          <IonItem className="edit-profile-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Teléfono</IonLabel>
              <IonInput
                type="tel"
                value={profileData.phone}
                onIonChange={e => handleInputChange('phone', e.detail.value!)}
                required
              />
            </div>
          </IonItem>

          <IonItem className="edit-profile-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Ubicación</IonLabel>
              <IonInput
                value={profileData.location}
                onIonChange={e => handleInputChange('location', e.detail.value!)}
                required
              />
            </div>
          </IonItem>

          <div className="edit-profile-actions">
            <IonButton expand="block" type="submit" className="save-button">
              Guardar Cambios
            </IonButton>
            <IonButton expand="block" fill="outline" color="medium" onClick={onClose}>
              Cancelar
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonModal>
  );
};

export default EditProfileModal; 