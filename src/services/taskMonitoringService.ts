import { tasksService } from '../firebase/services';
import { notificationService } from './notificationService';
import { Task, User } from '../types';

class TaskMonitoringService {
  private checkInterval: NodeJS.Timeout | null = null;
  private users: User[] = [];

  initialize(users: User[]) {
    this.users = users;
    
    // Check for overdue tasks every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkOverdueTasks();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkOverdueTasks();
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkOverdueTasks() {
    try {
      const tasks = await tasksService.getAll();
      const now = new Date();

      for (const task of tasks) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < now && task.status !== 'completed';

        if (isOverdue) {
          const assignedUser = this.users.find(u => u.id === task.assignedTo);
          
          if (assignedUser) {
            // Check if we've already sent an overdue notification for this task today
            const lastNotificationKey = `overdue_${task.id}_${now.toDateString()}`;
            const alreadySent = localStorage.getItem(lastNotificationKey);

            if (!alreadySent) {
              await notificationService.sendTaskOverdueNotification(task.title, assignedUser);
              localStorage.setItem(lastNotificationKey, 'true');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  }

  // Method to manually check for overdue tasks
  async checkNow() {
    await this.checkOverdueTasks();
  }

  // Method to send daily summary notifications
  async sendDailySummary(userId: number) {
    try {
      const userTasks = await tasksService.getByAssignee(userId);
      const user = this.users.find(u => u.id === userId);
      
      if (!user) return;

      const pendingTasks = userTasks.filter(t => t.status === 'pending');
      const inProgressTasks = userTasks.filter(t => t.status === 'in-progress');
      const overdueTasks = userTasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed'
      );

      if (pendingTasks.length > 0 || inProgressTasks.length > 0 || overdueTasks.length > 0) {
        let summary = `Good morning, ${user.name}!\n\nYour tasks for today:\n`;
        
        if (overdueTasks.length > 0) {
          summary += `⚠️ Overdue: ${overdueTasks.length}\n`;
        }
        if (pendingTasks.length > 0) {
          summary += `📋 Pending: ${pendingTasks.length}\n`;
        }
        if (inProgressTasks.length > 0) {
          summary += `⏳ In Progress: ${inProgressTasks.length}\n`;
        }

        summary += '\nHave a productive day!';

        // Send browser notification for daily summary
        if (notificationService.getPermissionStatus() === 'granted') {
          // We'll add a method to send custom notifications
          console.log('Daily Summary:', summary);
        }
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  // Schedule daily summary notifications (call this when user logs in)
  scheduleDailySummary(userId: number) {
    // Send daily summary at 9 AM
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(9, 0, 0, 0);

    // If it's already past 9 AM today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilScheduled = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendDailySummary(userId);
      
      // Schedule daily recurring summary
      setInterval(() => {
        this.sendDailySummary(userId);
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeUntilScheduled);
  }
}

export const taskMonitoringService = new TaskMonitoringService();
