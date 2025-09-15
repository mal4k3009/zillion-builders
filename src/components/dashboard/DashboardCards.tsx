import { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskListModal } from './TaskListModal';
import { Task } from '../../types';

export function DashboardCards() {
  const { state } = useApp();
  const { currentUser } = state;
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalTasks, setModalTasks] = useState<Task[]>([]);

  const getUserTasks = () => {
    if (currentUser?.role === 'master') {
      return state.tasks;
    }
    return state.tasks.filter(task => task.assignedTo === currentUser?.id);
  };

  const tasks = getUserTasks();
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => 
    new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );

  const handleCardClick = (taskList: Task[], title: string) => {
    setModalTasks(taskList);
    setModalTitle(title);
    setShowTaskModal(true);
  };

  const cards = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      tasks: tasks,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
      clickable: true
    },
    {
      title: 'Pending',
      value: pendingTasks.length,
      tasks: pendingTasks,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      change: '-5%',
      trend: 'down',
      clickable: true
    },
    {
      title: 'In Progress',
      value: inProgressTasks.length,
      tasks: inProgressTasks,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up',
      clickable: true
    },
    {
      title: 'Completed',
      value: completedTasks.length,
      tasks: completedTasks,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-green-600',
      change: '+15%',
      trend: 'up',
      clickable: true
    },
    {
      title: 'Overdue',
      value: overdueTasks.length,
      tasks: overdueTasks,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-red-500',
      change: '-15%',
      trend: 'down',
      clickable: true
    }
  ];

  if (currentUser?.role === 'master') {
    cards.push(
      {
        title: 'Active Users',
        value: state.users.filter(u => u.status === 'active' && u.role === 'sub').length,
        tasks: [], // No tasks for users card
        icon: <Users className="w-6 h-6" />,
        color: 'bg-purple-500',
        change: '+3%',
        trend: 'up',
        clickable: false
      },
      {
        title: 'Due This Week',
        value: tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          return dueDate <= nextWeek && t.status !== 'completed';
        }).length,
        tasks: tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          return dueDate <= nextWeek && t.status !== 'completed';
        }),
        icon: <Calendar className="w-6 h-6" />,
        color: 'bg-indigo-500',
        change: '+22%',
        trend: 'up',
        clickable: true
      }
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {cards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => card.clickable ? handleCardClick(card.tasks, card.title) : undefined}
            className={`bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-4 sm:p-6 transition-all duration-200 ${
              card.clickable ? 'hover:shadow-md cursor-pointer hover:scale-105' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-medium-gray mb-1 truncate">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-deep-charcoal dark:text-pure-white">
                  {card.value}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <span className={`text-xs sm:text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs sm:text-sm text-medium-gray ml-1 hidden sm:inline">vs last month</span>
                  <span className="text-xs text-medium-gray ml-1 sm:hidden">vs last mo</span>
                </div>
              </div>
              <div className={`${card.color === 'bg-blue-500' ? 'bg-brand-gold' : card.color} p-2 sm:p-3 rounded-lg sm:rounded-xl text-white flex-shrink-0`}>
                <span className="w-4 h-4 sm:w-6 sm:h-6">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task List Modal */}
      <TaskListModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={modalTitle}
        tasks={modalTasks}
        onTaskClick={(task) => {
          // TODO: Add task detail view or edit functionality
          console.log('Task clicked:', task);
          setShowTaskModal(false);
        }}
      />
    </>
  );
}