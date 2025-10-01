import { Calendar, User, Flag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { priorityLevels } from '../../data/mockData';

export function RecentTasks() {
  const { state } = useApp();

  const getUserTasks = () => {
    if (!state.currentUser) return [];
    
    const userRole = state.currentUser.role;
    const userId = state.currentUser.id;
    let tasks = state.tasks;
    
    if (userRole === 'employee') {
      // Employees can only see tasks assigned to them
      tasks = tasks.filter(task => task.assignedTo === userId);
    } else if (userRole === 'director') {
      // Directors can see all tasks created by any director + their assigned/approval tasks
      const directorUsers = state.users.filter(u => u.role === 'director').map(u => u.id);
      tasks = tasks.filter(task => 
        directorUsers.includes(task.createdBy) || 
        task.assignedTo === userId || 
        task.assignedDirector === userId ||
        (task.approvalChain && task.approvalChain.some(approval => 
          approval.approverRole === 'director' && approval.approverUserId === userId
        ))
      );
    } else if (userRole === 'chairman' || userRole === 'master') {
      // Chairman and Master can see ALL tasks (highest privilege level)
      // No filtering needed - they should see everything including director and employee tasks
    } else {
      // Default: show only assigned tasks
      tasks = tasks.filter(task => task.assignedTo === userId);
    }
    
    return tasks;
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
    <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black">
      <div className="p-3 sm:p-4 lg:p-6 border-b border-light-gray dark:border-soft-black">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white">Recent Tasks</h3>
          <button className="text-xs sm:text-sm text-brand-gold hover:text-accent-gold font-medium flex items-center gap-1">
            View All
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          {recentTasks.map((task) => {
            const assignedUser = state.users.find(u => u.id === task.assignedTo);
            const priority = priorityLevels.find(p => p.id === task.priority);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

            return (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-off-white dark:bg-soft-black rounded-lg hover:bg-light-gray dark:hover:bg-dark-gray transition-colors cursor-pointer gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white truncate">
                    {task.title}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-xs text-medium-gray truncate">
                        {task.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-medium-gray flex-shrink-0" />
                      <span className="text-xs text-medium-gray truncate">
                        {assignedUser?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ 
                    backgroundColor: `${priority?.color}20`, 
                    color: priority?.color 
                  }}>
                    <Flag className="w-2 h-2 inline mr-1" />
                    {priority?.name}
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-medium-gray'}`}>
                    <Calendar className="w-3 h-3 flex-shrink-0" />
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