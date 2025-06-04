import { IonButtons, IonButton, IonIcon, IonMenuButton } from '@ionic/react';
import { menuOutline } from 'ionicons/icons';
import React from 'react';
import './ToggleBar.css';

interface ToggleBarProps {
  onToggle?: () => void;
  className?: string;
}

const ToggleBar: React.FC<ToggleBarProps> = ({ onToggle, className = '' }) => {
  return (
    <div className={`toggle-bar ${className}`}>
      <IonButtons slot="start">
        <IonMenuButton autoHide={true}>
          <IonIcon icon={menuOutline} />
        </IonMenuButton>
      </IonButtons>
    </div>
  );
};

export default ToggleBar; 