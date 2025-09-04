import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Flag, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { departments, priorityLevels, taskStatuses } from '../../data/mockData';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onView?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onView }: TaskCardProps) {
  const { state } = useApp();
  const [showActions, setShowActions] = useState(false);
  
  const assignedUser = state.users.find(u => u.id === task.assignedTo);
  const department = departments.find(d => d.id === task.department);
  const priority = priorityLevels.find(p => p.id === task.priority);
  const status = taskStatuses.find(s => s.id === task.status);
  
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const canEdit = state.currentUser?.role === 'master' || 
                  (state.currentUser?.department === task.department && state.currentUser?.role === 'sub');

  const handleStatusChange = (newStatus: string) => {
    if (canEdit) {
      const updatedTask = { ...task, status: newStatus as Task['status'], updatedAt: new Date().toISOString() };
      state.dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      // Add activity
      state.dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now(),
          type: 'task_updated',
          description: `Updated task "${task.title}" status to ${newStatus}`,
          userId: state.currentUser!.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 p-6 
      hover:shadow-md transition-all duration-200
      ${isOverdue ? 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10' : `border-l-[${department?.color}]`}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        </div>
        
        {state.currentUser?.role === 'master' && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10">
                <button
                  onClick={() => { onView?.(task); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => { onEdit?.(task); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Edit className="w-4 h-4" />
                  Edit Task
                </button>
                <button
                  onClick={() => { onDelete?.(task.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: department?.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {department?.name}
          </span>
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ 
          backgroundColor: `${priority?.color}20`, 
          color: priority?.color 
        }}>
          {priority?.name}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {assignedUser?.name || 'Unassigned'}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
          <Calendar className="w-4 h-4" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
          
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{task.attachments.length}</span>
            </div>
          )}
        </div>

        {canEdit && (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {taskStatuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        )}
        
        {!canEdit && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium`} style={{ 
            backgroundColor: `${status?.color}20`, 
            color: status?.color 
          }}>
            {status?.name}
          </div>
        )}
      </div>
    </div>
  );
}