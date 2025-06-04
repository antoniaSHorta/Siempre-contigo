import { 
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSearchbar,} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const {isAdmin} = useAuth();

  const handleAdminClick = () => {
    history.push('/app/admin');
  };
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

        {isAdmin && (
          <IonButton expand="block" onClick={handleAdminClick} color="primary">
            Ir a Panel de Administración
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
