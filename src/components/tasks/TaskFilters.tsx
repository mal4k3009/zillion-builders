import { Search, Filter, Calendar, User, FolderOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

const taskStatuses = [
  { id: 'pending', name: 'Pending', color: '#6B7280' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'completed', name: 'Completed', color: '#10B981' },
  { id: 'paused', name: 'Paused', color: '#8B5CF6' }
];

// Staff-specific statuses for button layout
const staffStatuses = [
  { id: 'pending', name: 'Pending', color: '#6B7280' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'pending_director_approval', name: 'Sent for Approval', color: '#8B5CF6' },
  { id: 'completed', name: 'Complete', color: '#10B981' },
  { id: 'rejected', name: 'Re-approval', color: '#EF4444' }
];

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  dueDateFilter: string;
  onDueDateChange: (date: string) => void;
  userFilter: string;
  onUserChange: (userId: string) => void;
  projectFilter: string;
  onProjectChange: (projectId: string) => void;
}

export function TaskFilters({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  dueDateFilter,
  onDueDateChange,
  userFilter,
  onUserChange,
  projectFilter,
  onProjectChange
}: TaskFiltersProps) {
  const { state } = useApp();
  return (
    <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-medium-gray" />
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-deep-charcoal dark:text-pure-white">Filters</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-medium-gray" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
          />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-medium-gray" />
          <select
            value={userFilter}
            onChange={(e) => onUserChange(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white appearance-none"
          >
            <option value="">All Users</option>
            {state.users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-medium-gray" />
          <select
            value={projectFilter}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white appearance-none"
          >
            <option value="">All Projects</option>
            {state.projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        {/* Status Filter - Dropdown for non-staff, Buttons for staff */}
        {state.currentUser?.role === 'employee' ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStatusChange('')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === '' 
                    ? 'bg-brand-gold text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {staffStatuses.map(status => (
                <button
                  key={status.id}
                  onClick={() => onStatusChange(status.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === status.id 
                      ? 'text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: statusFilter === status.id ? status.color : undefined
                  }}
                >
                  {status.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
          >
            <option value="">All Statuses</option>
            {taskStatuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
        >
          <option value="">All Priorities</option>
          {priorityLevels.map(priority => (
            <option key={priority.id} value={priority.id}>
              {priority.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-medium-gray" />
          <input
            type="date"
            value={dueDateFilter}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
          />
        </div>
      </div>
    </div>
  );
}