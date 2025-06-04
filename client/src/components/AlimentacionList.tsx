import { IonList, IonItem, IonLabel, IonIcon, IonButton, IonChip, IonBadge } from '@ionic/react';
import { timeOutline, personOutline, calendarOutline, createOutline, trashOutline } from 'ionicons/icons';
import React from 'react';
import './AlimentacionList.css';

interface Alimentacion {
  id: number;
  residente: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  observaciones?: string;
}

interface AlimentacionListProps {
  alimentaciones: Alimentacion[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const AlimentacionList: React.FC<AlimentacionListProps> = ({ alimentaciones, onEdit, onDelete }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'danger';
      default:
        return 'medium';
    }
  };

  return (
    <IonList className="alimentacion-list">
      {alimentaciones.map((alimentacion) => (
        <IonItem key={alimentacion.id} className="alimentacion-item">
          <div className="alimentacion-content">
            <div className="alimentacion-header">
              <IonLabel className="residente">
                <IonIcon icon={personOutline} />
                {alimentacion.residente}
              </IonLabel>
              <div className="alimentacion-header-actions">
                <IonChip color={getEstadoColor(alimentacion.estado)}>
                  {alimentacion.estado}
                </IonChip>
                <div className="alimentacion-actions">
                  <IonButton fill="clear" onClick={() => onEdit(alimentacion.id)}>
                    <IonIcon icon={createOutline} slot="icon-only" />
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => onDelete(alimentacion.id)}>
                    <IonIcon icon={trashOutline} slot="icon-only" />
                  </IonButton>
                </div>
              </div>
            </div>
            
            <div className="alimentacion-details">
              <div className="detail-item">
                <IonIcon icon={calendarOutline} />
                <span>{alimentacion.fecha}</span>
              </div>
              <div className="detail-item">
                <IonIcon icon={timeOutline} />
                <span>{alimentacion.hora}</span>
              </div>
              <div className="tipo-alimentacion">
                <IonBadge color="primary">{alimentacion.tipo}</IonBadge>
              </div>
            </div>

            {alimentacion.observaciones && (
              <div className="observaciones">
                <p>{alimentacion.observaciones}</p>
              </div>
            )}
          </div>
        </IonItem>
      ))}
    </IonList>
  );
};

export default AlimentacionList; 