import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon,} from '@ionic/react';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useIonRouter } from '@ionic/react';
import { endpoints } from '../config/api';
import axios from 'axios';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useIonRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/app/home', 'root', 'replace');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const currentPassword = passwordInput?.value || password;

    try {
      const response = await axios.post(endpoints.auth.login, {
        email,
        password: currentPassword,
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
      } else {
        setError(response.data.message || 'Credenciales incorrectas');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="login-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">Iniciar Sesión</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonIcon icon={mailOutline} slot="start" />
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonIcon icon={lockClosedOutline} slot="start" />
                  <IonLabel position="floating">Contraseña</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    required
                  />
                </IonItem>

                {error && (
                  <IonText color="danger" className="ion-padding">
                    <p>{error}</p>
                  </IonText>
                )}

                <div className="ion-padding">
                  <IonButton expand="block" type="submit">
                    Iniciar Sesión
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login; 