import React from 'react';
import { Search, Filter, Calendar, Flag } from 'lucide-react';
import { departments, priorityLevels, taskStatuses } from '../../data/mockData';

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
  onDueDateChange
}: TaskFiltersProps) {
  return (
    <div className="bg-pure-white dark:bg-dark-gray rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-medium-gray" />
        <h3 className="text-lg font-semibold text-deep-charcoal dark:text-pure-white">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medium-gray" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="px-4 py-3 border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-3 border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
        >
          <option value="">All Statuses</option>
          {taskStatuses.map(status => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-4 py-3 border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
        >
          <option value="">All Priorities</option>
          {priorityLevels.map(priority => (
            <option key={priority.id} value={priority.id}>
              {priority.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medium-gray" />
          <input
            type="date"
            value={dueDateFilter}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
          />
        </div>
      </div>
    </div>
  );
}