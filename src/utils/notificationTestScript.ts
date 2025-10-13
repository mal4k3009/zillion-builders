import { tasksService, chatService, usersService } from '../firebase/services';
import { sendMessageNotification, sendTaskNotification } from '../firebase/messaging';
import { fcmService } from '../services/fcmService';

interface TestUser {
  id: number;
  name: string;
  email: string;
  role: 'master' | 'admin' | 'employee';
}

class NotificationTestScript {
  private testUsers: TestUser[] = [];
  private currentUserId: number | null = null;

  async initialize() {
    console.log('🔥 Starting Notification Test Script...');
    
    // Get all users for testing
    try {
      const users = await usersService.getAll();
      this.testUsers = users.filter(user => user.id !== undefined) as TestUser[];
      console.log(`✅ Found ${this.testUsers.length} users for testing:`, this.testUsers.map(u => `${u.name} (ID: ${u.id})`));
      
      if (this.testUsers.length < 2) {
        console.error('❌ Need at least 2 users to test notifications');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      return false;
    }
  }

  setCurrentUser(userId: number) {
    const user = this.testUsers.find(u => u.id === userId);
    if (user) {
      this.currentUserId = userId;
      console.log(`👤 Set current user: ${user.name} (ID: ${userId})`);
      return true;
    }
    console.error(`❌ User with ID ${userId} not found`);
    return false;
  }

  async testFCMTokenRegistration() {
    console.log('\n📱 Testing FCM Token Registration...');
    
    for (const user of this.testUsers) {
      try {
        const token = await fcmService.initializeForUser(user.id);
        if (token) {
          console.log(`✅ FCM token registered for ${user.name}: ${token.substring(0, 20)}...`);
        } else {
          console.log(`⚠️ FCM token registration failed for ${user.name} (may be due to permissions or environment)`);
        }
      } catch (error) {
        console.log(`❌ FCM error for ${user.name}:`, error);
      }
    }
  }

  async testChatNotifications() {
    console.log('\n💬 Testing Chat Message Notifications...');
    
    if (!this.currentUserId) {
      console.error('❌ Please set current user first using setCurrentUser()');
      return;
    }

    const currentUser = this.testUsers.find(u => u.id === this.currentUserId);
    const otherUsers = this.testUsers.filter(u => u.id !== this.currentUserId);

    if (otherUsers.length === 0) {
      console.error('❌ No other users to send messages to');
      return;
    }

    for (const recipient of otherUsers.slice(0, 3)) { // Test with first 3 users
      const testMessage = `🧪 Test message from ${currentUser?.name} to ${recipient.name} - ${new Date().toLocaleTimeString()}`;
      
      try {
        // Send chat message
        console.log(`📤 Sending message from ${currentUser?.name} to ${recipient.name}...`);
        
        const messageData = {
          senderId: this.currentUserId,
          receiverId: recipient.id,
          content: testMessage,
          timestamp: new Date().toISOString(),
          type: 'text' as const,
          isRead: false
        };

        await chatService.send(messageData);
        console.log(`✅ Message sent successfully`);

        // Send FCM notification
        await sendMessageNotification(
          this.currentUserId,
          recipient.id,
          currentUser?.name || 'Test User',
          testMessage
        );
        console.log(`✅ FCM notification sent to ${recipient.name}`);

        // Wait a bit between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to send message to ${recipient.name}:`, error);
      }
    }
  }

  async testTaskAssignmentNotifications() {
    console.log('\n📋 Testing Task Assignment Notifications...');
    
    if (!this.currentUserId) {
      console.error('❌ Please set current user first using setCurrentUser()');
      return;
    }

    const employeeUsers = this.testUsers.filter(u => u.role === 'employee' && u.id !== this.currentUserId);

    if (employeeUsers.length === 0) {
      console.error('❌ No employee users found to assign tasks to');
      return;
    }

    for (const employee of employeeUsers.slice(0, 2)) { // Test with first 2 employees
      const testTask = {
        title: `🧪 Test Task for ${employee.name}`,
        description: `This is a test task assigned to ${employee.name} at ${new Date().toLocaleTimeString()}`,
        category: 'Development',
        assignedTo: employee.id,
        priority: 'medium' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.currentUserId,
        comments: [],
        attachments: [],
        approvalChain: [],
        currentApprovalLevel: 'none' as const
      };

      try {
        console.log(`📋 Creating task for ${employee.name}...`);
        
        const taskId = await tasksService.create(testTask);
        console.log(`✅ Task created with ID: ${taskId}`);

        // Send FCM notification
        await sendTaskNotification(
          employee.id,
          testTask.title,
          testTask.description || 'Task assigned to you',
          taskId,
          'assigned'
        );
        console.log(`✅ Task assignment notification sent to ${employee.name}`);

        // Wait a bit between task creations
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Failed to create task for ${employee.name}:`, error);
      }
    }
  }

  async testTaskStatusUpdateNotifications() {
    console.log('\n🔄 Testing Task Status Update Notifications...');
    
    try {
      // Get recent tasks to update
      const allTasks = await tasksService.getAll();
      const testTasks = allTasks.filter(task => 
        task.title.includes('🧪 Test Task') && 
        task.status === 'pending'
      ).slice(0, 2);

      if (testTasks.length === 0) {
        console.log('⚠️ No test tasks found to update. Run testTaskAssignmentNotifications() first.');
        return;
      }

      const statusUpdates = ['in_progress', 'completed'];
      
      for (let i = 0; i < testTasks.length; i++) {
        const task = testTasks[i];
        const newStatus = statusUpdates[i] as 'in_progress' | 'completed';
        
        console.log(`🔄 Updating task "${task.title}" to ${newStatus}...`);
        
        await tasksService.update(task.id, { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Task status updated`);

        // Send FCM notification
        if (task.assignedTo) {
          await sendTaskNotification(
            task.assignedTo,
            task.title,
            `Task status updated to ${newStatus.replace('_', ' ')}`,
            task.id,
            newStatus === 'completed' ? 'completed' : 'updated'
          );
          console.log(`✅ Status update notification sent`);
        }

        // Wait between updates
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to update task status:`, error);
    }
  }

  async testAllNotificationTypes() {
    console.log('\n🎯 Running Complete Notification Test Suite...');
    
    const initialized = await this.initialize();
    if (!initialized) return;

    // Set first user as current user for testing
    if (this.testUsers.length > 0) {
      this.setCurrentUser(this.testUsers[0].id);
    }

    console.log('\n⏱️ Starting tests in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test FCM registration
    await this.testFCMTokenRegistration();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test chat notifications
    await this.testChatNotifications();
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test task assignment notifications
    await this.testTaskAssignmentNotifications();
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test task status update notifications
    await this.testTaskStatusUpdateNotifications();

    console.log('\n🎉 All notification tests completed!');
    console.log('\n📱 Check your browser notifications and toast messages.');
    console.log('📋 Check the chat page and tasks page for new items.');
  }

  printUserList() {
    console.log('\n👥 Available Users:');
    this.testUsers.forEach(user => {
      console.log(`  - ${user.name} (ID: ${user.id}, Role: ${user.role})`);
    });
  }

  async sendQuickTestMessage(fromUserId: number, toUserId: number, message?: string) {
    const fromUser = this.testUsers.find(u => u.id === fromUserId);
    const toUser = this.testUsers.find(u => u.id === toUserId);
    
    if (!fromUser || !toUser) {
      console.error('❌ Invalid user IDs');
      return;
    }

    const testMessage = message || `Quick test from ${fromUser.name} to ${toUser.name} - ${new Date().toLocaleTimeString()}`;
    
    try {
      const messageData = {
        senderId: fromUserId,
        receiverId: toUserId,
        content: testMessage,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        isRead: false
      };

      await chatService.send(messageData);
      await sendMessageNotification(fromUserId, toUserId, fromUser.name, testMessage);
      
      console.log(`✅ Quick message sent from ${fromUser.name} to ${toUser.name}`);
    } catch (error) {
      console.error(`❌ Failed to send quick message:`, error);
    }
  }
}

// Create global instance for browser console access
declare global {
  interface Window {
    notificationTest: NotificationTestScript;
  }
}

// Export for use in console
const notificationTest = new NotificationTestScript();

// Make it available globally in browser console
if (typeof window !== 'undefined') {
  window.notificationTest = notificationTest;
}

export { notificationTest };

// Usage instructions that will be logged
console.log(`
🧪 NOTIFICATION TEST SCRIPT LOADED!

Usage in Browser Console:
=========================

1. Run full test suite:
   notificationTest.testAllNotificationTypes()

2. Test individual features:
   notificationTest.initialize()
   notificationTest.printUserList()
   notificationTest.setCurrentUser(1)  // Replace 1 with actual user ID
   notificationTest.testChatNotifications()
   notificationTest.testTaskAssignmentNotifications()

3. Send quick test message:
   notificationTest.sendQuickTestMessage(1, 2, "Hello!")  // from user 1 to user 2

4. Test FCM registration:
   notificationTest.testFCMTokenRegistration()

📱 Make sure to:
- Allow notifications when prompted
- Keep browser tab open for FCM testing
- Check both toast notifications and browser notifications
- Test on different browsers/devices for cross-platform testing

🔥 Start with: notificationTest.testAllNotificationTypes()
`);