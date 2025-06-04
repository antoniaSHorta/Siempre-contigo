import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { calendar, person, chatbubble, nutrition, medical } from 'ionicons/icons';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';

/* Pages */
import Alimentador from './pages/Alimentador';
import Medicacion from './pages/Medicacion';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Agenda from './pages/Agenda';
/* Styles */
import './theme/variables.css';
import './theme/global.css';
import './theme/custom.css';
import './App.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const MenuContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const closeMenu = async () => {
      const menu = document.querySelector('ion-menu');
      if (menu) {
        await menu.close();
      }
    };

    const menuItems = document.querySelectorAll('ion-item');
    menuItems.forEach(item => {
      item.addEventListener('click', closeMenu);
    });

    return () => {
      menuItems.forEach(item => {
        item.removeEventListener('click', closeMenu);
      });
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menú</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem 
            routerLink="/app/agenda" 
            routerDirection="root" 
            lines="none" 
            detail={false}
            className={isActive('/app/agenda') ? 'menu-item-active' : ''}
          >
            <IonIcon slot="start" icon={calendar} />
            <IonLabel>Agenda</IonLabel>
          </IonItem>
          <IonItem 
            routerLink="/app/alimentador" 
            routerDirection="root" 
            lines="none" 
            detail={false}
            className={isActive('/app/alimentador') ? 'menu-item-active' : ''}
          >
            <IonIcon slot="start" icon={nutrition} />
            <IonLabel>Alimentación</IonLabel>
          </IonItem>
          <IonItem 
            routerLink="/app/medicacion" 
            routerDirection="root" 
            lines="none" 
            detail={false}
            className={isActive('/app/medicacion') ? 'menu-item-active' : ''}
          >
            <IonIcon slot="start" icon={medical} />
            <IonLabel>Medicación</IonLabel>
          </IonItem>
          <IonItem 
            routerLink="/app/chat" 
            routerDirection="root" 
            lines="none" 
            detail={false}
            className={isActive('/app/chat') ? 'menu-item-active' : ''}
          >
            <IonIcon slot="start" icon={chatbubble} />
            <IonLabel>Chat</IonLabel>
          </IonItem>
          <IonItem 
            routerLink="/app/profile" 
            routerDirection="root" 
            lines="none" 
            detail={false}
            className={isActive('/app/profile') ? 'menu-item-active' : ''}
          >
            <IonIcon slot="start" icon={person} />
            <IonLabel>Perfil</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonMenu contentId="main" type="overlay">
          <MenuContent />
        </IonMenu>

        <IonRouterOutlet id="main">
          <Route exact path="/login" component={Login} />
          
          <Route path="/app">
            <IonRouterOutlet>
              <ProtectedRoute exact path="/app/agenda" component={Agenda} />
              <ProtectedRoute exact path="/app/profile" component={Profile} />
              <ProtectedRoute exact path="/app/alimentador" component={Alimentador} />
              <ProtectedRoute exact path="/app/medicacion" component={Medicacion} />
              <ProtectedRoute exact path="/app/chat" component={Chat} />
              <Route exact path="/app">
                <Redirect to="/app/agenda" />
              </Route>
            </IonRouterOutlet>
          </Route>

          <Route exact path="/">
            <Redirect to="/app/agenda" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
