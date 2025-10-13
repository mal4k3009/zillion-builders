// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-SGV0tECuGP0I1axJ8szcITtDzKahAQs",
  authDomain: "zillion-builders-group.firebaseapp.com",
  projectId: "zillion-builders-group",
  storageBucket: "zillion-builders-group.firebasestorage.app",
  messagingSenderId: "981489360202",
  appId: "1:981489360202:web:43789b6525deaf4d1ab5b3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, tag } = payload.notification;
  
  const notificationOptions = {
    body,
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: tag || 'notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});