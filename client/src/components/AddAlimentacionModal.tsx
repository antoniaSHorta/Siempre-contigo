import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime, // Keep IonDatetime for time picker
  IonIcon,
  IonContent
} from '@ionic/react';
import { close } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { parse } from 'date-fns'; // For robust date/time parsing
import axios from 'axios';
import { useIonToast } from '@ionic/react'; // For displaying toasts

// Assuming these types/interfaces are defined in your project
// For example, in `src/types/alimentacion.ts`
export interface AlimentacionInput {
  tipo: string;
  descripcion: string;
  hora: string; // HH:mm format
  fecha_hora: string; // ISO string
  residente_id: number;
  cuidador_id: number;
}

// Assuming API_BASE_URL is defined globally or imported from a config file
// For example:
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
// For demonstration, let's declare it:
declare const API_BASE_URL: string;


interface AddAlimentacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave now receives the fully constructed AlimentacionInput
  onSave: (alimentacionData: AlimentacionInput) => void;
}

const AddAlimentacionFormModal: React.FC<AddAlimentacionModalProps> = ({ isOpen, onClose, onSave }) => {
  // State for form inputs
  const [alimentacionData, setAlimentacionData] = useState<Omit<AlimentacionInput, 'fecha_hora' | 'cuidador_id'>>({
    tipo: '',
    descripcion: '',
    hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }), // Default to current time
    residente_id: 0, // Default to 0 or undefined, ensure validation handles it
  });

  // Additional state for modal behavior and data fetching
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Array<{ id: number; nombre: string }>>([]);
  const [presentToast] = useIonToast();

  // --- Utility Functions ---
  const resetForm = () => {
    setAlimentacionData({
      tipo: '',
      descripcion: '',
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
      residente_id: 0,
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field: keyof Omit<AlimentacionInput, 'fecha_hora' | 'cuidador_id'>, value: string | number) => {
    setAlimentacionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Data Fetching (Residents) ---
  useEffect(() => {
    if (!isOpen) return; // Only fetch when modal is about to open or is open

    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay sesión activa para cargar residentes');
          presentToast({
            message: 'No hay sesión activa para cargar residentes.',
            duration: 2000,
            color: 'danger',
            position: 'top',
          });
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/residente`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Assuming response.data.data is the array of residents
        setResidents(response.data.data);
      } catch (err) {
        console.error('Error fetching residents:', err);
        setError('Error al cargar la lista de residentes.');
        presentToast({
            message: 'Error al cargar la lista de residentes.',
            duration: 2000,
            color: 'danger',
            position: 'top',
        });
      }
    };

    fetchResidents();
  }, [isOpen]); // Re-fetch residents when modal opens

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic client-side validation
    if (
      !alimentacionData.tipo ||
      !alimentacionData.descripcion ||
      !alimentacionData.hora ||
      alimentacionData.residente_id === 0 // Check for a valid resident selection
    ) {
      setError('Por favor complete todos los campos requeridos.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Get current date for fecha_hora
      const now = new Date();
      // Combine current date with selected time from the form
      const combinedDateTimeString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${alimentacionData.hora}`;
      
      // Use date-fns parse for robust parsing (if time format is 'HH:mm')
      // Note: If IonDatetime provides an ISO string for `hora`, you might not need parse here.
      // But assuming `hora` state is 'HH:mm', combine with current date and convert to ISO string.
      // For HH:mm format, we can simply construct a Date object for today and set time.
      const [hour, minute] = alimentacionData.hora.split(':').map(Number);
      const activityDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

      if (isNaN(activityDateTime.getTime())) {
        setError('Hora inválida. Asegúrese de que el formato sea HH:MM.');
        setIsSubmitting(false);
        return;
      }

      // Fetch token and user ID (cuidador_id)
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor inicie sesión.');
        setIsSubmitting(false);
        return;
      }

      const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let cuidadorId;
      // Adapt to potential user data structures
      if (userResponse.data && userResponse.data.user && userResponse.data.user.id) {
        cuidadorId = userResponse.data.user.id;
      } else if (userResponse.data && userResponse.data.data && userResponse.data.data.id) {
        cuidadorId = userResponse.data.data.id;
      } else if (userResponse.data && userResponse.data.id) {
        cuidadorId = userResponse.data.id;
      } else {
        console.error('Invalid user data structure:', userResponse.data);
        throw new Error('No se pudo obtener el ID del cuidador.');
      }

      // Construct the final data object
      const newAlimentacionData: AlimentacionInput = {
        ...alimentacionData,
        fecha_hora: activityDateTime.toISOString(), // Convert to ISO string
        cuidador_id: cuidadorId,
      };

      // Call the onSave prop provided by the parent component
      await onSave(newAlimentacionData);
      
      // Success feedback
      presentToast({
        message: 'Entrada de alimentación creada con éxito.',
        duration: 1500,
        color: 'success',
        position: 'top',
      });

      // Reset form and close modal
      resetForm();
      onClose();

    } catch (err) {
      console.error('Error creating alimentacion entry:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la entrada de alimentación.');
      presentToast({
          message: `Error: ${err instanceof Error ? err.message : 'Error desconocido.'}`,
          duration: 2000,
          color: 'danger',
          position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="add-alimentacion-modal">
      <IonHeader>
        <IonToolbar className="modal-toolbar">
          <div className="modal-header-content">
            <h2 className="modal-title">Agregar Nueva Entrada de Alimentación</h2>
            <IonButton fill="clear" onClick={handleClose} className="close-button">
              <IonIcon icon={close} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {error && (
          <div className="error-message ion-text-center ion-padding-vertical">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-field-container">
            <IonItem className="alimentacion-item">
              <IonLabel position="floating">Tipo (Ej: Desayuno, Almuerzo)</IonLabel>
              <IonInput
                value={alimentacionData.tipo}
                onIonChange={e => handleInputChange('tipo', e.detail.value!)}
                required
              />
            </IonItem>

            <IonItem className="alimentacion-item">
              <IonLabel position="floating">Descripción de la comida</IonLabel>
              <IonTextarea
                value={alimentacionData.descripcion}
                onIonChange={e => handleInputChange('descripcion', e.detail.value!)}
                rows={3}
                required
              />
            </IonItem>

            <IonItem className="alimentacion-item">
              <IonLabel>Hora:</IonLabel>
              <IonDatetime
                presentation="time"
                value={alimentacionData.hora} // Use state value
                onIonChange={(e) => {
                  if (typeof e.detail.value === 'string' && e.detail.value) {
                    const selectedDate = new Date(e.detail.value);
                    // Format to HH:mm for internal state, as expected by backend `hora` field
                    handleInputChange('hora', selectedDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }));
                  } else {
                    handleInputChange('hora', ''); // Reset if value is null
                  }
                }}
                minuteValues="0,15,30,45"
              ></IonDatetime>
            </IonItem>

            <IonItem className="alimentacion-item">
              <IonLabel>Residente:</IonLabel>
              <IonSelect
                placeholder="Seleccionar Residente"
                value={alimentacionData.residente_id === 0 ? undefined : alimentacionData.residente_id} // Show placeholder if 0
                onIonChange={e => handleInputChange('residente_id', Number(e.detail.value))}
                interface="popover"
              >
                {/* Optional: Add a disabled "Select" option if resident_id can be 0 */}
                <IonSelectOption value={undefined} disabled>Seleccionar Residente</IonSelectOption>
                {residents.map(resident => (
                  <IonSelectOption key={resident.id} value={resident.id}>{resident.nombre}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </div>

          <div className="create-alimentacion-actions">
            <IonButton
              expand="block"
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Entrada'}
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonModal>
  );
};

export default AddAlimentacionFormModal;