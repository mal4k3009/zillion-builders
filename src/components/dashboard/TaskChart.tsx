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
    <div className="bg-pure-white dark:bg-dark-gray rounded-xl shadow-sm border border-light-gray dark:border-soft-black">
      <div className="p-6 border-b border-light-gray dark:border-soft-black">
        <h3 className="text-lg font-semibold text-deep-charcoal dark:text-pure-white">Tasks by Department</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {Object.entries(stats).map(([dept, data]) => (
            <div key={dept} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-deep-charcoal dark:text-pure-white capitalize">
                  {dept}
                </span>
                <span className="text-sm text-medium-gray">
                  {data.pending + data.inProgress + data.completed} total
                </span>
              </div>
              <div className="flex gap-1 h-2">
                <div 
                  className={`${dept === 'sales' ? 'bg-brand-gold' : 'bg-yellow-500'} rounded-full`}
                  style={{ width: `${(data.pending / (maxValue || 1)) * 100}%` }}
                  title={`Pending: ${data.pending}`}
                />
                <div 
                  className={`${dept === 'sales' ? 'bg-accent-gold' : 'bg-blue-500'} rounded-full`}
                  style={{ width: `${(data.inProgress / (maxValue || 1)) * 100}%` }}
                  title={`In Progress: ${data.inProgress}`}
                />
                <div 
                  className="bg-green-500 rounded-full"
                  style={{ width: `${(data.completed / (maxValue || 1)) * 100}%` }}
                  title={`Completed: ${data.completed}`}
                />
              </div>
              <div className="flex justify-between text-xs text-medium-gray">
                <span>Pending: {data.pending}</span>
                <span>In Progress: {data.inProgress}</span>
                <span>Completed: {data.completed}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-light-gray dark:border-soft-black">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-medium-gray">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-medium-gray">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-medium-gray">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}