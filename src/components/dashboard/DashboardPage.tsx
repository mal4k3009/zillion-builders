import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardCards } from './DashboardCards';
import { ActivityFeed } from './ActivityFeed';
import { TaskChart } from './TaskChart';
import { RecentTasks } from './RecentTasks';
import { ApprovalSection } from './ApprovalSection';
import { PendingTasksPopup } from './PendingTasksPopup';

export function DashboardPage() {
  const { state } = useApp();
  const [showPendingTasksPopup, setShowPendingTasksPopup] = useState(false);
  
  // Check if user should see pending tasks popup (only directors and employees)
  const shouldShowPopup = state.currentUser?.role === 'director' || state.currentUser?.role === 'employee';
  
  // Get pending tasks for the current user
  const getPendingTasks = () => {
    if (!state.currentUser) return [];
    
    const currentUserId = state.currentUser.id;
    const currentUserRole = state.currentUser.role;
    
    return state.tasks.filter(task => {
      // For employees: show tasks assigned to them that are pending or in progress
      if (currentUserRole === 'employee') {
        return task.assignedTo === currentUserId && 
               (task.status === 'assigned_to_employee' || task.status === 'in_progress');
      }
      
      // For directors: show tasks they need to handle or approve
      if (currentUserRole === 'director') {
        return (task.assignedDirector === currentUserId && 
                (task.status === 'assigned_to_director' || 
                 task.status === 'pending_director_approval')) ||
               (task.createdBy === currentUserId && 
                (task.status === 'pending' || task.status === 'assigned_to_director'));
      }
      
      return false;
    });
  };
  
  const pendingTasks = getPendingTasks();
  
  // Show popup on dashboard load if user has pending tasks
  useEffect(() => {
    if (shouldShowPopup && pendingTasks.length > 0) {
      // Add a small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setShowPendingTasksPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowPopup, pendingTasks.length]);

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      
      {/* Approval Section for Admin Users */}
      <ApprovalSection />
      
      <DashboardCards />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="xl:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
          <TaskChart />
          <RecentTasks />
        </div>
        <div className="xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>
      
      {/* Pending Tasks Popup - Only for Directors and Staff */}
      {shouldShowPopup && (
        <PendingTasksPopup
          isOpen={showPendingTasksPopup}
          onClose={() => setShowPendingTasksPopup(false)}
          tasks={pendingTasks}
        />
      )}
    </div>
  );
}