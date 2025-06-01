import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { settingsOutline, add } from 'ionicons/icons';
import './Agenda.css';
import logo from '../assets/logo.png';
import { useState } from 'react';

const Agenda: React.FC = () => {
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleViewChange = (view: 'daily' | 'weekly' | 'monthly') => {
    setCurrentView(view);
  };

  return (
    <IonPage className="agenda-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Agenda</IonTitle>
            <IonButton fill="clear" slot="end">
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* View Toggles */}
        <IonSegment value={currentView} onIonChange={(e) => handleViewChange(e.detail.value as 'daily' | 'weekly' | 'monthly')}>
          <IonSegmentButton value="daily">
            <IonLabel>Diaria</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="weekly">
            <IonLabel>Semanal</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="monthly">
            <IonLabel>Mensual</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Lista Actividad por tiempo */}
        <div className="agenda-activities">
          {currentView === 'daily' && <div>Vista Diaria de Actividades</div>}
          {currentView === 'weekly' && <div>Vista Semanal de Actividades</div>}
          {currentView === 'monthly' && <div>Vista Mensual de Actividades</div>}
        </div>

        {/* Crear Actividad */}
        <IonButton expand="block" className="create-activity-button" onClick={() => setIsCreateModalOpen(true)}>
          <IonIcon icon={add} slot="start" />
          Crear Actividad
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default Agenda; 