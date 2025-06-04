import { IonList, IonItem, IonLabel, IonIcon, IonButton, IonChip, IonBadge } from '@ionic/react';
import { timeOutline, personOutline, calendarOutline, createOutline, trashOutline, medicalOutline } from 'ionicons/icons';
import React from 'react';
import './MedicacionList.css';

interface Medicacion {
  id: number;
  nombre: string;
  dosis: string;
  horario: string;
  fecha_hora: string;
  estado: 'pendiente' | 'administrada' | 'omitida' | 'retrasada';
  residente: string;
  observaciones?: string;
}

interface MedicacionListProps {
  medicaciones: Medicacion[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const MedicacionList: React.FC<MedicacionListProps> = ({ medicaciones, onEdit, onDelete }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'administrada':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'omitida':
        return 'danger';
      case 'retrasada':
        return 'medium';
      default:
        return 'medium';
    }
  };

  return (
    <IonList className="medicacion-list">
      {medicaciones.map((medicacion) => (
        <IonItem key={medicacion.id} className="medicacion-item">
          <div className="medicacion-content">
            <div className="medicacion-header">
              <IonLabel className="residente">
                <IonIcon icon={personOutline} />
                {medicacion.residente}
              </IonLabel>
              <div className="medicacion-header-actions">
                <IonChip color={getEstadoColor(medicacion.estado)}>
                  {medicacion.estado}
                </IonChip>
                <div className="medicacion-actions">
                  <IonButton fill="clear" onClick={() => onEdit(medicacion.id)}>
                    <IonIcon icon={createOutline} slot="icon-only" />
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => onDelete(medicacion.id)}>
                    <IonIcon icon={trashOutline} slot="icon-only" />
                  </IonButton>
                </div>
              </div>
            </div>
            
            <div className="medicacion-details">
              <div className="detail-item">
                <IonIcon icon={calendarOutline} />
                <span>{medicacion.fecha_hora}</span>
              </div>
              <div className="detail-item">
                <IonIcon icon={timeOutline} />
                <span>{medicacion.horario}</span>
              </div>
              <div className="tipo-medicacion">
                <IonBadge>
                  <IonIcon icon={medicalOutline} />
                  {medicacion.nombre}
                </IonBadge>
              </div>
            </div>

            <div className="dosis-info">
              <IonLabel>Dosis: {medicacion.dosis}</IonLabel>
            </div>

            {medicacion.observaciones && (
              <div className="observaciones">
                <p>{medicacion.observaciones}</p>
              </div>
            )}
          </div>
        </IonItem>
      ))}
    </IonList>
  );
};

export default MedicacionList; 