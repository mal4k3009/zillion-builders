import { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApprovalTaskCard } from './ApprovalTaskCard';
import { TaskModal } from '../tasks/TaskModal';
import { Task } from '../../types';
import { tasksService } from '../../firebase/services';

export function ApprovalSection() {
  const { state, createActivity } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pendingApprovalTasks, setPendingApprovalTasks] = useState<Task[]>([]);

  const currentUser = state.currentUser;
  const currentUserRole = currentUser?.role;

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (!currentUser || (currentUserRole !== 'master' && currentUserRole !== 'director' && currentUserRole !== 'chairman')) {
        console.log('🚫 ApprovalSection: User check failed', { currentUser, currentUserRole });
        return;
      }
      
      console.log('🔍 ApprovalSection: Fetching approvals for', { 
        userId: currentUser.id, 
        role: currentUserRole 
      });
      
      try {
        const tasks = await tasksService.getTasksAwaitingApproval(
          currentUser.id, 
          currentUserRole as 'director' | 'master' | 'chairman'
        );
        console.log('📋 ApprovalSection: Received tasks', { 
          count: tasks.length, 
          tasks: tasks.map(t => ({ 
            id: t.id, 
            title: t.title, 
            status: t.status, 
            currentApprovalLevel: t.currentApprovalLevel,
            approvalChain: t.approvalChain 
          }))
        });
        setPendingApprovalTasks(tasks);
      } catch (error) {
        console.error('❌ ApprovalSection: Error fetching pending approvals:', error);
      }
    };

    fetchPendingApprovals();
  }, [currentUser, currentUserRole]);

  // Only show for directors, master admins, and chairmen
  if (currentUserRole !== 'master' && currentUserRole !== 'director' && currentUserRole !== 'chairman') {
    return null;
  }

  const handleApprove = async (taskId: string) => {
    try {
      if (currentUserRole === 'director') {
        await tasksService.approveByDirector(taskId, true);
      } else if (currentUserRole === 'master') {
        await tasksService.approveByAdmin(taskId, true);
      } else if (currentUserRole === 'chairman') {
        await tasksService.approveByChairman(taskId, true);
      }
      
      // Add activity log
      if (createActivity) {
        await createActivity({
          type: 'task_approved',
          description: `Approved task completion for task ID ${taskId}`,
          userId: currentUser!.id,
          timestamp: new Date().toISOString()
        });
      }

      // Refresh the pending approvals list
      const tasks = await tasksService.getTasksAwaitingApproval(
        currentUser!.id, 
        currentUserRole as 'director' | 'master' | 'chairman'
      );
      setPendingApprovalTasks(tasks);
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const handleReject = async (taskId: string) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    try {
      if (currentUserRole === 'director') {
        await tasksService.approveByDirector(taskId, false, rejectionReason);
      } else if (currentUserRole === 'master') {
        await tasksService.approveByAdmin(taskId, false, rejectionReason);
      } else if (currentUserRole === 'chairman') {
        await tasksService.approveByChairman(taskId, false, rejectionReason);
      }
      
      // Add activity log
      if (createActivity) {
        await createActivity({
          type: 'task_rejected',
          description: `Rejected task completion for task ID ${taskId}: ${rejectionReason}`,
          userId: currentUser!.id,
          timestamp: new Date().toISOString()
        });
      }

      // Refresh the pending approvals list
      const tasks = await tasksService.getTasksAwaitingApproval(
        currentUser!.id, 
        currentUserRole as 'director' | 'master' | 'chairman'
      );
      setPendingApprovalTasks(tasks);
    } catch (error) {
      console.error('Error rejecting task:', error);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  if (pendingApprovalTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentUserRole === 'master' ? 'Admin Approvals' : 'Director Approvals'}
          </h2>
        </div>
        <div className="text-center py-8">
          <ClipboardCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No tasks pending {currentUserRole === 'master' ? 'admin' : 'director'} approval at the moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentUserRole === 'master' ? 'Admin Approvals' : 'Director Approvals'} ({pendingApprovalTasks.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingApprovalTasks.map(task => (
            <ApprovalTaskCard
              key={task.id}
              task={task}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleViewTask}
            />
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          mode="view"
        />
      )}
    </>
  );
}