import { IonModal, IonHeader, IonToolbar,  IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { close } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import './CreateActivityModal.css';
import { parse } from 'date-fns';
import { ActivityInput, ACTIVITY_TYPES, ACTIVITY_LOCATIONS, ACTIVITY_STATUSES } from '../types/activity';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: ActivityInput) => void;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activityData, setActivityData] = useState<Omit<ActivityInput, 'fecha' | 'cuidador_id'>>({
    titulo: '',
    descripcion: '',
    tipo: '',
    residente_id: 0,
    lugar: '',
    estado: 'Pendiente'
  });
  const [activityDate, setActivityDate] = useState<string>('');
  const [activityTime, setActivityTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Array<{ id: number; nombre: string }>>([]);

  const resetForm = () => {
    setActivityData({
      titulo: '',
      descripcion: '',
      tipo: '',
      residente_id: 0,
      lugar: '',
      estado: 'Pendiente'
    });
    setActivityDate('');
    setActivityTime('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay sesión activa');
          return;
        }

        const response = await fetch('/api/residents/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los residentes');
        }

        const data = await response.json();
        setResidents(data.data);
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    };

    fetchResidents();
  }, []);

  const handleInputChange = (field: keyof Omit<ActivityInput, 'fecha' | 'cuidador_id'>, value: string | number) => {
    setActivityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (value: string) => {
    setActivityDate(value);
  };

  const handleTimeChange = (value: string) => {
    setActivityTime(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (
      !activityDate ||
      !activityTime ||
      !activityData.titulo ||
      !activityData.tipo ||
      !activityData.residente_id ||
      !activityData.lugar ||
      !activityData.estado
    ) {
      setError('Por favor complete todos los campos requeridos.');
      setIsSubmitting(false);
      return;
    }

    try {
      const combinedDateTimeString = `${activityDate} ${activityTime}`;
      const activityDateTime = parse(combinedDateTimeString, 'dd/MM/yyyy hh:mm a', new Date());

      if (isNaN(activityDateTime.getTime())) {
        setError('Fecha u hora inválida.');
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor inicie sesión.');
        setIsSubmitting(false);
        return;
      }

      const userResponse = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener información del usuario');
      }

      const userData = await userResponse.json();
      console.log('User data response:', userData); 

      let cuidadorId;
      if (userData && userData.user && userData.user.id) {
        cuidadorId = userData.user.id;
      } else if (userData && userData.data && userData.data.id) {
        cuidadorId = userData.data.id;
      } else if (userData && userData.id) {
        cuidadorId = userData.id;
      } else {
        console.error('Invalid user data structure:', userData);
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const newActivityData: ActivityInput = {
        ...activityData,
        fecha: activityDateTime,
        cuidador_id: cuidadorId
      };

      await onSave(newActivityData);
      
      resetForm();
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="create-activity-modal">
      <IonHeader>
        <IonToolbar className="modal-toolbar">
          <div className="modal-header-content">
            <h2 className="modal-title">Crear Actividad</h2>
            <IonButton fill="clear" onClick={handleClose} className="close-button">
              <IonIcon icon={close} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-field-container">
            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Título:</IonLabel>
              <IonInput
                value={activityData.titulo}
                onIonChange={e => handleInputChange('titulo', e.detail.value!)}
                required
              />
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Descripción:</IonLabel>
              <IonInput
                value={activityData.descripcion}
                onIonChange={e => handleInputChange('descripcion', e.detail.value!)}
              />
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Tipo:</IonLabel>
              <IonSelect
                value={activityData.tipo}
                onIonChange={e => handleInputChange('tipo', e.detail.value!)}
                interface="popover"
              >
                {ACTIVITY_TYPES.map(type => (
                  <IonSelectOption key={type} value={type}>{type}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Fecha:</IonLabel>
              <IonInput
                type="text"
                value={activityDate}
                onIonChange={e => handleDateChange(e.detail.value!)}
                required
                placeholder="dd/mm/yyyy"
              />
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Hora:</IonLabel>
              <IonInput
                type="text"
                value={activityTime}
                onIonChange={e => handleTimeChange(e.detail.value!)}
                required
                placeholder="hh:mm a.m o p.m"
              />
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Residente:</IonLabel>
              <IonSelect
                value={activityData.residente_id}
                onIonChange={e => handleInputChange('residente_id', e.detail.value)}
                interface="popover"
              >
                {residents.map(resident => (
                  <IonSelectOption key={resident.id} value={resident.id}>{resident.nombre}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Lugar:</IonLabel>
              <IonSelect
                value={activityData.lugar}
                onIonChange={e => handleInputChange('lugar', e.detail.value!)}
                interface="popover"
              >
                {ACTIVITY_LOCATIONS.map(location => (
                  <IonSelectOption key={location} value={location}>{location}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="create-activity-item">
              <IonLabel className="form-label">Estado:</IonLabel>
              <IonSelect
                value={activityData.estado}
                onIonChange={e => handleInputChange('estado', e.detail.value!)}
                interface="popover"
              >
                {ACTIVITY_STATUSES.map(status => (
                  <IonSelectOption key={status} value={status}>{status}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </div>

          <div className="create-activity-actions">
            <IonButton 
              expand="block" 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
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

export default CreateActivityModal; 