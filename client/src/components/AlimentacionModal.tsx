import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons, IonSelect, IonSelectOption, IonDatetime } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { format, parseISO, parse } from 'date-fns';
import './AlimentacionModal.css';

interface AlimentacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alimentacionData: AlimentacionData) => void;
  initialData?: AlimentacionData;
  mode: 'create' | 'edit';
}

export interface AlimentacionData {
  id?: number;
  residente: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  observaciones?: string;
}

// Lista de residentes de ejemplo - Esto debería venir de tu backend
const RESIDENTES = [
  'María García',
  'Juan Pérez',
  'Ana Martínez',
  'Luis Rodríguez',
  'Carmen López'
];

const TIPOS_ALIMENTACION = [
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Merienda',
  'Snack'
];

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' }
];

const AlimentacionModal: React.FC<AlimentacionModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const defaultData: AlimentacionData = {
    residente: '',
    tipo: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    estado: 'pendiente',
    observaciones: ''
  };

  const [alimentacionData, setAlimentacionData] = useState<AlimentacionData>(initialData || defaultData);
  const [alimentacionDate, setAlimentacionDate] = useState<string>('');
  const [alimentacionTime, setAlimentacionTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setAlimentacionData(initialData);
      setAlimentacionDate(initialData.fecha);
      setAlimentacionTime(initialData.hora);
    } else {
      setAlimentacionData(defaultData);
      setAlimentacionDate('');
      setAlimentacionTime('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof AlimentacionData, value: string) => {
    setAlimentacionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (value: string) => {
    setAlimentacionDate(value);
  };

  const handleTimeChange = (value: string) => {
    setAlimentacionTime(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    if (!alimentacionData.residente.trim()) {
      setError('El residente es requerido');
      setIsSubmitting(false);
      return;
    }
    
    if (!alimentacionData.tipo.trim()) {
      setError('El tipo de alimentación es requerido');
      setIsSubmitting(false);
      return;
    }
    
    if (!alimentacionDate || !alimentacionTime) {
      setError('La fecha y hora son requeridas');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const newAlimentacionData: AlimentacionData = {
        ...alimentacionData,
        fecha: alimentacionDate,
        hora: alimentacionTime
      };

      await onSave(newAlimentacionData);
      onClose();
    } catch (error) {
      console.error('Error al guardar alimentación:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la alimentación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="alimentacion-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar className="modal-toolbar">
          <div className="modal-header-content">
            <h2 className="modal-title">{mode === 'create' ? 'Nueva Alimentación' : 'Editar Alimentación'}</h2>
            <IonButton className="close-button" onClick={onClose}>
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
          <IonItem className="alimentacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Residente</IonLabel>
              <IonSelect
                value={alimentacionData.residente}
                onIonChange={e => handleInputChange('residente', e.detail.value)}
                interface="popover"
                className="select-field"
              >
                {RESIDENTES.map(residente => (
                  <IonSelectOption key={residente} value={residente}>
                    {residente}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </IonItem>

          <IonItem className="alimentacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Tipo de Alimentación</IonLabel>
              <IonSelect
                value={alimentacionData.tipo}
                onIonChange={e => handleInputChange('tipo', e.detail.value)}
                interface="popover"
                className="select-field"
              >
                {TIPOS_ALIMENTACION.map(tipo => (
                  <IonSelectOption key={tipo} value={tipo}>
                    {tipo}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </IonItem>

          <IonItem className="alimentacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Fecha</IonLabel>
              <IonInput
                type="text"
                value={alimentacionDate}
                onIonChange={e => handleDateChange(e.detail.value!)}
                required
                placeholder="dd/mm/yyyy"
              />
            </div>
          </IonItem>

          <IonItem className="alimentacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Hora</IonLabel>
              <IonInput
                type="text"
                value={alimentacionTime}
                onIonChange={e => handleTimeChange(e.detail.value!)}
                required
                placeholder="hh:mm"
              />
            </div>
          </IonItem>

          <IonItem className="alimentacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Estado</IonLabel>
              <IonSelect
                value={alimentacionData.estado}
                onIonChange={e => handleInputChange('estado', e.detail.value)}
                interface="popover"
                className="select-field"
              >
                {ESTADOS.map(estado => (
                  <IonSelectOption key={estado.value} value={estado.value}>
                    {estado.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </IonItem>

          <IonItem className="alimentacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Observaciones</IonLabel>
              <IonInput
                value={alimentacionData.observaciones}
                onIonChange={e => handleInputChange('observaciones', e.detail.value!)}
                placeholder="Opcional"
              />
            </div>
          </IonItem>

          <div className="alimentacion-modal-actions">
            <IonButton 
              expand="block" 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Alimentación' : 'Guardar Cambios')}
            </IonButton>
            <IonButton 
              expand="block" 
              fill="outline" 
              color="medium" 
              onClick={onClose}
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

export default AlimentacionModal; 