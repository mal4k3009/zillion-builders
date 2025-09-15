import { useState } from 'react';
import { ClipboardCheck, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApprovalTaskCard } from './ApprovalTaskCard';
import { TaskModal } from '../tasks/TaskModal';
import { Task } from '../../types';

export function ApprovalSection() {
  const { state, updateTask, createActivity } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Only show for master admin
  if (state.currentUser?.role !== 'master') {
    return null;
  }

  const pendingApprovalTasks = state.tasks.filter(t => t.approvalStatus === 'pending_approval');

  const handleApprove = async (taskId: number) => {
    try {
      await updateTask(taskId, { 
        approvalStatus: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      // Add activity log
      await createActivity({
        type: 'task_updated',
        description: `Approved task with ID ${taskId}`,
        userId: state.currentUser!.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const handleReject = async (taskId: number) => {
    try {
      await updateTask(taskId, { 
        approvalStatus: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      // Add activity log
      await createActivity({
        type: 'task_updated',
        description: `Rejected task with ID ${taskId}`,
        userId: state.currentUser!.id,
        timestamp: new Date().toISOString()
      });
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
            Task Approvals
          </h2>
        </div>
        <div className="text-center py-8">
          <ClipboardCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No tasks pending approval at the moment
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
            Task Approvals ({pendingApprovalTasks.length})
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