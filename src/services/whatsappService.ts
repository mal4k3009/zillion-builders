// WhatsApp Notification Service
// Using n8n webhook
import { WHATSAPP_CONFIG, ENABLED_CONTACTS } from '../config/whatsappConfig';

interface WhatsAppContact {
  name: string;
  number: string;
  role?: string;
  enabled?: boolean;
}

class WhatsAppService {
  private static instance: WhatsAppService;
  private webhookUrl: string = WHATSAPP_CONFIG.webhookUrl;
  private defaultRecipient: string = WHATSAPP_CONFIG.defaultRecipient;

  // Notification recipients - loaded from config
  private contacts: WhatsAppContact[] = ENABLED_CONTACTS;

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Send WhatsApp message to all enabled contacts via webhook
   */
  async sendNotificationToAll(message: string): Promise<void> {
    try {
      const enabledContacts = this.contacts.filter(contact => contact.enabled !== false);
      console.log(`📤 Sending notification to ${enabledContacts.length} contacts...`);
      
      // Send to all enabled contacts
      const promises = enabledContacts.map(contact => 
        this.sendMessage(contact.number, message)
      );
      
      await Promise.all(promises);
      console.log('✅ WhatsApp notifications sent to all contacts via webhook');
    } catch (error) {
      console.error('❌ Error sending WhatsApp notifications:', error);
    }
  }

  /**
   * Send WhatsApp message to webhook (number parameter for compatibility)
   */
  async sendMessage(number: string, message: string): Promise<boolean> {
    try {
      console.log('📤 Sending to webhook:', { number, message });
      
      const payload = {
        receiver: number,
        message: message,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.text();
        console.log('✅ Webhook response:', data);
        return true;
      } else {
        console.error('❌ Webhook failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending to webhook:', error);
      return false;
    }
  }

  /**
   * Send task assigned notification via WhatsApp
   */
  async sendTaskAssignedNotification(taskTitle: string, assignedTo: string, assignedBy: string): Promise<void> {
    const message = `📋 *New Task Assigned*\n\n` +
                   `*Task:* ${taskTitle}\n` +
                   `*Assigned To:* ${assignedTo}\n` +
                   `*Assigned By:* ${assignedBy}\n\n` +
                   `Please check the task management system for details.`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send task completed notification via WhatsApp
   */
  async sendTaskCompletedNotification(taskTitle: string, completedBy: string): Promise<void> {
    const message = `✅ *Task Completed*\n\n` +
                   `*Task:* ${taskTitle}\n` +
                   `*Completed By:* ${completedBy}\n\n` +
                   `Great job!`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send task overdue notification via WhatsApp
   */
  async sendTaskOverdueNotification(taskTitle: string, assignedTo: string, dueDate: string): Promise<void> {
    const message = `⚠️ *Task Overdue*\n\n` +
                   `*Task:* ${taskTitle}\n` +
                   `*Assigned To:* ${assignedTo}\n` +
                   `*Due Date:* ${dueDate}\n\n` +
                   `Please take immediate action!`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send task updated notification via WhatsApp
   */
  async sendTaskUpdatedNotification(taskTitle: string, updatedBy: string, changes: string): Promise<void> {
    const message = `🔄 *Task Updated*\n\n` +
                   `*Task:* ${taskTitle}\n` +
                   `*Updated By:* ${updatedBy}\n` +
                   `*Changes:* ${changes}\n\n` +
                   `Check the system for latest updates.`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send chat message notification via WhatsApp
   */
  async sendChatMessageNotification(senderName: string, message: string): Promise<void> {
    const notificationMessage = `💬 *New Chat Message*\n\n` +
                               `*From:* ${senderName}\n` +
                               `*Message:* ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}\n\n` +
                               `Open the chat to view full message.`;
    
    await this.sendNotificationToAll(notificationMessage);
  }

  /**
   * Send approval request notification via WhatsApp
   */
  async sendApprovalRequestNotification(taskTitle: string, requestedBy: string): Promise<void> {
    const message = `🔔 *Approval Request*\n\n` +
                   `*Task:* ${taskTitle}\n` +
                   `*Requested By:* ${requestedBy}\n\n` +
                   `Please review and approve/reject this task.`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send approval decision notification via WhatsApp
   */
  async sendApprovalDecisionNotification(taskTitle: string, decision: string, decidedBy: string): Promise<void> {
    const icon = decision === 'approved' ? '✅' : '❌';
    const message = `${icon} *Task ${decision.toUpperCase()}*\n\n` +
                   `*Task:* ${taskTitle}\n` +
                   `*Decision By:* ${decidedBy}\n\n` +
                   `The task has been ${decision}.`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send project update notification via WhatsApp
   */
  async sendProjectUpdateNotification(projectName: string, updateType: string, updatedBy: string): Promise<void> {
    const message = `📊 *Project Update*\n\n` +
                   `*Project:* ${projectName}\n` +
                   `*Update:* ${updateType}\n` +
                   `*Updated By:* ${updatedBy}`;
    
    await this.sendNotificationToAll(message);
  }

  /**
   * Send custom notification via WhatsApp
   */
  async sendCustomNotification(title: string, body: string): Promise<void> {
    const message = `${title}\n\n${body}`;
    await this.sendNotificationToAll(message);
  }

  /**
   * Get all configured contacts
   */
  getContacts(): WhatsAppContact[] {
    return [...this.contacts];
  }

  /**
   * Add a new contact to receive notifications
   */
  addContact(name: string, number: string): void {
    // Remove any special characters from phone number except +
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    this.contacts.push({ name, number: cleanNumber });
    console.log(`✅ Added contact: ${name} (${cleanNumber})`);
  }

  /**
   * Remove a contact from receiving notifications
   */
  removeContact(number: string): void {
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    const index = this.contacts.findIndex(c => c.number === cleanNumber);
    if (index !== -1) {
      const contact = this.contacts[index];
      this.contacts.splice(index, 1);
      console.log(`✅ Removed contact: ${contact.name} (${cleanNumber})`);
    }
  }
}

export const whatsappService = WhatsAppService.getInstance();
export default whatsappService;
