import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskModal } from '../tasks/TaskModal';
import { priorityLevels } from '../../data/mockData';

export function CalendarPage() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const getUserTasks = () => {
    if (state.currentUser?.role === 'master') {
      return state.tasks;
    }
    return state.tasks.filter(task => task.assignedTo === state.currentUser?.id);
  };

  const tasks = getUserTasks();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);

    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        tasks: dayTasks
      });
    }

    return days;
  }, [currentDate, tasks]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectedDateTasks = selectedDate 
    ? tasks.filter(task => 
        new Date(task.dueDate).toDateString() === selectedDate.toDateString()
      )
    : [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        {state.currentUser?.role === 'master' && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    p-2 min-h-[80px] rounded-lg text-left border transition-all hover:border-blue-300
                    ${day.isCurrentMonth 
                      ? 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                    }
                    ${day.isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    ${selectedDate?.toDateString() === day.date.toDateString() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.tasks.slice(0, 2).map(task => {
                      const priority = priorityLevels.find(p => p.id === task.priority);
                      return (
                        <div
                          key={task.id}
                          className="text-xs p-1 rounded truncate"
                          style={{ backgroundColor: `${priority?.color}20`, color: priority?.color }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {day.tasks.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{day.tasks.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate 
                ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'Select a date'
              }
            </h3>
          </div>

          <div className="p-6">
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-3">
                {selectedDateTasks.map(task => {
                  const assignedUser = state.users.find(u => u.id === task.assignedTo);
                  const priority = priorityLevels.find(p => p.id === task.priority);
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-l-blue-500"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {assignedUser?.name} • {task.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ 
                          backgroundColor: `${priority?.color}20`, 
                          color: priority?.color 
                        }}>
                          {priority?.name}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </div>
                      </div>
                      {isOverdue && (
                        <p className="text-xs text-red-600 mt-2 font-medium">⚠ Overdue</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDate ? 'No tasks for this date' : 'Select a date to view tasks'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        mode="create"
      />
    </div>
  );
}