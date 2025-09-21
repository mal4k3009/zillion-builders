import { BarChart3, TrendingUp, Users, CheckSquare, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AnalyticsPage() {
  const { state } = useApp();
  // Compute per-user task statistics

  const getUserTaskStats = () => {
    // Get all users who have tasks assigned
    const usersWithTasks = state.users.filter(user => 
      state.tasks.some(task => task.assignedTo === user.id)
    );
    
    const stats = usersWithTasks.map(user => {
      const userTasks = state.tasks.filter(task => task.assignedTo === user.id);
      const completed = userTasks.filter(t => t.status === 'completed').length;
      const inProgress = userTasks.filter(t => t.status === 'in-progress').length;
      const pending = userTasks.filter(t => t.status === 'pending').length;
      const paused = userTasks.filter(t => t.status === 'paused').length;
      const overdue = userTasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'paused'
      ).length;

      // Generate a color based on user role or assign random colors
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const userColor = colors[user.id % colors.length];

      return {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        color: userColor,
        total: userTasks.length,
        completed,
        inProgress,
        pending,
        paused,
        overdue,
        completionRate: userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0
      };
    });

    return stats.sort((a, b) => b.total - a.total); // Sort by total tasks descending
  };

  const getPriorityDistribution = () => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities.map(priority => ({
      priority,
      count: state.tasks.filter(task => task.priority === priority).length,
      color: {
        low: '#6B7280',
        medium: '#F59E0B',
        high: '#EF4444',
        urgent: '#DC2626'
      }[priority]
    }));
  };

  const getProductivityMetrics = () => {
    const thisWeek = state.tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return taskDate >= oneWeekAgo;
    }).length;

    const lastWeek = state.tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return taskDate >= twoWeeksAgo && taskDate < oneWeekAgo;
    }).length;

    const weeklyGrowth = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

    return {
      tasksThisWeek: thisWeek,
      weeklyGrowth,
      averageCompletion: Math.round((state.tasks.filter(t => t.status === 'completed').length / state.tasks.length) * 100) || 0,
      activeUsers: state.users.filter(u => u.status === 'active' && u.role === 'sub').length
    };
  };

  const userStats = getUserTaskStats();
  const priorityDistribution = getPriorityDistribution();
  const productivityMetrics = getProductivityMetrics();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-deep-charcoal dark:text-pure-white">Analytics & Reports</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm lg:text-base w-fit">
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-medium-gray">Tasks This Week</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-deep-charcoal dark:text-pure-white">{productivityMetrics.tasksThisWeek}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <span className={`text-xs sm:text-sm font-medium ${productivityMetrics.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {productivityMetrics.weeklyGrowth >= 0 ? '+' : ''}{productivityMetrics.weeklyGrowth}%
                </span>
                <span className="text-xs sm:text-sm text-medium-gray ml-1 hidden sm:inline">vs last week</span>
                <span className="text-xs text-medium-gray ml-1 sm:hidden">vs last wk</span>
              </div>
            </div>
            <div className="bg-brand-gold p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-pure-white" />
            </div>
          </div>
        </div>

        <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-medium-gray">Completion Rate</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-deep-charcoal dark:text-pure-white">{productivityMetrics.averageCompletion}%</p>
              <div className="w-full bg-light-gray dark:bg-soft-black rounded-full h-1.5 sm:h-2 mt-1 sm:mt-2">
                <div 
                  className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${productivityMetrics.averageCompletion}%` }}
                />
              </div>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-pure-white" />
            </div>
          </div>
        </div>

        <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-medium-gray">Active Admins</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-deep-charcoal dark:text-pure-white">{productivityMetrics.activeUsers}</p>
              <p className="text-xs sm:text-sm text-medium-gray mt-1 sm:mt-2">Sub administrators</p>
            </div>
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-pure-white" />
            </div>
          </div>
        </div>

        <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-medium-gray">Total Tasks</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-deep-charcoal dark:text-pure-white">{state.tasks.length}</p>
              <p className="text-xs sm:text-sm text-medium-gray mt-1 sm:mt-2">All time</p>
            </div>
            <div className="bg-brand-gold p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-pure-white" />
            </div>
          </div>
        </div>
      </div>

      {/* User Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white mb-3 sm:mb-4 lg:mb-6">User Performance</h3>
          <div className="space-y-4 sm:space-y-6">
            {userStats.map((userData) => (
              <div key={userData.userId}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white truncate">{userData.userName}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 capitalize flex-shrink-0">
                      {userData.userRole}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-medium-gray">{userData.completionRate}% completed</span>
                </div>
                <div className="w-full bg-light-gray dark:bg-soft-black rounded-full h-2 sm:h-3">
                  <div 
                    className="h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${userData.completionRate}%`,
                      backgroundColor: userData.color
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-medium-gray mt-1">
                  <span>Total: {userData.total}</span>
                  <span>Completed: {userData.completed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white mb-3 sm:mb-4 lg:mb-6">Priority Distribution</h3>
          <div className="space-y-3 sm:space-y-4">
            {priorityDistribution.map((priority) => {
              const percentage = state.tasks.length > 0 ? Math.round((priority.count / state.tasks.length) * 100) : 0;
              return (
                <div key={priority.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white capitalize truncate">
                      {priority.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-medium-gray">{percentage}%</span>
                    <span className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white">{priority.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Status Overview */}
      <div className="bg-pure-white dark:bg-dark-gray rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-6">
        <h3 className="text-lg font-semibold text-deep-charcoal dark:text-pure-white mb-6">User Task Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {userStats.map((userData) => (
            <div key={userData.userId} className="bg-off-white dark:bg-soft-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: userData.color }}
                />
                <h4 className="font-medium text-deep-charcoal dark:text-pure-white truncate">{userData.userName}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-medium-gray">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{userData.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-medium-gray">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">{userData.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-medium-gray">Completed</span>
                  <span className="text-sm font-medium text-green-600">{userData.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-medium-gray">Paused</span>
                  <span className="text-sm font-medium text-purple-600">{userData.paused}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-medium-gray">Overdue</span>
                  <span className="text-sm font-medium text-red-600">{userData.overdue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Performance Trends */}
      <div className="bg-pure-white dark:bg-dark-gray rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-deep-charcoal dark:text-pure-white">Performance Insights</h3>
          <TrendingUp className="w-5 h-5 text-brand-gold" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-brand-gold">
                {productivityMetrics.averageCompletion}%
              </span>
            </div>
            <h4 className="font-medium text-deep-charcoal dark:text-pure-white">Average Completion</h4>
            <p className="text-sm text-medium-gray">Across all users</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-accent-gold">
                {userStats.length > 0 ? Math.round(state.tasks.length / userStats.length) : 0}
              </span>
            </div>
            <h4 className="font-medium text-deep-charcoal dark:text-pure-white">Avg Tasks per User</h4>
            <p className="text-sm text-medium-gray">Task distribution</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {state.tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
              </span>
            </div>
            <h4 className="font-medium text-deep-charcoal dark:text-pure-white">High Priority</h4>
            <p className="text-sm text-medium-gray">Urgent & high priority tasks</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userStats.length > 0 ? Math.round(userStats.reduce((sum, user) => sum + user.completionRate, 0) / userStats.length) : 0}%
              </span>
            </div>
            <h4 className="font-medium text-deep-charcoal dark:text-pure-white">Avg User Performance</h4>
            <p className="text-sm text-medium-gray">Average completion rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}