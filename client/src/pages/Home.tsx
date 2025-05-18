import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonSearchbar,} from '@ionic/react';
import { add, calendar, time, location } from 'ionicons/icons';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Siempre Contigo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSearchbar
          placeholder="Buscar ..."
          className="custom-searchbar"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
