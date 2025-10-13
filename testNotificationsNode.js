// Node.js FCM Test Script
// Run with: node testNotificationsNode.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const messaging = admin.messaging();

class NodeFCMTester {
  async sendTestNotification(token, title, body, data = {}) {
    const message = {
      notification: {
        title,
        body,
        icon: '/favicon.ico'
      },
      data: {
        type: 'test',
        ...data
      },
      token
    };

    try {
      const response = await messaging.send(message);
      console.log('✅ Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  async sendToTopic(topic, title, body) {
    const message = {
      notification: {
        title,
        body,
        icon: '/favicon.ico'
      },
      topic
    };

    try {
      const response = await messaging.send(message);
      console.log('✅ Successfully sent to topic:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending to topic:', error);
      throw error;
    }
  }

  async testWithSampleToken() {
    // You'll need to get a real FCM token from your browser first
    const sampleToken = 'PASTE_REAL_FCM_TOKEN_HERE';
    
    if (sampleToken === 'PASTE_REAL_FCM_TOKEN_HERE') {
      console.log('❌ Please paste a real FCM token');
      console.log('📝 To get token, run this in browser console:');
      console.log('   notificationTest.testFCMTokenRegistration()');
      return;
    }

    await this.sendTestNotification(
      sampleToken,
      '🧪 Node.js Test Notification',
      'This notification was sent from Node.js terminal!'
    );
  }
}

// Usage
const tester = new NodeFCMTester();

console.log('🔥 Node.js FCM Tester Ready!');
console.log('');
console.log('Usage:');
console.log('1. Get FCM token from browser console first');
console.log('2. Update sampleToken in this file');
console.log('3. Run: node testNotificationsNode.js');
console.log('');

// Uncomment to test
// tester.testWithSampleToken();