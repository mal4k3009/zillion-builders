// WhatsApp Notification Service
import { whatsappService } from './whatsappService';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  async initialize() {
    console.log('WhatsApp Notification Service initialized');
    console.log('Notifications will be sent via WhatsApp to all configured contacts');
  }

  getFCMToken(): string | null {
    return null;
  }

  async sendTaskAssignedNotification(assignedUser: any, taskTitle: string, assignedBy: string, _taskId?: string) {
    const assignedUserName = assignedUser?.name || assignedUser?.email || 'User';
    
    // Send personalized message to assigned user if they have WhatsApp
    if (assignedUser?.whatsappNumber) {
      const personalMessage = `📋 *New Task Assigned*\n\n` +
                              `Hello ${assignedUserName},\n\n` +
                              `*Task:* ${taskTitle}\n` +
                              `*Assigned By:* ${assignedBy}\n` +
                              `*Date:* ${new Date().toLocaleDateString()}\n\n` +
                              `Please check the task management system for details.\n\n` +
                              `Thank you.`;
      
      await whatsappService.sendMessage(assignedUser.whatsappNumber, personalMessage);
    }
    
    // Send notification to all 5 team members
    const teamMessage = `📋 *Task Assignment Update*\n\n` +
                       `*Task:* ${taskTitle}\n` +
                       `*Assigned To:* ${assignedUserName}\n` +
                       `*By:* ${assignedBy}\n` +
                       `*Date:* ${new Date().toLocaleDateString()}`;
    
    await whatsappService.sendNotificationToAll(teamMessage);
  }

  async sendTaskCompletedNotification(completedBy: string, taskTitle: string) {
    await whatsappService.sendTaskCompletedNotification(taskTitle, completedBy);
  }

  async sendTaskOverdueNotification(taskTitle: string, assignedUser: any, dueDate?: string) {
    const assignedUserName = assignedUser?.name || assignedUser?.email || 'User';
    const dueDateStr = dueDate || new Date().toLocaleDateString();
    await whatsappService.sendTaskOverdueNotification(taskTitle, assignedUserName, dueDateStr);
  }

  async sendChatMessageNotification(senderName: string, message: string) {
    await whatsappService.sendChatMessageNotification(senderName, message);
  }

  async sendTaskUpdatedNotification(taskTitle: string, updatedBy: string, changes: string) {
    await whatsappService.sendTaskUpdatedNotification(taskTitle, updatedBy, changes);
  }

  async sendApprovalRequestNotification(taskTitle: string, requestedBy: string) {
    await whatsappService.sendApprovalRequestNotification(taskTitle, requestedBy);
  }

  async sendApprovalDecisionNotification(taskTitle: string, decision: string, decidedBy: string) {
    await whatsappService.sendApprovalDecisionNotification(taskTitle, decision, decidedBy);
  }

  async sendProjectUpdateNotification(projectName: string, updateType: string, updatedBy: string) {
    await whatsappService.sendProjectUpdateNotification(projectName, updateType, updatedBy);
  }

  async sendCustomNotification(title: string, body: string) {
    await whatsappService.sendCustomNotification(title, body);
  }

  async requestPermission(): Promise<boolean> {
    return true;
  }

  isSupported(): boolean {
    return true;
  }

  hasNotificationPermission(): boolean {
    return true;
  }
}

const notificationService = new NotificationService();
export { notificationService };