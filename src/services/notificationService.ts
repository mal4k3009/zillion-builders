import { sendBrowserNotification, requestSimpleNotificationPermission, requestNotificationPermission, onMessageListener } from '../firebase/messaging';
import { User } from '../types';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  private hasPermission: boolean = false;
  private fcmToken: string | null = null;

  async initialize() {
    // First try to get FCM token
    this.fcmToken = await requestNotificationPermission();
    
    // If FCM is not available, fall back to simple notifications
    if (!this.fcmToken) {
      this.hasPermission = await requestSimpleNotificationPermission();
    } else {
      this.hasPermission = true;
      console.log('FCM Token:', this.fcmToken);
      
      // Listen for foreground messages
      this.setupForegroundMessageListener();
    }
    
    console.log('Notification permission:', this.hasPermission);
  }

  private setupForegroundMessageListener() {
    onMessageListener()
      .then((payload: any) => {
        console.log('Received foreground message:', payload);
        
        // Show notification when app is in foreground
        const title = payload.notification?.title || 'New Notification';
        const body = payload.notification?.body || 'You have a new notification';
        
        sendBrowserNotification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'foreground-notification'
        });
      })
      .catch((err) => console.log('Failed to receive foreground message:', err));
  }

  getFCMToken(): string | null {
    return this.fcmToken;
  }

  async sendTaskAssignedNotification(assignedUser: User, taskTitle: string, assignedBy: string) {
    if (!this.hasPermission) {
      console.log('No notification permission');
      return;
    }

    const notificationData: NotificationData = {
      title: '📋 New Task Assigned',
      body: `Hi ${assignedUser.name}!\n\nYou have been assigned a new task:\n"${taskTitle}"\n\nAssigned by: ${assignedBy}\n\nPlease check your dashboard for details.`,
      icon: '/favicon.ico',
      tag: 'task-assigned',
      data: {
        type: 'task_assigned',
        taskTitle,
        assignedTo: assignedUser.id,
        assignedBy
      }
    };

    sendBrowserNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      tag: notificationData.tag,
      requireInteraction: true,
      data: notificationData.data
    });

    // Also play a notification sound if supported
    this.playNotificationSound();
  }

  async sendTaskCompletedNotification(completedBy: string, taskTitle: string) {
    if (!this.hasPermission) {
      console.log('No notification permission');
      return;
    }

    const notificationData: NotificationData = {
      title: '✅ Task Completed',
      body: `${completedBy} has completed the task:\n"${taskTitle}"`,
      icon: '/favicon.ico',
      tag: 'task-completed',
      data: {
        type: 'task_completed',
        taskTitle,
        completedBy
      }
    };

    sendBrowserNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      tag: notificationData.tag,
      requireInteraction: false
    });

    this.playNotificationSound();
  }

  async sendTaskOverdueNotification(taskTitle: string, assignedUser: User) {
    if (!this.hasPermission) {
      console.log('No notification permission');
      return;
    }

    const notificationData: NotificationData = {
      title: '⏰ Task Overdue',
      body: `Hi ${assignedUser.name}!\n\nYour task "${taskTitle}" is overdue.\n\nPlease complete it as soon as possible.`,
      icon: '/favicon.ico',
      tag: 'task-overdue',
      data: {
        type: 'task_overdue',
        taskTitle,
        assignedTo: assignedUser.id
      }
    };

    sendBrowserNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      tag: notificationData.tag,
      requireInteraction: true
    });

    this.playNotificationSound();
  }

  async sendChatMessageNotification(senderName: string, message: string) {
    if (!this.hasPermission) {
      console.log('No notification permission');
      return;
    }

    const notificationData: NotificationData = {
      title: `💬 New Message from ${senderName}`,
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/favicon.ico',
      tag: 'chat-message',
      data: {
        type: 'chat_message',
        senderName
      }
    };

    sendBrowserNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      tag: notificationData.tag,
      requireInteraction: false
    });

    this.playNotificationSound();
  }

  private playNotificationSound() {
    try {
      // Create a subtle notification sound
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Method to request permission again if previously denied
  async requestPermission(): Promise<boolean> {
    this.hasPermission = await requestSimpleNotificationPermission();
    return this.hasPermission;
  }

  // Check if notifications are supported and enabled
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize the service
notificationService.initialize();
