import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ToggleBar from '../components/ToggleBar';
import logo from '../assets/logo.png';
import './Alimentador.css';

const Alimentador: React.FC = () => {
  return (
    <IonPage className="alimentador-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <ToggleBar />
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Alimentador</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="alimentador-container">
          <h1>Control de Alimentación</h1>
          <p>Gestiona los horarios y tipos de alimentación de los residentes</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Alimentador; 