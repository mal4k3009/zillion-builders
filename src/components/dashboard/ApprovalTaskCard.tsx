import React from 'react';
import { Check, X, Eye, User, Calendar, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';

interface ApprovalTaskCardProps {
  task: Task;
  onApprove: (taskId: number) => void;
  onReject: (taskId: number) => void;
  onView: (task: Task) => void;
}

export function ApprovalTaskCard({ task, onApprove, onReject, onView }: ApprovalTaskCardProps) {
  const { state } = useApp();
  
  const assignedUser = state.users.find(u => u.id === task.assignedTo);
  const isOverdue = new Date(task.dueDate) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description || 'No description provided'}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{assignedUser?.name || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Overdue</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(task)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => onReject(task.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
        <button
          onClick={() => onApprove(task.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
        >
          <Check className="w-4 h-4" />
          Approve
        </button>
      </div>
    </div>
  );
}