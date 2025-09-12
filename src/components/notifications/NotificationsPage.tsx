import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function NotificationsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread' | 'task' | 'chat' | 'system'>('all');

  const userNotifications = state.notifications.filter(n => n.userId === state.currentUser?.id);

  const filteredNotifications = userNotifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const handleMarkAsRead = (notificationId: number) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const handleMarkAllAsRead = () => {
    userNotifications.forEach(notification => {
      if (!notification.isRead) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
      }
    });
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
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

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium w-fit"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {['all', 'unread', 'task', 'chat', 'system'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as typeof filter)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors capitalize ${
                    filter === filterType
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="text-lg sm:text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                No notifications
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {filter === 'unread' ? 'All notifications have been read' : 'You\'re all caught up!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}