// WhatsApp Notification Service
// Using wpauto.jenilpatel.co.in API
import { WHATSAPP_CONFIG, ENABLED_CONTACTS } from '../config/whatsappConfig';

interface WhatsAppConfig {
  apiKey: string;
  sender: string;
  apiEndpoint: string;
}

interface WhatsAppContact {
  name: string;
  number: string;
  role?: string;
  enabled?: boolean;
}

class WhatsAppService {
  private static instance: WhatsAppService;
  private config: WhatsAppConfig = {
    apiKey: WHATSAPP_CONFIG.apiKey,
    sender: WHATSAPP_CONFIG.sender,
    apiEndpoint: WHATSAPP_CONFIG.apiEndpoint
  };

  // Notification recipients - loaded from config
  private contacts: WhatsAppContact[] = ENABLED_CONTACTS;

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Send WhatsApp message to all configured contacts
   */
  async sendNotificationToAll(message: string, footer: string = WHATSAPP_CONFIG.defaultFooter): Promise<void> {
    const promises = this.contacts.map(contact => 
      this.sendMessage(contact.number, message, footer)
    );
    
    try {
      await Promise.all(promises);
      console.log('✅ WhatsApp notifications sent to all contacts');
    } catch (error) {
      console.error('❌ Error sending WhatsApp notifications:', error);
    }
  }

  /**
   * Send WhatsApp message to a specific contact
   */
  async sendMessage(number: string, message: string, footer: string = WHATSAPP_CONFIG.defaultFooter): Promise<boolean> {
    try {
      // Use proxy path for development to avoid CORS issues
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isDevelopment ? '/api/whatsapp/send-message' : this.config.apiEndpoint;
      
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.append('api_key', this.config.apiKey);
      url.searchParams.append('sender', this.config.sender);
      url.searchParams.append('number', number);
      url.searchParams.append('message', message);
      url.searchParams.append('footer', footer);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status === true || data.status === 'true') {
        console.log(`✅ WhatsApp message sent to ${number}: ${data.msg || 'Success'}`);
        return true;
      } else {
        console.error(`❌ Failed to send WhatsApp to ${number}:`, data);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending WhatsApp to ${number}:`, error);
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
