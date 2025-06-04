import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons, IonSelect, IonSelectOption, IonDatetime } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { format, parseISO, parse } from 'date-fns';
import './MedicacionModal.css';

interface MedicacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicacionData: MedicacionData) => void;
  initialData?: MedicacionData;
  mode: 'create' | 'edit';
}

export interface MedicacionData {
  id?: number;
  nombre: string;
  dosis: string;
  fecha_hora: string;
  estado: 'pendiente' | 'administrada' | 'omitida' | 'retrasada';
  residente: string;
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

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'administrada', label: 'Administrada' },
  { value: 'omitida', label: 'Omitida' },
  { value: 'retrasada', label: 'Retrasada' }
];

const MedicacionModal: React.FC<MedicacionModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const defaultData: MedicacionData = {
    nombre: '',
    dosis: '',
    fecha_hora: format(new Date(), 'yyyy-MM-dd'),
    estado: 'pendiente',
    residente: '',
    observaciones: ''
  };

  const [medicacionData, setMedicacionData] = useState<MedicacionData>(initialData || defaultData);
  const [medicacionDate, setMedicacionDate] = useState<string>('');
  const [medicacionTime, setMedicacionTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setMedicacionData(initialData);
      // Separar fecha y hora del initialData
      const fecha = format(parseISO(initialData.fecha_hora), 'dd/MM/yyyy');
      const hora = format(parseISO(initialData.fecha_hora), 'hh:mm a');
      setMedicacionDate(fecha);
      setMedicacionTime(hora);
    } else {
      setMedicacionData(defaultData);
      setMedicacionDate('');
      setMedicacionTime('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof MedicacionData, value: string) => {
    setMedicacionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (value: string) => {
    setMedicacionDate(value);
  };

  const handleTimeChange = (value: string) => {
    setMedicacionTime(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    if (!medicacionData.nombre.trim()) {
      setError('El nombre del medicamento es requerido');
      setIsSubmitting(false);
      return;
    }
    
    if (!medicacionData.dosis.trim()) {
      setError('La dosis es requerida');
      setIsSubmitting(false);
      return;
    }
    
    if (!medicacionDate || !medicacionTime) {
      setError('La fecha y hora son requeridas');
      setIsSubmitting(false);
      return;
    }

    if (!medicacionData.residente.trim()) {
      setError('El residente es requerido');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const combinedDateTimeString = `${medicacionDate} ${medicacionTime}`;
      const medicacionDateTime = parse(combinedDateTimeString, 'dd/MM/yyyy hh:mm a', new Date());

      if (isNaN(medicacionDateTime.getTime())) {
        setError('Fecha u hora inválida');
        setIsSubmitting(false);
        return;
      }

      const newMedicacionData: MedicacionData = {
        ...medicacionData,
        fecha_hora: format(medicacionDateTime, 'yyyy-MM-dd HH:mm:ss')
      };

      await onSave(newMedicacionData);
      onClose();
    } catch (error) {
      console.error('Error al guardar medicación:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la medicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="medicacion-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar className="modal-toolbar">
          <div className="modal-header-content">
            <h2 className="modal-title">{mode === 'create' ? 'Nueva Medicación' : 'Editar Medicación'}</h2>
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
          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Nombre del Medicamento</IonLabel>
              <IonInput
                value={medicacionData.nombre}
                onIonChange={e => handleInputChange('nombre', e.detail.value!)}
                required
              />
            </div>
          </IonItem>

          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Dosis</IonLabel>
              <IonInput
                value={medicacionData.dosis}
                onIonChange={e => handleInputChange('dosis', e.detail.value!)}
                required
              />
            </div>
          </IonItem>

          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Fecha</IonLabel>
              <IonInput
                type="text"
                value={medicacionDate}
                onIonChange={e => handleDateChange(e.detail.value!)}
                required
                placeholder="dd/mm/yyyy"
              />
            </div>
          </IonItem>

          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Hora</IonLabel>
              <IonInput
                type="text"
                value={medicacionTime}
                onIonChange={e => handleTimeChange(e.detail.value!)}
                required
                placeholder="hh:mm a.m o p.m"
              />
            </div>
          </IonItem>

          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Residente</IonLabel>
              <IonSelect
                value={medicacionData.residente}
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

          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Estado</IonLabel>
              <IonSelect
                value={medicacionData.estado}
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

          <IonItem className="medicacion-modal-item">
            <div className="form-field-container">
              <IonLabel className="form-label">Observaciones</IonLabel>
              <IonInput
                value={medicacionData.observaciones}
                onIonChange={e => handleInputChange('observaciones', e.detail.value!)}
                placeholder="Opcional"
              />
            </div>
          </IonItem>

          <div className="medicacion-modal-actions">
            <IonButton 
              expand="block" 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Medicación' : 'Guardar Cambios')}
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

export default MedicacionModal; 