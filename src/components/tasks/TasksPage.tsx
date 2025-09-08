import React, { useState, useMemo } from 'react';
import { Plus, Grid, List } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { TaskFilters } from './TaskFilters';
import { Task } from '../../types';

export function TasksPage() {
  const { state } = useApp();
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

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;

    // Filter by user role
    if (state.currentUser?.role === 'sub') {
      tasks = tasks.filter(task => task.department === state.currentUser?.department);
    }

    // Apply filters
    if (searchTerm) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      tasks = tasks.filter(task => task.department === departmentFilter);
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
  }, [state.tasks, state.currentUser, searchTerm, departmentFilter, statusFilter, priorityFilter, dueDateFilter]);

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

  const handleDeleteTask = (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      state.dispatch({ type: 'DELETE_TASK', payload: taskId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-deep-charcoal dark:text-pure-white">
          Task Management
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-off-white dark:bg-soft-black rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-pure-white dark:bg-dark-gray shadow-sm' 
                  : 'hover:bg-light-gray dark:hover:bg-dark-gray'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-pure-white dark:bg-dark-gray shadow-sm' 
                  : 'hover:bg-light-gray dark:hover:bg-dark-gray'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {state.currentUser?.role === 'master' && (
            <button
              onClick={handleCreateTask}
              className="bg-brand-gold hover:bg-accent-gold text-pure-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
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