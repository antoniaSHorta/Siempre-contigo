import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyASMAnLO-oDjBGTqR5Uq4PR9UjGVeCW_L8",
  authDomain: "siempre-contigo-63dcd.firebaseapp.com",
  projectId: "siempre-contigo-63dcd",
  messagingSenderId: "677970258171",
  appId: "1:677970258171:web:35fa71d17fdce73956685e",
};

const VAPID_KEY = 'BEYiGacD4MRcwDVYLTDXXxiYhvDoQNSHFHJUzkjqrSx5B87aOdQRjdCGod9AEfmuinObQPCT0LYGRzmAoRDIzD4';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function getFcmToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission != 'granted') {
      console.error("El usuario no tiene las notificaciones habilitadas");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('Se pidio FCM token correctamente: ', token);
    } else {
      console.warn('FCM token no esta disponible');
    }

    return token;
  } catch (error) {
    console.error('Error al quere pedir FCM token', error);
  }
}