import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if (!notificationService.isSupported()) {
      return;
    }

    const currentPermission = notificationService.getPermissionStatus();
    setPermission(currentPermission);

    // Show banner if permission is not granted
    if (currentPermission === 'default') {
      setShowBanner(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      setShowBanner(false);
      
      // Show a test notification
      setTimeout(() => {
        notificationService.sendTaskAssignedNotification(
          { id: 1, name: 'You', email: '', username: '', password: '', role: 'sub', department: 'test', status: 'active', createdAt: '' },
          'Test Task - Notifications Enabled!',
          'System'
        );
      }, 1000);
    } else {
      setPermission('denied');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner || !notificationService.isSupported()) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-400 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg">Enable Push Notifications</h3>
            <p className="text-blue-100 text-sm">
              Get instant notifications when tasks are assigned to you or when important updates occur.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRequestPermission}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Enable
          </button>
          <button
            onClick={handleDismiss}
            className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermission(notificationService.getPermissionStatus());
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (permission === 'granted') {
      // Can't programmatically revoke permission, show instructions
      alert('To disable notifications, please go to your browser settings and block notifications for this site.');
    } else if (permission === 'default') {
      const granted = await notificationService.requestPermission();
      setPermission(granted ? 'granted' : 'denied');
    } else {
      // Permission denied, show instructions to enable
      alert('Notifications are blocked. Please enable them in your browser settings to receive task notifications.');
    }
  };

  if (!notificationService.isSupported()) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <BellOff className="w-5 h-5" />
        <span className="text-sm">Notifications not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {permission === 'granted' ? (
        <div className="flex items-center gap-2 text-green-600">
          <Bell className="w-5 h-5" />
          <span className="text-sm font-medium">Notifications Enabled</span>
        </div>
      ) : (
        <button
          onClick={handleToggleNotifications}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <BellOff className="w-5 h-5" />
          <span className="text-sm">Enable Notifications</span>
        </button>
      )}
    </div>
  );
}
