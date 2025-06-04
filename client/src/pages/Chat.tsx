import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ToggleBar from '../components/ToggleBar';
import logo from '../assets/logo.png';
import './Chat.css';

const Chat: React.FC = () => {
  return (
    <IonPage className="chat-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <ToggleBar />
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Chat</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="chat-container">
          <h1>Chat</h1>
          <p>Comunícate con el personal y los residentes</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Chat; 