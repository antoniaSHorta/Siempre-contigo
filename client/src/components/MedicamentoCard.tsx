import React from "react";
import { MedicacionInterface } from "../types/medicamento";
import './MedicamentoCard.css';

interface MedicamentoCardProps {
  medicamento: MedicacionInterface;
  onComerClick: (medicamento: MedicacionInterface) => void;
  onEditClick: (medicamento: MedicacionInterface) => void;
  onDeleteClick: (id: number) => void;
}

const MedicamentoCard: React.FC<MedicamentoCardProps> = ({ medicamento, onComerClick, onEditClick, onDeleteClick }) => {
  return (
    <></>
  );
};

export default MedicamentoCard;
