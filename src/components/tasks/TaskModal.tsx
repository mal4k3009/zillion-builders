import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Flag, User } from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
// import { notificationService } from '../../services/notificationService'; // DISABLED - n8n will handle notifications

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  mode: 'create' | 'edit' | 'view';
}

const departments = [
  { id: 'sales', name: 'Sales', color: '#10B981' },
  { id: 'pr', name: 'Public Relations', color: '#8B5CF6' },
  { id: 'marketing', name: 'Marketing', color: '#F59E0B' },
  { id: 'operations', name: 'Operations', color: '#3B82F6' }
];

const priorityLevels = [
  { id: 'low', name: 'Low', color: '#6B7280' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'high', name: 'High', color: '#EF4444' },
  { id: 'urgent', name: 'Urgent', color: '#DC2626' }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function TaskModal({ isOpen, onClose, task, mode }: TaskModalProps) {
  const { state, createTask, updateTask, createNotification, createActivity } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    priority: 'medium' as Task['priority'],
    dueDate: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        department: task.department,
        assignedTo: task.assignedTo.toString(),
        priority: task.priority,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16)
      });
    } else {
      setFormData({
        title: '',
        description: '',
        department: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      department: formData.department,
      assignedTo: parseInt(formData.assignedTo),
      priority: formData.priority,
      status: task?.status || 'pending' as Task['status'],
      dueDate: new Date(formData.dueDate).toISOString(),
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: task?.createdBy || state.currentUser!.id,
      comments: task?.comments || [],
      attachments: task?.attachments || []
    };

    try {
      if (mode === 'create') {
        const taskId = await createTask(taskData);
        
        // Find the assigned user
        const assignedUser = state.users.find(u => u.id === parseInt(formData.assignedTo));
        
        // Add notification for assigned user
        await createNotification({
          userId: parseInt(formData.assignedTo),
          title: 'New Task Assigned',
          message: `You have been assigned: ${formData.title}`,
          type: 'task',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/tasks`
        });

        // Send real push notification to phone (DISABLED - n8n will handle notifications)
        if (assignedUser) {
          console.log('📴 Task notification disabled - n8n will handle notification for:', assignedUser.name);
          // await notificationService.sendTaskAssignedNotification(
          //   assignedUser,
          //   formData.title,
          //   state.currentUser?.name || 'Master Admin',
          //   taskId // Pass the actual task ID
          // );
        }

        // Add activity
        await createActivity({
          type: 'task_created',
          description: `Created new task "${formData.title}" for ${departments.find(d => d.id === formData.department)?.name} department`,
          userId: state.currentUser!.id,
          timestamp: new Date().toISOString()
        });
      } else if (mode === 'edit') {
        await updateTask(task!.id, taskData);
        
        // If task status changed to completed, send notification (DISABLED - n8n will handle notifications)
        if (task?.status !== 'completed' && taskData.status === 'completed') {
          const completedBy = state.currentUser?.name || 'User';
          console.log('📴 Task completion notification disabled - n8n will handle notification for:', completedBy);
          // await notificationService.sendTaskCompletedNotification(completedBy, formData.title);
        }
        
        // Add activity
        await createActivity({
          type: 'task_updated',
          description: `Updated task "${formData.title}"`,
          userId: state.currentUser!.id,
          timestamp: new Date().toISOString()
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const departmentUsers = state.users.filter(u => 
    u.department === formData.department && u.role === 'sub'
  );

  if (!isOpen) return null;

  const department = departments.find(d => d.id === task?.department);
  const priority = priorityLevels.find(p => p.id === task?.priority);
  const isOverdue = task ? new Date(task.dueDate) < new Date() && task.status !== 'completed' : false;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {mode === 'create' ? 'Create New Task' : mode === 'edit' ? 'Edit Task' : 'Task Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {mode === 'view' ? (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {task?.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {task?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: department?.color }} />
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{department?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium`} 
                       style={{ backgroundColor: `${priority?.color}20`, color: priority?.color }}>
                    <Flag className="w-2 h-2 sm:w-3 sm:h-3" />
                    {priority?.name}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assigned To
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {state.users.find(u => u.id === task?.assignedTo)?.name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className={`text-xs sm:text-sm ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {formatDate(task?.dueDate || '')}
                    </span>
                  </div>
                </div>
              </div>

              {task?.comments && task.comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Comments</h4>
                  <div className="space-y-3">
                    {task.comments.map(comment => {
                      const commentUser = state.users.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {commentUser?.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value, assignedTo: '' })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={!formData.department}
                  >
                    <option value="">Select User</option>
                    {departmentUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  {mode === 'create' ? 'Create Task' : 'Update Task'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}