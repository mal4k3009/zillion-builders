import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, User } from 'lucide-react';
import { Task, Project, UserCategory, User as UserType } from '../../types';
import { useApp } from '../../context/AppContext';
import { projectsService, userCategoriesService, tasksService } from '../../firebase/services';
import { priorityLevels, taskStatuses } from '../../data/mockData';
// import { notificationService } from '../../services/notificationService'; // DISABLED - n8n will handle notifications

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  mode: 'create' | 'edit' | 'view';
}

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
  const { state, createNotification, createActivity } = useApp();
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [assignableUsers, setAssignableUsers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    userCategoryId: '',
    category: '', // Renamed from department
    assignedTo: '',
    priority: 'medium' as Task['priority'],
    status: 'pending' as Task['status'],
    dueDate: '',
    isPrivate: false // New field for privacy
  });

  // Load user categories and projects when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading TaskModal data...');
        const [allUserCategories, allProjects] = await Promise.all([
          userCategoriesService.getAll(),
          projectsService.getAll()
        ]);
        console.log('Loaded userCategories:', allUserCategories);
        console.log('Loaded projects:', allProjects);
        setUserCategories(allUserCategories);
        setProjects(allProjects);
      } catch (error) {
        console.error('Error loading data:', error);
        setUserCategories([]);
        setProjects([]);
      }
    };
    
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId?.toString() || '',
        userCategoryId: task.categoryId?.toString() || '',
        category: task.category,
        assignedTo: task.assignedTo.toString(),
        priority: task.priority,
        status: task.status,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
        isPrivate: task.isPrivate || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: '',
        userCategoryId: '',
        category: '',
        assignedTo: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        isPrivate: false
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the assigned user to determine the appropriate status and workflow
    const assignedUser = state.users.find(u => u.id === parseInt(formData.assignedTo));
    if (!assignedUser) {
      alert('Please select a valid user to assign the task to');
      return;
    }
    
    // Determine the appropriate status and additional fields based on assigned user role
    let taskStatus = formData.status;
    const additionalFields: Partial<Task> = {};
    
    if (assignedUser.role === 'director') {
      taskStatus = 'assigned_to_director';
      additionalFields.assignedDirector = assignedUser.id;
    } else if (assignedUser.role === 'employee') {
      taskStatus = 'assigned_to_employee';
      additionalFields.assignedEmployee = assignedUser.id;
      
      // If chairman assigns directly to employee, set up for direct chairman approval
      if (state.currentUser?.role === 'master' && state.currentUser?.designation === 'chairman') {
        additionalFields.skipDirectorApproval = true;
        additionalFields.directChairmanApproval = true;
      } else if (state.currentUser?.role === 'director') {
        // If director assigns to employee, set the director as the assigned director
        additionalFields.assignedDirector = state.currentUser.id;
      }
    }
    
    // Build base task data without undefined fields
    const baseTaskData = {
      title: formData.title,
      category: formData.category || 'general',
      assignedTo: parseInt(formData.assignedTo),
      priority: formData.priority,
      status: taskStatus,
      dueDate: formData.dueDate,
      createdBy: state.currentUser?.id || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: formData.isPrivate,
      tags: [],
      subtasks: [],
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none' as const,
      ...additionalFields
    };

    // Add optional fields only if they have values
    const taskData: Partial<Task> & typeof baseTaskData = { ...baseTaskData };
    
    console.log('Form data before submission:', formData);
    
    if (formData.description) {
      taskData.description = formData.description;
    }
    
    if (formData.projectId) {
      console.log('Adding projectId:', formData.projectId);
      taskData.projectId = formData.projectId; // Keep as string
    }
    
    if (formData.userCategoryId) {
      console.log('Adding categoryId:', formData.userCategoryId, 'parsed:', parseInt(formData.userCategoryId));
      taskData.categoryId = parseInt(formData.userCategoryId);
    }
    
    console.log('Final task data:', taskData);
    
    // Add paused tracking fields only if status is paused
    if (formData.status === 'paused') {
      taskData.pausedAt = new Date().toISOString();
      taskData.pausedBy = state.currentUser!.id;
    }

    try {
      if (mode === 'create') {
        await tasksService.create(taskData);
        
        // Find the assigned user
        const assignedUser = state.users.find(u => u.id === parseInt(formData.assignedTo));
        
        // Add notification for assigned user
        await createNotification({
          userId: parseInt(formData.assignedTo),
          title: 'New Task Assigned',
          message: `You have been assigned: ${formData.title}`,
          type: 'task_assigned',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/tasks`
        });

        // Send WhatsApp notification
        if (assignedUser) {
          console.log('📱 Sending WhatsApp notification for:', assignedUser.name);
          await notificationService.sendTaskAssignedNotification(
            assignedUser,
            formData.title,
            state.currentUser?.name || 'Master Admin',
            taskId // Pass the actual task ID
          );
        }

        // Add activity
        await createActivity({
          type: 'task_created',
          description: `Created new task "${formData.title}"`,
          userId: state.currentUser!.id,
          timestamp: new Date().toISOString()
        });
      } else if (mode === 'edit') {
        await tasksService.update(task!.id, taskData);
        
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

  const handleSubmitWithApproval = async (submitData: typeof formData & { approvalStatus: 'pending_approval' }) => {
    // Build base task data without undefined fields
    const baseTaskData = {
      title: submitData.title,
      category: submitData.category || 'general',
      assignedTo: parseInt(submitData.assignedTo),
      priority: submitData.priority,
      status: submitData.status,
      dueDate: submitData.dueDate,
      createdBy: 1, // TODO: Get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalStatus: submitData.approvalStatus,
      isPrivate: submitData.isPrivate,
      tags: [],
      subtasks: [],
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none' as const
    };

    // Add optional fields only if they have values
    const taskData: Partial<Task> & typeof baseTaskData = { ...baseTaskData };
    
    if (submitData.description) {
      taskData.description = submitData.description;
    }
    
    if (submitData.projectId) {
      taskData.projectId = submitData.projectId; // Keep as string
    }
    
    if (submitData.userCategoryId) {
      taskData.categoryId = parseInt(submitData.userCategoryId);
    }
    
    // Add paused tracking fields only if status is paused
    if (submitData.status === 'paused') {
      taskData.pausedAt = new Date().toISOString();
      taskData.pausedBy = state.currentUser!.id;
    }

    try {
      await tasksService.create(taskData);
      
      // Add notification for master admin about approval request
      const masterUsers = state.users.filter(u => u.role === 'master');
      for (const masterUser of masterUsers) {
        await createNotification({
          userId: masterUser.id,
          title: 'Task Approval Required',
          message: `New task "${submitData.title}" submitted for approval`,
          type: 'approval_required',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard`
        });
      }

      // Add activity
      await createActivity({
        type: 'task_created',
        description: `Created new task "${submitData.title}" for approval`,
        userId: state.currentUser!.id,
        timestamp: new Date().toISOString()
      });

      onClose();
    } catch (error) {
      console.error('Error creating task for approval:', error);
    }
  };

  // Filter users based on role hierarchy for task assignment
  const getAssignableUsers = () => {
    if (!state.currentUser) return [];
    
    const currentUserRole = state.currentUser.role;
    const currentUserDesignation = state.currentUser.designation;
    
    // Chairman (master with chairman designation) can assign to anyone except other chairmen
    if (currentUserRole === 'master' && currentUserDesignation === 'chairman') {
      return state.users.filter(u => 
        u.role === 'director' || 
        u.role === 'employee' || 
        (u.role === 'master' && u.designation !== 'chairman')
      );
    }
    
    // Master (without chairman designation) can assign to anyone
    if (currentUserRole === 'master' && currentUserDesignation !== 'chairman') {
      return state.users;
    }
    
    // Directors can only assign to employees
    if (currentUserRole === 'director') {
      return state.users.filter(u => u.role === 'employee');
    }
    
    // Other roles (employees) cannot assign tasks during creation
    return [];
  };

  // Get assignable users based on status selection and current user role
  const getAssignableUsersForStatus = (selectedStatus: string) => {
    if (!state.currentUser) return [];
    
    const currentUserRole = state.currentUser.role;
    
    switch (selectedStatus) {
      case 'assigned_to_director':
        // Master can assign to directors, Directors can assign to other directors, Chairman can assign to directors
        if (['master', 'director', 'chairman'].includes(currentUserRole)) {
          return state.users.filter(u => u.role === 'director');
        }
        return [];
        
      case 'assigned_to_chairman':
        // Master can assign to chairman, Directors can assign to chairman, Chairman can assign to other chairmen
        if (['master', 'director', 'chairman'].includes(currentUserRole)) {
          return state.users.filter(u => u.role === 'chairman');
        }
        return [];
        
      case 'assigned_to_employee':
        // Master, Director, and Chairman can assign to employees
        if (['master', 'director', 'chairman'].includes(currentUserRole)) {
          return state.users.filter(u => u.role === 'employee');
        }
        return [];
        
      default:
        return [];
    }
  };

  // Handle status change with assignee selection
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'assigned_to_director' || newStatus === 'assigned_to_chairman' || newStatus === 'assigned_to_employee') {
      const assignableUsers = getAssignableUsersForStatus(newStatus);
      
      if (assignableUsers.length === 0) {
        const roleType = newStatus === 'assigned_to_director' ? 'directors' : 
                        newStatus === 'assigned_to_chairman' ? 'chairmen' : 'employees';
        alert(`No ${roleType} available for assignment`);
        return;
      }
      
      if (assignableUsers.length === 1) {
        // Auto-assign if only one user available
        const userId = assignableUsers[0].firebaseUid || assignableUsers[0].uid || assignableUsers[0].id?.toString() || '';
        setFormData(prev => ({ 
          ...prev, 
          status: newStatus as Task['status'],
          assignedTo: userId
        }));
      } else {
        // Show selection modal for multiple users
        setAssignableUsers(assignableUsers);
        setPendingStatus(newStatus);
        setShowAssigneeModal(true);
      }
    } else {
      setFormData(prev => ({ ...prev, status: newStatus as Task['status'] }));
    }
  };

  // Handle assignee selection from modal
  const handleAssigneeSelection = (userId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      status: pendingStatus as Task['status'],
      assignedTo: userId
    }));
    setShowAssigneeModal(false);
    setPendingStatus('');
    setAssignableUsers([]);
  };

  const departmentUsers = getAssignableUsers();
  
  // Debug: Log to check what's happening
  console.log('TaskModal Debug:');
  console.log('- Current user:', state.currentUser);
  console.log('- All users count:', state.users.length);
  console.log('- All users:', state.users);
  console.log('- Assignable users:', departmentUsers);

  if (!isOpen) return null;

  const isOverdue = task ? new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'paused' : false;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {mode === 'create' ? 'Create New Task' : mode === 'edit' ? 'Edit Task' : 'Task Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
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
                    Category
                  </label>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {task?.category || 'No category assigned'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white capitalize">
                    {task?.priority}
                  </span>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white capitalize flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span>{task?.status}</span>
                    {task?.status === 'paused' && task?.pausedAt && (
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        (Paused on {formatDate(task.pausedAt)})
                      </span>
                    )}
                  </span>
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

                <div className="sm:col-span-2">
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

                {/* Privacy Status */}
                {task?.isPrivate && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        🔒 Private Task
                      </span>
                    </div>
                  </div>
                )}
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

              {/* Approval Actions for Master Admin */}
              {task?.approvalStatus === 'pending_approval' && state.currentUser?.role === 'master' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Approval Actions
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        try {
                          await tasksService.update(task.id, { 
                            approvalStatus: 'approved',
                            updatedAt: new Date().toISOString()
                          });
                          
                          await createActivity({
                            type: 'task_updated',
                            description: `Approved task: ${task.title}`,
                            userId: state.currentUser!.id,
                            timestamp: new Date().toISOString()
                          });

                          onClose();
                        } catch (error) {
                          console.error('Error approving task:', error);
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Approve Task
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await tasksService.update(task.id, { 
                            approvalStatus: 'rejected',
                            updatedAt: new Date().toISOString()
                          });
                          
                          await createActivity({
                            type: 'task_updated',
                            description: `Rejected task: ${task.title}`,
                            userId: state.currentUser!.id,
                            timestamp: new Date().toISOString()
                          });

                          onClose();
                        } catch (error) {
                          console.error('Error rejecting task:', error);
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Reject Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Project (Optional)</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.userCategoryId}
                    onChange={(e) => setFormData({ ...formData, userCategoryId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Category (Optional)</option>
                    {userCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status field - only show in edit mode */}
                {mode === 'edit' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {taskStatuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Privacy Option */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isPrivate" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Send as Private Task
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                    When enabled, this task will be sent privately to the assignee only
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                {/* Show different submit options based on user role */}
                {mode === 'create' && state.currentUser?.role !== 'master' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Create Task
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        // Submit with approval status
                        const submitData = {
                          ...formData,
                          approvalStatus: 'pending_approval' as const
                        };
                        handleSubmitWithApproval(submitData);
                      }}
                      className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Submit for Approval
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    {mode === 'create' ? 'Create Task' : 'Update Task'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Assignee Selection Modal */}
      {showAssigneeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select {pendingStatus === 'assigned_to_director' ? 'Director' : 
                          pendingStatus === 'assigned_to_chairman' ? 'Chairman' : 'Employee'}
                </h3>
                <button
                  onClick={() => {
                    setShowAssigneeModal(false);
                    setPendingStatus('');
                    setAssignableUsers([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {assignableUsers.map(user => (
                  <button
                    key={user.firebaseUid || user.uid || user.id}
                    onClick={() => handleAssigneeSelection(user.firebaseUid || user.uid || user.id?.toString() || '')}
                    className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.role} - {user.designation}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowAssigneeModal(false);
                  setPendingStatus('');
                  setAssignableUsers([]);
                }}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}