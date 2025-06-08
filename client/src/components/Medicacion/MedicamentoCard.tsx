import React from "react";
import { MedicacionInterface } from "../../types/medicamento";
import './MedicamentoCard.css';
import { IonItem, IonLabel, IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { createOutline, ellipsisVertical, restaurantOutline, trashOutline } from "ionicons/icons";

interface MedicamentoCardProps {
  medicamento: MedicacionInterface;
  onComerClick: (medicamento: MedicacionInterface) => void;
  onEditClick: (medicamento: MedicacionInterface) => void;
  onDeleteClick: (id: number) => void;
}

const MedicamentoCard: React.FC<MedicamentoCardProps> = ({ medicamento, onComerClick, onEditClick, onDeleteClick }) => {

    const [presentActionSheet] = useIonActionSheet();

    function desplegarMenu() {
        presentActionSheet({
            header: medicamento.nombre,
            cssClass: 'medicamento-action-sheet-custom',
            buttons: [
                {
                text: 'Administrar',
                icon: restaurantOutline,
                handler: () => {
                    onComerClick(medicamento);
                },
                },
                {
                text: 'Editar',
                icon: createOutline,
                handler: () => {
                    onEditClick(medicamento);
                },
                },
                {
                text: 'Eliminar',
                role: 'destructive',
                icon: trashOutline,
                handler: () => {
                    onDeleteClick(medicamento.id);
                },
                }
            ],
        });
    }

    return (
    <>
        <IonItem className="medicamento-card-item">
            <IonLabel>
                <h2>
                    {medicamento.nombre}
                    <span className="hora">{medicamento.horario}</span>
                </h2>
                <p>{medicamento.dosis}</p>
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
    </>
    );
};

export default MedicamentoCard;