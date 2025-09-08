import React from 'react';
import { Clock, CheckSquare, User, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ActivityFeed() {
  const { state } = useApp();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
        return <CheckSquare className="w-4 h-4" />;
      case 'user_created':
        return <User className="w-4 h-4" />;
      case 'message_sent':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'task_updated':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'user_created':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'message_sent':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const recentActivities = state.activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="bg-pure-white dark:bg-dark-gray rounded-xl shadow-sm border border-light-gray dark:border-soft-black">
      <div className="p-6 border-b border-light-gray dark:border-soft-black">
        <h3 className="text-lg font-semibold text-deep-charcoal dark:text-pure-white">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const user = state.users.find(u => u.id === activity.userId);
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-deep-charcoal dark:text-pure-white">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-medium-gray">
                      {user?.name || 'System'}
                    </span>
                    <span className="text-xs text-medium-gray">•</span>
                    <span className="text-xs text-medium-gray">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}