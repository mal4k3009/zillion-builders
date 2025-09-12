import React, { useEffect } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { state, markNotificationAsRead, subscribeToUserNotifications } = useApp();

  // Subscribe to real-time notifications when component mounts
  useEffect(() => {
    if (state.currentUser) {
      const unsubscribe = subscribeToUserNotifications(state.currentUser.id);
      return unsubscribe;
    }
  }, [state.currentUser, subscribeToUserNotifications]);

  const userNotifications = state.notifications
    .filter(n => n.userId === state.currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return time.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'task_updated':
        return '✅';
      case 'message_received':
        return '💬';
      case 'task':
        return '📋';
      case 'chat':
        return '💬';
      case 'whatsapp':
        return '📱';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-2 sm:right-6 top-16 sm:top-20 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
        </button>
      </div>

      <div className="max-h-80 sm:max-h-96 overflow-y-auto">
        {userNotifications.length > 0 ? (
          userNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="text-sm sm:text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors flex-shrink-0"
                      >
                        <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 sm:p-8 text-center">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={onClose}
          className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}