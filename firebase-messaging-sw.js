// This file must be in the public/root directory of your site.

// Import the Firebase SDK for Google Analytics.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC53NkUarONGKhBrE-LynBVwVBtjbHk4Qk",
  authDomain: "fortimind.firebaseapp.com",
  projectId: "fortimind",
  storageBucket: "fortimind.firebasestorage.app",
  messagingSenderId: "800747065144",
  appId: "1:800747065144:web:2401682ec1058eeec9fbcd",
  measurementId: "G-083RNFKKY5"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/icon.png' // Optional: path to an icon file
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
