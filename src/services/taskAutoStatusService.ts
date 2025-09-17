import { Task } from '../types';
import { tasksService } from '../firebase/services';

export class TaskAutoStatusService {
  private static instance: TaskAutoStatusService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour
  private readonly DAYS_BEFORE_DUE = 10; // Reactivate 10 days before due date

  private constructor() {}

  public static getInstance(): TaskAutoStatusService {
    if (!TaskAutoStatusService.instance) {
      TaskAutoStatusService.instance = new TaskAutoStatusService();
    }
    return TaskAutoStatusService.instance;
  }

  /**
   * Start the automatic status checking service
   */
  public start(): void {
    if (this.intervalId) {
      console.log('Task auto-status service already running');
      return;
    }

    console.log('Starting task auto-status service...');
    
    // Run immediately on start
    this.checkPausedTasks();
    
    // Then run every hour
    this.intervalId = setInterval(() => {
      this.checkPausedTasks();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop the automatic status checking service
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Task auto-status service stopped');
    }
  }

  /**
   * Check all paused tasks and reactivate those that are within 10 days of due date
   */
  private async checkPausedTasks(): Promise<void> {
    try {
      console.log('🔄 Checking paused tasks for auto-reactivation...');
      
      // Get paused tasks that are ready for reactivation (optimized Firebase query)
      const tasksToReactivate = await tasksService.getPausedTasksForReactivation();
      
      if (tasksToReactivate.length === 0) {
        console.log('⏸️ No paused tasks need reactivation at this time');
        return;
      }

      console.log(`🔄 Reactivating ${tasksToReactivate.length} task(s)...`);

      // Reactivate tasks
      for (const task of tasksToReactivate) {
        try {
          await tasksService.update(task.id, {
            status: 'pending',
            updatedAt: new Date().toISOString(),
            pausedAt: undefined,
            pausedBy: undefined
          });

          console.log(`✅ Reactivated task: "${task.title}" (due: ${task.dueDate})`);

          // Optionally create a notification about the reactivation
          // This would require importing the notification service
          // await notificationsService.create({
          //   userId: task.assignedTo,
          //   title: 'Task Reactivated',
          //   message: `Task "${task.title}" has been automatically reactivated as it's approaching its due date.`,
          //   type: 'task_updated',
          //   isRead: false,
          //   createdAt: new Date().toISOString(),
          //   taskId: task.id
          // });
          
        } catch (error) {
          console.error(`❌ Failed to reactivate task "${task.title}":`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in task auto-status service:', error);
    }
  }

  /**
   * Check a specific task and reactivate if needed (useful for manual checks)
   */
  public async checkSpecificTask(taskId: string): Promise<boolean> {
    try {
      const task = await tasksService.getById(taskId);
      
      if (!task || task.status !== 'paused') {
        return false;
      }

      const currentDate = new Date();
      const dueDate = new Date(task.dueDate);
      const daysDifference = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDifference <= this.DAYS_BEFORE_DUE) {
        await tasksService.update(task.id, {
          status: 'pending',
          updatedAt: new Date().toISOString(),
          pausedAt: undefined,
          pausedBy: undefined
        });

        console.log(`✅ Manually reactivated task: "${task.title}"`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking specific task:', error);
      return false;
    }
  }

  /**
   * Get information about when a paused task will be reactivated
   */
  public getReactivationInfo(task: Task): { willReactivate: boolean; daysUntilReactivation: number; reactivationDate: Date } | null {
    if (task.status !== 'paused') {
      return null;
    }

    const currentDate = new Date();
    const dueDate = new Date(task.dueDate);
    const daysToDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const willReactivate = daysToDue <= this.DAYS_BEFORE_DUE;
    const daysUntilReactivation = Math.max(0, daysToDue - this.DAYS_BEFORE_DUE);
    
    // Calculate reactivation date (10 days before due date)
    const reactivationDate = new Date(dueDate);
    reactivationDate.setDate(reactivationDate.getDate() - this.DAYS_BEFORE_DUE);

    return {
      willReactivate,
      daysUntilReactivation,
      reactivationDate
    };
  }
}

// Export singleton instance
export const taskAutoStatusService = TaskAutoStatusService.getInstance();