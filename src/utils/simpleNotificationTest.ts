// Simple Notification Test - No Memory Leaks
import { usersService, chatService, tasksService } from '../firebase/services';
import { fcmService } from '../services/fcmService';

class SimpleNotificationTest {
  async quickChatTest() {
    console.log('🧪 Quick Chat Notification Test');
    
    try {
      // Get users
      const users = await usersService.getAll();
      if (users.length < 2) {
        console.error('❌ Need at least 2 users');
        return;
      }

      const sender = users[0];
      const receiver = users[1];

      console.log(`📤 Sending test message from ${sender.name} to ${receiver.name}`);

      // Send message
      const messageData = {
        senderId: sender.id,
        receiverId: receiver.id,
        content: `🧪 Test message at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        isRead: false
      };

      await chatService.send(messageData);
      console.log('✅ Message sent successfully');

      // Check if we can see the message
      setTimeout(async () => {
        const messages = await chatService.getAll();
        const testMessage = messages.find(m => m.content.includes('🧪 Test message'));
        if (testMessage) {
          console.log('✅ Test message found in database');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  async quickTaskTest() {
    console.log('🧪 Quick Task Test');
    
    try {
      const users = await usersService.getAll();
      const employees = users.filter(u => u.role === 'employee');
      
      if (employees.length === 0) {
        console.error('❌ No employees found');
        return;
      }

      const assignee = employees[0];
      const creator = users.find(u => u.role === 'master') || users[0];

      console.log(`📋 Creating test task for ${assignee.name}`);

      const taskData = {
        title: `🧪 Test Task ${Date.now()}`,
        description: 'This is a simple test task',
        category: 'Test',
        assignedTo: assignee.id,
        priority: 'medium' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: creator.id,
        comments: [],
        attachments: [],
        approvalChain: [],
        currentApprovalLevel: 'none' as const
      };

      const taskId = await tasksService.create(taskData);
      console.log(`✅ Task created: ${taskId}`);

    } catch (error) {
      console.error('❌ Task test failed:', error);
    }
  }

  async testFCMTokens() {
    console.log('🧪 Testing FCM Token Registration');
    
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('📱 Notification permission:', permission);
        
        if (permission === 'granted') {
          // Try to register FCM token for current user (assume user ID 1)
          const token = await fcmService.initializeForUser(1);
          if (token) {
            console.log('✅ FCM Token registered:', token.substring(0, 30) + '...');
          } else {
            console.log('⚠️ No FCM token received');
          }
        }
      }
    } catch (error) {
      console.error('❌ FCM test failed:', error);
    }
  }

  async showTestToast() {
    console.log('🧪 Testing Browser Notification');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🧪 Test Notification', {
        body: 'This is a test notification from the browser!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      console.log('✅ Test notification shown');
    } else {
      console.log('❌ Notifications not supported or not permitted');
    }
  }

  async runAllTests() {
    console.log('🚀 Running Simple Notification Tests');
    console.log('=====================================');
    
    await this.testFCMTokens();
    await new Promise(r => setTimeout(r, 2000));
    
    await this.quickChatTest();
    await new Promise(r => setTimeout(r, 2000));
    
    await this.quickTaskTest();
    await new Promise(r => setTimeout(r, 2000));
    
    await this.showTestToast();
    
    console.log('🎉 All tests completed!');
  }
}

// Create global instance
const simpleTest = new SimpleNotificationTest();

// Make available globally
declare global {
  interface Window {
    simpleTest: SimpleNotificationTest;
  }
}

if (typeof window !== 'undefined') {
  window.simpleTest = simpleTest;
}

export { simpleTest };

console.log(`
🧪 SIMPLE NOTIFICATION TEST LOADED!

Quick Commands:
===============
simpleTest.runAllTests()        // Run all tests
simpleTest.quickChatTest()      // Test chat only
simpleTest.quickTaskTest()      // Test tasks only  
simpleTest.testFCMTokens()      // Test FCM only
simpleTest.showTestToast()      // Test browser notification

✨ Start with: simpleTest.runAllTests()
`);