import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState } from 'react';
import './ChangePasswordModal.css';

export interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (passwordData: PasswordData) => Promise<void>;
  }
  
  const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    isOpen,
    onClose,
    onSave,
  }) => {
    const [passwordData, setPasswordData] = useState<PasswordData>({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
  
    const handleInputChange = (field: keyof PasswordData, value: string) => {
      setPasswordData(prev => ({
        ...prev,
        [field]: value
      }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return;
      }
      
      setIsLoading(true);
      try {
        await onSave(passwordData);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        onClose();
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="change-password-modal">
        <IonHeader className="ion-no-border">
          <IonToolbar className="modal-toolbar">
            <div className="modal-header-content">
              <h2 className="modal-title">Cambiar Contraseña</h2>
              <IonButton className="close-button" fill="clear" onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </div>
          </IonToolbar>
        </IonHeader>
  
        <IonContent className="ion-padding">
          <form onSubmit={handleSubmit}>
            <IonItem className="change-password-item">
              <div className="form-field-container">
                <IonLabel className="form-label">Contraseña Actual</IonLabel>
                <IonInput
                  type="password"
                  value={passwordData.currentPassword}
                  onIonChange={e => handleInputChange('currentPassword', e.detail.value!)}
                  required
                />
              </div>
            </IonItem>
  
            <IonItem className="change-password-item">
              <div className="form-field-container">
                <IonLabel className="form-label">Nueva Contraseña</IonLabel>
                <IonInput
                  type="password"
                  value={passwordData.newPassword}
                  onIonChange={e => handleInputChange('newPassword', e.detail.value!)}
                
                  required
                />
              </div>
            </IonItem>
  
            <IonItem className="change-password-item">
              <div className="form-field-container">
                <IonLabel className="form-label">Confirmar Contraseña</IonLabel>
                <IonInput
                  type="password"
                  value={passwordData.confirmPassword}
                  onIonChange={e => handleInputChange('confirmPassword', e.detail.value!)}
                  required
                />
              </div>
            </IonItem>
  
            <div className="change-password-actions">
              <IonButton
                expand="block"
                type="submit"
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                color="medium"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </IonButton>
            </div>
          </form>
        </IonContent>
      </IonModal>
    );
  };
  
  export default ChangePasswordModal;
  