import React from 'react';
import { IonButton, IonIcon, IonItem, IonLabel, useIonActionSheet } from '@ionic/react';
import { AlimentacionInterface } from '../types/alimentacion';
import './AlimentacionCard.css';
import { createOutline, ellipsisVertical, restaurantOutline, trashOutline } from 'ionicons/icons';

interface AlimentacionCardProps {
  entry: AlimentacionInterface;
  onComerClick: (entry: AlimentacionInterface) => void;
  onEditClick: (entry: AlimentacionInterface) => void;
  onDeleteClick: (id: number) => void;
}

const AlimentacionCard: React.FC<AlimentacionCardProps> = ({ entry, onComerClick, onEditClick, onDeleteClick }) => {

  const [presentActionSheet] = useIonActionSheet();

  const formattedTime = entry.hora ? entry.hora.slice(0, 5) : '--:--';

  function desplegarMenu() {
    presentActionSheet({
      header: entry.tipo ?? 'Alimentación',
      cssClass: 'alimentacion-action-sheet-custom',
      buttons: [
        {
          text: 'Comer',
          icon: restaurantOutline,
          handler: () => {
            onComerClick(entry);
          },
        },
        {
          text: 'Editar',
          icon: createOutline,
          handler: () => {
            onEditClick(entry);
          },
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: trashOutline,
          handler: () => {
            onDeleteClick(entry.id);
          },
        },
      ],
    });
  }

  return (
    <IonItem className="alimentacion-card-item">
      <IonLabel>
        <h2>
          {entry.tipo ?? 'Sin tipo'} <span className="hora">{formattedTime}</span>
        </h2>
        <p>{entry.descripcion ?? 'Sin descripción'}</p>
      </IonLabel>
      <IonButton slot="end" fill="clear" color="medium" onClick={desplegarMenu}>
        <IonIcon icon={ellipsisVertical} slot="icon-only" />
      </IonButton>
    </IonItem>
  );
};

export default AlimentacionCard;