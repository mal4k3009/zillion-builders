import { useApp } from '../../context/AppContext';

export function TaskChart() {
  const { state } = useApp();

  const getTaskStats = () => {
    // Create dynamic stats based on available categories
    const categoryStats: Record<string, { pending: number; inProgress: number; completed: number }> = {};

    state.tasks.forEach(task => {
      const category = task.category || 'uncategorized';
      
      if (!categoryStats[category]) {
        categoryStats[category] = { pending: 0, inProgress: 0, completed: 0 };
      }

      if (task.status === 'pending') categoryStats[category].pending++;
      else if (task.status === 'in-progress') categoryStats[category].inProgress++;
      else if (task.status === 'completed') categoryStats[category].completed++;
    });

    return categoryStats;
  };

  const stats = getTaskStats();
  const maxValue = Math.max(...Object.values(stats).flatMap(category => [category.pending, category.inProgress, category.completed]));

  return (
    <div className="bg-pure-white dark:bg-dark-gray rounded-xl shadow-sm border border-light-gray dark:border-soft-black">
      <div className="p-6 border-b border-light-gray dark:border-soft-black">
        <h3 className="text-lg font-semibold text-deep-charcoal dark:text-pure-white">Tasks by Category</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {Object.entries(stats).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-deep-charcoal dark:text-pure-white capitalize">
                  {category}
                </span>
                <span className="text-sm text-medium-gray">
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