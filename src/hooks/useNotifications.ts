import { useState, useEffect, useCallback } from 'react';
import { onMessage } from 'firebase/messaging';
import { getMessaging } from 'firebase/messaging';
import app from '../firebase/config';
import { fcmService } from '../services/fcmService';
import { ToastData } from '../components/notifications/ToastNotifications';

interface NotificationHookReturn {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  initializeFCM: (userId: number) => Promise<void>;
  isNotificationSupported: boolean;
}

export function useNotifications(): NotificationHookReturn {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messaging = getMessaging(app);
  const isNotificationSupported = 'Notification' in window && 'serviceWorker' in navigator;

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const newToast: ToastData = {
      ...toast,
      id: generateId()
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const initializeFCM = useCallback(async (userId: number) => {
    if (!isNotificationSupported || isInitialized) return;

    try {
      // Register FCM token
      await fcmService.initializeForUser(userId);
      setIsInitialized(true);
    } catch (error) {
      console.error('FCM initialization failed:', error);
    }
  }, [isNotificationSupported, isInitialized]);

  // Set up FCM listener only once
  useEffect(() => {
    if (!isNotificationSupported || isInitialized) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      const { notification, data } = payload;
      
      if (notification) {
        showToast({
          type: (data?.type as 'message' | 'task' | 'success' | 'error' | 'info') || 'info',
          title: notification.title || 'New Notification',
          message: notification.body || '',
          duration: 6000,
          onClick: data?.url ? () => window.location.href = data.url : undefined
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [messaging, showToast, isNotificationSupported, isInitialized]);

  // Auto cleanup old toasts
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(toast => {
        const toastAge = now - parseInt(toast.id.split('').slice(-13).join(''), 36);
        return toastAge < 30000; // Remove toasts older than 30 seconds
      }));
    }, 10000);

    return () => clearInterval(cleanup);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    initializeFCM,
    isNotificationSupported
  };
}

export function useToastNotifications() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const newToast: ToastData = {
      ...toast,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36)
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showMessageToast = useCallback((senderName: string, message: string, onClick?: () => void) => {
    showToast({
      type: 'message',
      title: `New message from ${senderName}`,
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      duration: 5000,
      onClick
    });
  }, [showToast]);

  const showTaskToast = useCallback((title: string, message: string, onClick?: () => void) => {
    showToast({
      type: 'task',
      title,
      message,
      duration: 6000,
      onClick
    });
  }, [showToast]);

  const showSuccessToast = useCallback((message: string) => {
    showToast({
      type: 'success',
      title: 'Success',
      message,
      duration: 3000
    });
  }, [showToast]);

  const showErrorToast = useCallback((message: string) => {
    showToast({
      type: 'error',
      title: 'Error',
      message,
      duration: 5000
    });
  }, [showToast]);

  return {
    toasts,
    removeToast,
    showToast,
    showMessageToast,
    showTaskToast,
    showSuccessToast,
    showErrorToast
  };
}