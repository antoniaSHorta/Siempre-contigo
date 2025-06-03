import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, person, calendar } from 'ionicons/icons';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

/* Pages */
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Agenda from './pages/Agenda';
import { AdminUserDetail, AdminHome, AdminCreateUser, AdminUserEdit, AdminUsers} from './pages/Admin';

/* Styles */
import './theme/variables.css';
import './theme/global.css';
import './theme/custom.css';

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

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />

          <ProtectedRoute exact path="/admin" component={AdminHome} adminOnly/>
          <ProtectedRoute exact path="/admin/users" component={AdminUsers} adminOnly/>
          <ProtectedRoute exact path="/admin/users/add" component={AdminCreateUser} adminOnly/>
          <ProtectedRoute exact path="/admin/users/detail/:id" component={AdminUserDetail} adminOnly/>
          <ProtectedRoute exact path="/admin/users/edit/:id" component={AdminUserEdit} adminOnly/>
          
          <Route path="/app">
            <IonTabs>
              <IonRouterOutlet>
                <ProtectedRoute exact path="/app/home" component={Home} />
                <ProtectedRoute exact path="/app/profile" component={Profile} />
                <ProtectedRoute exact path="/app/agenda" component={Agenda} />
                <Route exact path="/app">
                  <Redirect to="/app/home" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/app/home">
                  <IonIcon icon={home} />
                  <IonLabel>Inicio</IonLabel>
                </IonTabButton>
                <IonTabButton tab="agenda" href="/app/agenda">
                  <IonIcon icon={calendar} />
                  <IonLabel>Agenda</IonLabel>
                </IonTabButton>
                <IonTabButton tab="profile" href="/app/profile">
                  <IonIcon icon={person} />
                  <IonLabel>Perfil</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>

          <Route exact path="/">
            <Redirect to="/app/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
