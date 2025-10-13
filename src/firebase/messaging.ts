import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import app, { db } from './config';
import { fcmService } from '../services/fcmService';

const messaging = getMessaging(app);

// Your web app's Firebase config VAPID key (you'll need to generate this in Firebase Console)
const VAPID_KEY = 'BPwsEr9h51l4xuATkQIrfmwZGJCIUL-7fvDzqiticDTziSjq5yBlEJ-fZwD7xA-FX6x5DcYkrg9Kr2BmXAFGFV8'; // Replace with your actual VAPID key from Firebase Console

interface NotificationPayload {
  title: string;
  body: string;
  type: 'message' | 'task' | 'success' | 'error' | 'info';
  userId?: number;
  data?: Record<string, string>;
}

export async function sendNotificationToUser(receiverId: number, senderId: number, payload: NotificationPayload): Promise<void> {
  try {
    // Get receiver's FCM tokens (excluding sender's devices)
    const tokens = await fcmService.getAllActiveTokensExceptSender(receiverId, senderId);
    
    if (tokens.length === 0) {
      console.log(`⚠️ No FCM tokens found for user ${receiverId}`);
      return;
    }

    // For development, just log the notification instead of trying to send via server
    console.log(`📤 [DEV MODE] Would send notification to user ${receiverId}:`, {
      title: payload.title,
      body: payload.body,
      tokens: tokens.length
    });

    // Store notification in Firestore for logging
    const notificationData = {
      recipientId: receiverId,
      senderId,
      tokenCount: tokens.length,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${Date.now()}`,
        requireInteraction: true
      },
      data: {
        type: payload.type,
        userId: payload.userId?.toString() || '',
        ...payload.data
      },
      timestamp: serverTimestamp(),
      status: 'dev_mode'
    };

    await setDoc(doc(db, 'notificationLog', `${Date.now()}_${receiverId}`), notificationData);
    
  } catch (error) {
    console.error('Error processing notification:', error);
  }
}

export async function sendMessageNotification(senderId: number, receiverId: number, senderName: string, message: string): Promise<void> {
  await sendNotificationToUser(receiverId, senderId, {
    title: `New message from ${senderName}`,
    body: message.length > 100 ? message.substring(0, 100) + '...' : message,
    type: 'message',
    userId: senderId,
    data: {
      chatUserId: senderId.toString(),
      action: 'open_chat'
    }
  });
}

export async function sendTaskNotification(userId: number, title: string, description: string, taskId: string, type: 'assigned' | 'updated' | 'completed'): Promise<void> {
  const notificationTitles = {
    assigned: '📋 New Task Assigned',
    updated: '🔄 Task Updated', 
    completed: '✅ Task Completed'
  };

  // For task notifications, we don't exclude any devices since it's not from another user
  const tokens = await fcmService.getUserTokens(userId);
  
  if (tokens.length === 0) return;

  const notificationData = {
    recipientId: userId,
    senderId: 0, // System notification
    tokens: tokens.map(t => t.token),
    notification: {
      title: notificationTitles[type],
      body: `${title}: ${description.length > 80 ? description.substring(0, 80) + '...' : description}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `task-${taskId}`,
      requireInteraction: true
    },
    data: {
      type: 'task',
      taskId,
      action: 'open_task'
    },
    timestamp: serverTimestamp(),
    status: 'pending'
  };

  await setDoc(doc(db, 'pendingNotifications', `task_${taskId}_${Date.now()}`), notificationData);
}

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
