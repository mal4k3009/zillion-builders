import { useState } from 'react';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { priorityLevels, taskStatuses } from '../../data/mockData';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onView?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onView }: TaskCardProps) {
  const { state, updateTask: updateTaskInContext, createActivity } = useApp();
  const [showActions, setShowActions] = useState(false);
  
  const assignedUser = state.users.find(u => u.id === task.assignedTo);
  const priority = priorityLevels.find(p => p.id === task.priority);
  const status = taskStatuses.find(s => s.id === task.status);
  
  // Find project and user category from backend data
  const project = state.projects.find(p => p.id === task.projectId);
  const userCategory = state.userCategories.find(c => c.id === task.categoryId);
  
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const canEdit = state.currentUser?.role === 'master' || 
                  (state.currentUser?.role === 'sub');

  const handleStatusChange = async (newStatus: string) => {
    if (canEdit) {
      try {
        await updateTaskInContext(task.id, { 
          status: newStatus as Task['status'], 
          updatedAt: new Date().toISOString() 
        });
        
        // Add activity log for status change
        if (createActivity) {
          await createActivity({
            type: 'task_updated',
            description: `Changed task status from "${task.status}" to "${newStatus}" for: ${task.title}`,
            userId: state.currentUser!.id,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error updating task status:', error);
        // TODO: Show error message to user
      }
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
      bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border-l-4 p-4 sm:p-6 
      hover:shadow-md transition-all duration-200
      ${isOverdue ? 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10' : 'border-l-blue-500'}
    `}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white mb-1 sm:mb-2 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-xs sm:text-sm text-medium-gray line-clamp-2">
            {task.description}
          </p>
        </div>
        
        {state.currentUser?.role === 'master' && (
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 sm:p-2 hover:bg-off-white dark:hover:bg-soft-black rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-medium-gray" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-pure-white dark:bg-dark-gray rounded-lg shadow-lg border border-light-gray dark:border-soft-black py-2 z-10">
                <button
                  onClick={() => { onView?.(task); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-deep-charcoal dark:text-pure-white hover:bg-off-white dark:hover:bg-soft-black"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  View Details
                </button>
                <button
                  onClick={() => { onEdit?.(task); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-deep-charcoal dark:text-pure-white hover:bg-off-white dark:hover:bg-soft-black"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  Edit Task
                </button>
                <button
                  onClick={() => { onDelete?.(task.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        {/* Project Information */}
        {project && (
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: '#3B82F6' }}
            />
            <span className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white truncate">
              📁 {project.name}
            </span>
          </div>
        )}

        {/* Category Information */}
        {userCategory && (
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: userCategory.color || '#6B7280' }}
            />
            <span className="text-xs sm:text-sm text-medium-gray truncate">
              🏷️ {userCategory.name}
            </span>
          </div>
        )}

        <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0`} style={{ 
          backgroundColor: `${priority?.color}20`, 
          color: priority?.color 
        }}>
          {priority?.name}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-medium-gray flex-shrink-0" />
          <span className="text-xs sm:text-sm text-medium-gray truncate">
            {assignedUser?.name || 'Unassigned'}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-xs sm:text-sm ${isOverdue ? 'text-red-600' : 'text-medium-gray'}`}>
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-medium-gray">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
          
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-medium-gray">
              <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">{task.attachments.length}</span>
            </div>
          )}
        </div>

        {canEdit && (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg border border-light-gray dark:border-soft-black bg-pure-white dark:bg-dark-gray text-deep-charcoal dark:text-pure-white focus:outline-none focus:ring-2 focus:ring-brand-gold w-full sm:w-auto"
          >
            {taskStatuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        )}
        
        {!canEdit && (
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit`} style={{ 
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