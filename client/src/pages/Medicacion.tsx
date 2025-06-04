import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ToggleBar from '../components/ToggleBar';
import logo from '../assets/logo.png';
import './Medicacion.css';

const Medicacion: React.FC = () => {
  return (
    <IonPage className="medicacion-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <ToggleBar />
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Medicación</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="medicacion-container">
          <h1>Control de Medicación</h1>
          <p>Gestiona los medicamentos y horarios de los residentes</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Medicacion; 