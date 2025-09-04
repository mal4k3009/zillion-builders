import React from 'react';
import { useApp } from '../../context/AppContext';

export function TaskChart() {
  const { state } = useApp();

  const getDepartmentStats = () => {
    const stats = {
      sales: { pending: 0, inProgress: 0, completed: 0 },
      pr: { pending: 0, inProgress: 0, completed: 0 },
      marketing: { pending: 0, inProgress: 0, completed: 0 },
      operations: { pending: 0, inProgress: 0, completed: 0 }
    };

    state.tasks.forEach(task => {
      if (stats[task.department as keyof typeof stats]) {
        if (task.status === 'pending') stats[task.department as keyof typeof stats].pending++;
        else if (task.status === 'in-progress') stats[task.department as keyof typeof stats].inProgress++;
        else if (task.status === 'completed') stats[task.department as keyof typeof stats].completed++;
      }
    });

    return stats;
  };

  const stats = getDepartmentStats();
  const maxValue = Math.max(...Object.values(stats).flatMap(dept => [dept.pending, dept.inProgress, dept.completed]));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Department</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {Object.entries(stats).map(([dept, data]) => (
            <div key={dept} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {dept}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {data.pending + data.inProgress + data.completed} total
                </span>
              </div>
              <div className="flex gap-1 h-2">
                <div 
                  className="bg-yellow-500 rounded-full"
                  style={{ width: `${(data.pending / (maxValue || 1)) * 100}%` }}
                  title={`Pending: ${data.pending}`}
                />
                <div 
                  className="bg-blue-500 rounded-full"
                  style={{ width: `${(data.inProgress / (maxValue || 1)) * 100}%` }}
                  title={`In Progress: ${data.inProgress}`}
                />
                <div 
                  className="bg-green-500 rounded-full"
                  style={{ width: `${(data.completed / (maxValue || 1)) * 100}%` }}
                  title={`Completed: ${data.completed}`}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Pending: {data.pending}</span>
                <span>In Progress: {data.inProgress}</span>
                <span>Completed: {data.completed}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}