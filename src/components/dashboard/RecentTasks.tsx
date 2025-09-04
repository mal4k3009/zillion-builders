import React from 'react';
import { Calendar, User, Flag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { departments, priorityLevels } from '../../data/mockData';

export function RecentTasks() {
  const { state } = useApp();

  const getUserTasks = () => {
    if (state.currentUser?.role === 'master') {
      return state.tasks;
    }
    return state.tasks.filter(task => task.department === state.currentUser?.department);
  };

  const recentTasks = getUserTasks()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {recentTasks.map((task) => {
            const assignedUser = state.users.find(u => u.id === task.assignedTo);
            const department = departments.find(d => d.id === task.department);
            const priority = priorityLevels.find(p => p.id === task.priority);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

            return (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: department?.color }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {department?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {assignedUser?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ 
                    backgroundColor: `${priority?.color}20`, 
                    color: priority?.color 
                  }}>
                    <Flag className="w-2 h-2 inline mr-1" />
                    {priority?.name}
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}