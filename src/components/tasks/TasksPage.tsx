import { useState, useMemo } from 'react';
import { Plus, Grid, List, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { TaskFilters } from './TaskFilters';
// import { NotificationPermissionBanner } from '../notifications/NotificationPermissionBanner'; // REMOVED
import { Task } from '../../types';

export function TasksPage() {
  const { state, deleteTask } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;

    // Role-based task filtering
    if (state.currentUser) {
      const userRole = state.currentUser.role;
      const userId = state.currentUser.id;
      
      if (userRole === 'employee') {
        // Employees can only see tasks assigned to them
        tasks = tasks.filter(task => task.assignedTo === userId);
      } else if (userRole === 'director') {
        // Directors can see:
        // 1. All tasks created by any director
        // 2. Tasks assigned to them
        // 3. Tasks they need to approve
        const directorUsers = state.users.filter(u => u.role === 'director').map(u => u.id);
        tasks = tasks.filter(task => 
          directorUsers.includes(task.createdBy) || // Created by any director
          task.assignedTo === userId || // Assigned to this director
          task.assignedDirector === userId || // This director needs to approve
          (task.approvalChain && task.approvalChain.some(approval => 
            approval.approverRole === 'director' && approval.approverUserId === userId
          ))
        );
      } else if (userRole === 'chairman' || userRole === 'master') {
        // Chairman and Master can see ALL tasks (highest privilege level)
        // No filtering needed - they should see everything
        // This includes tasks created by directors, employees, and other chairman/master users
      }
      // If role is 'sub' (legacy), show only assigned tasks
      else if (userRole === 'sub') {
        tasks = tasks.filter(task => task.assignedTo === userId);
      }
    }

    // Apply filters
    if (searchTerm) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (userFilter) {
      tasks = tasks.filter(task => task.assignedTo === parseInt(userFilter));
    }

    if (projectFilter) {
      tasks = tasks.filter(task => task.projectId === parseInt(projectFilter));
    }

    if (departmentFilter) {
      tasks = tasks.filter(task => task.category === departmentFilter);
    }

    if (statusFilter) {
      tasks = tasks.filter(task => task.status === statusFilter);
    }

    if (priorityFilter) {
      tasks = tasks.filter(task => task.priority === priorityFilter);
    }

    if (dueDateFilter) {
      const filterDate = new Date(dueDateFilter);
      tasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }

    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.tasks, state.users, state.currentUser, searchTerm, userFilter, projectFilter, departmentFilter, statusFilter, priorityFilter, dueDateFilter]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalMode('create');
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setShowTaskModal(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('view');
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        // Task deleted successfully - UI will update automatically
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* <NotificationPermissionBanner /> */}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-deep-charcoal dark:text-pure-white">
          Task Management
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex bg-off-white dark:bg-soft-black rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-pure-white dark:bg-dark-gray shadow-sm' 
                  : 'hover:bg-light-gray dark:hover:bg-dark-gray'
              }`}
            >
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-pure-white dark:bg-dark-gray shadow-sm' 
                  : 'hover:bg-light-gray dark:hover:bg-dark-gray'
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {(state.currentUser?.role === 'master' || state.currentUser?.role === 'director') && (
            <button
              onClick={handleCreateTask}
              className="bg-brand-gold hover:bg-accent-gold text-pure-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New Task</span>
              <span className="xs:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      <TaskFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        dueDateFilter={dueDateFilter}
        onDueDateChange={setDueDateFilter}
        userFilter={userFilter}
        onUserChange={setUserFilter}
        projectFilter={projectFilter}
        onProjectChange={setProjectFilter}
      />

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-medium-gray mx-auto mb-4" />
          <h3 className="text-lg font-medium text-deep-charcoal dark:text-pure-white mb-2">No tasks found</h3>
          <p className="text-medium-gray">
            {state.currentUser?.role === 'master' 
              ? 'Create your first task to get started.' 
              : 'No tasks have been assigned to your department yet.'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onView={handleViewTask}
            />
          ))}
        </div>
      )}

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  );
}