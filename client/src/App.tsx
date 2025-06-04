import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuButton, IonMenuToggle, IonRouterOutlet, IonTab, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar, setupIonicReact} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, person, chatbubbles, restaurant, medkit, book, menu, chatbubble } from 'ionicons/icons';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

/*Componets*/
import SideMenu from './components/SideMenu'

/* Pages */
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Alimentacion from './pages/Alimentacion';
import Agenda from './pages/Agenda';
import ChatList from './pages/ChatList';

/* Styles */
import './theme/variables.css';
import './theme/global.css';
import './theme/custom.css';

/*Core Ionic Controllers*/
import { menuController } from '@ionic/core';

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
import ChatDetail from './pages/ChatDetail';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
     <IonReactRouter>

        <SideMenu />

        <IonRouterOutlet id="main-content" aria-hidden="false">
          <Route exact path="/login" component={Login} />

          <Route path="/app">
            <IonTabs>

              <IonRouterOutlet>
                <ProtectedRoute exact path="/app/home" component={Home} />
                <ProtectedRoute exact path="/app/profile" component={Profile}/>
                <ProtectedRoute exact path="/app/medicamentos" component={Medicamentos}/>
                <ProtectedRoute exact path="/app/medicamentos" component={Profile}/>
                <ProtectedRoute exact path="/app/alimentacion" component={Alimentacion}/>
                <ProtectedRoute exact path="/app/chat" component={Profile}/> 
                <ProtectedRoute exact path="/app/agenda" component={Agenda} />
                <ProtectedRoute exact path="/app/chat" component={ChatList} />
                <ProtectedRoute exact path="/app/chat/:chatId" component={ChatDetail} />
                <Route exact path="/app">
                  <Redirect to="/app/home" />
                </Route>

              </IonRouterOutlet>

              <IonTabBar slot="bottom">
                
                <IonTabButton tab="agenda" href="/app/agenda">
                  <IonIcon icon={book}/>
                  <IonLabel>Agenda</IonLabel>
                </IonTabButton>
                <IonTabButton tab="alimentacion" href="/app/alimentacion">
                  <IonIcon icon={restaurant}/>
                  <IonLabel>Alimentacion</IonLabel>
                </IonTabButton>

                <IonTabButton tab="home" href="/app/home">
                  <IonIcon icon={home}/>
                  <IonLabel>Home</IonLabel>
                </IonTabButton>
                <IonTabButton tab="profile" href="/app/profile">
                  <IonIcon icon={person} />
                  <IonLabel>Perfil</IonLabel>
                </IonTabButton>
                <IonTabButton tab="medicamentos" href="/app/medicamentos">
                  <IonIcon icon={heart} />
                  <IonLabel>Medicamentos</IonLabel>
                </IonTabButton>
                <IonTabButton tab="chat" href="/app/chat">
                  <IonIcon icon={chatbubble} />
                  <IonLabel>Chat</IonLabel>
                </IonTabButton>
              </IonTabBar>

            </IonTabs>
          </Route>

          <Route exact path="/">
            <Redirect to="/app/home"/>
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
