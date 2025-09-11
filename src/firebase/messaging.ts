import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './config';

const messaging = getMessaging(app);

// Your web app's Firebase config VAPID key (you'll need to generate this in Firebase Console)
const VAPID_KEY = 'BPwsEr9h51l4xuATkQIrfmwZGJCIUL-7fvDzqiticDTziSjq5yBlEJ-fZwD7xA-FX6x5DcYkrg9Kr2BmXAFGFV8'; // Replace with your actual VAPID key from Firebase Console

export const requestNotificationPermission = async () => {
  try {
    // Request notification permission first
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted.');
      
      // Only try FCM on HTTPS or production domains
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHTTPS = window.location.protocol === 'https:';
      
      if (isLocalhost && !isHTTPS) {
        console.log('⚠️ FCM not available on localhost HTTP, using browser notifications only');
        return null;
      }
      
      try {
        // Get registration token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          console.log('✅ FCM Registration token obtained:', token.substring(0, 20) + '...');
          return token;
        } else {
          console.log('⚠️ No FCM registration token available, using browser notifications');
          return null;
        }
      } catch (fcmError) {
        console.log('⚠️ FCM registration failed, falling back to browser notifications:', fcmError);
        return null;
      }
    } else {
      console.log('❌ Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// Fallback for browsers that don't support FCM - use Web Push API directly
export const sendBrowserNotification = (title: string, options: NotificationOptions = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'task-notification',
      requireInteraction: true,
      ...options
    });
  }
};

export const requestSimpleNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
