import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons, IonSelect, IonSelectOption, IonTextarea, IonDatetime, IonDatetimeButton, IonModal as IonDatetimeModal } from '@ionic/react';
import { close, trash, save, create } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import './ActivityModal.css';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, ActivityInput, ACTIVITY_TYPES, ACTIVITY_LOCATIONS, ACTIVITY_STATUSES } from '../types/activity';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: ActivityInput) => void;
  onDelete: (activityId: number) => void;
  activity: Activity | null;
  residents: Array<{ id: number; nombre: string }>;
  isEditing?: boolean;
  onEdit?: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  activity,
  residents,
  isEditing = false,
  onEdit
}) => {
  const [activityData, setActivityData] = useState<ActivityInput>({
    titulo: '',
    descripcion: '',
    tipo: '',
    residente_id: 0,
    lugar: '',
    estado: 'Incompleto',
    fecha: new Date(),
    cuidador_id: 0
  });
  const [activityDate, setActivityDate] = useState<string>('');
  const [activityTime, setActivityTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activity) {
      const activityDateTime = new Date(activity.fecha);
      const formattedDate = format(activityDateTime, 'dd/MM/yyyy');
      const formattedTime = format(activityDateTime, 'hh:mm a', { locale: es });
      
      setActivityData({
        titulo: activity.titulo,
        descripcion: activity.descripcion || '',
        tipo: activity.tipo,
        residente_id: activity.residente_id,
        lugar: activity.lugar,
        estado: activity.estado,
        fecha: activityDateTime,
        cuidador_id: activity.cuidador_id
      });
      setActivityDate(formattedDate);
      setActivityTime(formattedTime);
    } else {
      setActivityData({
        titulo: '',
        descripcion: '',
        tipo: '',
        residente_id: 0,
        lugar: '',
        estado: 'Incompleto',
        fecha: new Date(),
        cuidador_id: 0
      });
      setActivityDate('');
      setActivityTime('');
    }
    setError(null);
    setIsSubmitting(false);
  }, [activity, residents]);

  const handleInputChange = (field: keyof ActivityInput, value: string | number | Date) => {
    setActivityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!activityData.titulo || !activityData.tipo || !activityData.residente_id || !activityData.lugar || !activityDate || !activityTime) {
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

      const updatedActivityData = {
        ...activityData,
        fecha: activityDateTime
      };

      await onSave(updatedActivityData);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar la actividad');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activity?.id) {
      setError('No se puede eliminar: actividad no válida');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta actividad?');
    if (!confirmDelete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onDelete(activity.id);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar la actividad');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsSubmitting(false);
    setActivityData({
      titulo: '',
      descripcion: '',
      tipo: '',
      residente_id: 0,
      lugar: '',
      estado: 'Incompleto',
      fecha: new Date(),
      cuidador_id: 0
    });
    setActivityDate('');
    setActivityTime('');
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="activity-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar className="modal-toolbar">
          <div className="modal-header-content">
            <h2 className="modal-title">
              {isEditing ? 'Editar Actividad' : 'Detalles de Actividad'}
            </h2>
            <IonButton className="close-button" onClick={handleClose} disabled={isSubmitting}>
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
        
        {!isEditing ? (
          <div>
            <div className="readonly-section">
              <h4>Título</h4>
              <p>{activityData.titulo}</p>
            </div>

            <div className="readonly-section">
              <h4>Descripción</h4>
              <p>{activityData.descripcion || 'Sin descripción'}</p>
            </div>

            <div className="readonly-section">
              <h4>Tipo</h4>
              <p>{activityData.tipo}</p>
            </div>

            <div className="readonly-section">
              <h4>Residente</h4>
              <p>
                {residents.find(r => r.id === activityData.residente_id)?.nombre || 'No asignado'}
              </p>
            </div>

            <div className="readonly-section">
              <h4>Lugar</h4>
              <p>{activityData.lugar}</p>
            </div>

            <div className="readonly-section">
              <h4>Estado</h4>
              <p>{activityData.estado}</p>
            </div>

            <div className="readonly-section">
              <h4>Fecha y Hora</h4>
              <p>
                {format(activityData.fecha, 'dd MMM yyyy - HH:mm', { locale: es })}
              </p>
            </div>

            <div className="activity-actions">
              <IonButton 
                expand="block" 
                onClick={onEdit} 
                className="edit-button"
                disabled={isSubmitting}
              >
                <IonIcon icon={create} slot="start" />
                Editar
              </IonButton>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="danger" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <IonIcon icon={trash} slot="start" />
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </IonButton>
            </div>
          </div>
        ) : (
          // MODO EDICIÓN
          <form onSubmit={handleSubmit}>
            <div className="form-field-container">
              <IonItem className="activity-item">
                <IonLabel className="form-label">Título:</IonLabel>
                <IonInput
                  value={activityData.titulo}
                  onIonChange={e => handleInputChange('titulo', e.detail.value!)}
                  required
                />
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Descripción:</IonLabel>
                <IonTextarea
                  value={activityData.descripcion}
                  onIonChange={e => handleInputChange('descripcion', e.detail.value!)}
                  rows={3}
                />
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Tipo:</IonLabel>
                <IonSelect
                  value={activityData.tipo}
                  onIonChange={e => handleInputChange('tipo', e.detail.value!)}
                  interface="popover"
                >
                  {ACTIVITY_TYPES.map(type => (
                    <IonSelectOption key={type} value={type}>
                      {type}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Residente:</IonLabel>
                <IonSelect
                  value={activityData.residente_id}
                  onIonChange={e => handleInputChange('residente_id', e.detail.value!)}
                  interface="popover"
                >
                  {residents.map((resident: any) => (
                    <IonSelectOption key={resident.id} value={resident.id}>
                      {resident.nombre}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Lugar:</IonLabel>
                <IonSelect
                  value={activityData.lugar}
                  onIonChange={e => handleInputChange('lugar', e.detail.value!)}
                  interface="popover"
                >
                  {ACTIVITY_LOCATIONS.map(location => (
                    <IonSelectOption key={location} value={location}>
                      {location}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Estado:</IonLabel>
                <IonSelect
                  value={activityData.estado}
                  onIonChange={e => handleInputChange('estado', e.detail.value!)}
                  interface="popover"
                >
                  {ACTIVITY_STATUSES.map(status => (
                    <IonSelectOption key={status} value={status}>
                      {status}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Fecha:</IonLabel>
                <IonInput
                  value={activityDate}
                  onIonChange={e => setActivityDate(e.detail.value!)}
                  placeholder="dd/mm/yyyy"
                  required
                />
              </IonItem>

              <IonItem className="activity-item">
                <IonLabel className="form-label">Hora:</IonLabel>
                <IonInput
                  value={activityTime}
                  onIonChange={e => setActivityTime(e.detail.value!)}
                  placeholder="hh:mm a.m o p.m"
                  required
                />
              </IonItem>
            </div>

            <div className="activity-actions">
              <IonButton 
                expand="block" 
                type="submit" 
                className="save-button"
                disabled={isSubmitting}
              >
                <IonIcon icon={save} slot="start" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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
        )}
      </IonContent>
    </IonModal>
  );
};

export default ActivityModal; 