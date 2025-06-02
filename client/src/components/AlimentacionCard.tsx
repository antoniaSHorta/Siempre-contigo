import React from 'react';
import { IonButton, IonIcon, IonItem, IonLabel, useIonActionSheet, useIonAlert } from '@ionic/react';
import { AlimentacionInterface } from '../Util/AlimentacionInterface';
import './AlimentacionCard.css'
import { createOutline, ellipsisVertical, restaurantOutline, trashOutline} from 'ionicons/icons';

interface AlimentacionCardProps {
  entry: AlimentacionInterface;
  onComerClick: (entry: AlimentacionInterface) => void;
  onEditClick: (entry: AlimentacionInterface) => void;
  onDeleteClick: (id: number) => void;
}

const AlimentacionCard: React.FC<AlimentacionCardProps> = ({ entry, onComerClick, onEditClick, onDeleteClick}) => {

    const [presentActionSheet] = useIonActionSheet();

    const formattedTime = entry.hora.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    });

    function desplegarMenu() {
        presentActionSheet({
            header: entry.tipo,
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
                }
            ],
        });
    }

    return (
    <IonItem className="alimentacion-card-item">
        <IonLabel>
        <h2>
            {entry.tipo} <span className="hora">{formattedTime}</span>
        </h2>
        <p>{entry.descripcion}</p>
        </IonLabel>
        <IonButton
        slot="end"
        fill="clear"
        color="medium"
        onClick={() => {desplegarMenu()}}
        >
        <IonIcon icon={ellipsisVertical} slot="icon-only" />
        </IonButton>
    </IonItem>
  );
};

export default AlimentacionCard;