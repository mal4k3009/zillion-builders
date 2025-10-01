import React from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';

interface PendingTasksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export function PendingTasksPopup({ isOpen, onClose, tasks }: PendingTasksPopupProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pending Tasks
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have {tasks.length} pending task{tasks.length !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Task List */}
        <div className="overflow-y-auto max-h-96">
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Pending Tasks
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Great! You're all caught up.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {tasks.map((task) => {
                const assignedUser = state.users.find(u => u.id === task.assignedTo);
                const isOverdue = new Date(task.dueDate) < new Date();
                
                return (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                      isOverdue 
                        ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' 
                        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {assignedUser && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{assignedUser.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {formatDate(task.dueDate)}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stay on top of your tasks to maintain productivity
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}