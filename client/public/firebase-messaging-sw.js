importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Your Firebase config here
firebase.initializeApp({
  apiKey: "AIzaSyASMAnLO-oDjBGTqR5Uq4PR9UjGVeCW_L8",
  authDomain: "siempre-contigo-63dcd.firebaseapp.com",
  projectId: "siempre-contigo-63dcd",
  messagingSenderId: "677970258171",
  appId: "1:677970258171:web:35fa71d17fdce73956685e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  console.log('Mensaje recibido: ', payload.data);

  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    icon: payload.data.icon,
    vibrate: [100, 50, 100]
  });
});