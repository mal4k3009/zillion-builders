// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDGm_7GfLR8IUvtT2sPn3bOtXQFnmJOc8c",
  authDomain: "zillion-builders-group.firebaseapp.com",
  projectId: "zillion-builders-group",
  storageBucket: "zillion-builders-group.firebasestorage.app",
  messagingSenderId: "580549943895",
  appId: "1:580549943895:web:99b9a5b39be5fdaae06d1b"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Task Assigned';
  const notificationOptions = {
    body: payload.notification?.body || 'You have been assigned a new task',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'task-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Task'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app and navigate to tasks
    event.waitUntil(
      clients.openWindow('/tasks')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    console.log('Notification dismissed');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
