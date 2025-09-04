import React from 'react';
import { BarChart3, TrendingUp, Users, CheckSquare, Calendar, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { departments } from '../../data/mockData';

export function AnalyticsPage() {
  const { state } = useApp();

  const getDepartmentTaskStats = () => {
    const stats = departments.map(dept => {
      const deptTasks = state.tasks.filter(task => task.department === dept.id);
      const completed = deptTasks.filter(t => t.status === 'completed').length;
      const inProgress = deptTasks.filter(t => t.status === 'in-progress').length;
      const pending = deptTasks.filter(t => t.status === 'pending').length;
      const overdue = deptTasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length;

      return {
        department: dept.name,
        color: dept.color,
        total: deptTasks.length,
        completed,
        inProgress,
        pending,
        overdue,
        completionRate: deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0
      };
    });

    return stats;
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

  const departmentStats = getDepartmentTaskStats();
  const priorityDistribution = getPriorityDistribution();
  const productivityMetrics = getProductivityMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks This Week</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{productivityMetrics.tasksThisWeek}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${productivityMetrics.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {productivityMetrics.weeklyGrowth >= 0 ? '+' : ''}{productivityMetrics.weeklyGrowth}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last week</span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{productivityMetrics.averageCompletion}%</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${productivityMetrics.averageCompletion}%` }}
                />
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Admins</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{productivityMetrics.activeUsers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sub administrators</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{state.tasks.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All time</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Department Performance</h3>
          <div className="space-y-6">
            {departmentStats.map((dept) => (
              <div key={dept.department}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.department}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{dept.completionRate}% completed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${dept.completionRate}%`,
                      backgroundColor: dept.color
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Total: {dept.total}</span>
                  <span>Completed: {dept.completed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Priority Distribution</h3>
          <div className="space-y-4">
            {priorityDistribution.map((priority) => {
              const percentage = state.tasks.length > 0 ? Math.round((priority.count / state.tasks.length) * 100) : 0;
              return (
                <div key={priority.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {priority.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{priority.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Task Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentStats.map((dept) => (
            <div key={dept.department} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">{dept.department}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{dept.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">{dept.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="text-sm font-medium text-green-600">{dept.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Overdue</span>
                  <span className="text-sm font-medium text-red-600">{dept.overdue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Performance Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Insights</h3>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {productivityMetrics.averageCompletion}%
              </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Average Completion</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Across all departments</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(state.tasks.length / departments.length)}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Avg Tasks per Dept</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Task distribution</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {state.tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">High Priority</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Urgent & high priority tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}