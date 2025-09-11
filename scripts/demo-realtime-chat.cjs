const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function demonstrateRealTimeChat() {
  console.log('🚀 Real-Time Chat Demonstration');
  console.log('================================');
  
  try {
    // Listen to chat messages in real-time
    console.log('👂 Setting up real-time listener...');
    
    const unsubscribe = db.collection('chatMessages')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .onSnapshot((snapshot) => {
        console.log('\n📨 Real-time update received!');
        console.log(`📊 Total messages in snapshot: ${snapshot.docs.length}`);
        
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          if (change.type === 'added') {
            console.log('➕ New message added:');
            console.log(`   From User ${data.senderId} to User ${data.receiverId}`);
            console.log(`   Content: "${data.content}"`);
            console.log(`   Time: ${data.timestamp?.toDate?.()?.toLocaleString() || data.timestamp}`);
          } else if (change.type === 'modified') {
            console.log('✏️  Message modified:');
            console.log(`   Message: "${data.content}"`);
            console.log(`   Read status: ${data.isRead ? 'Read' : 'Unread'}`);
          }
        });
      });

    console.log('✅ Real-time listener active!');
    console.log('\n🔥 Simulating live message activity...');
    
    // Simulate sending a live message
    setTimeout(async () => {
      console.log('\n📤 Sending live demo message...');
      
      const participants = ['1_2', '2_1'];
      const demoMessage = {
        senderId: 1,
        receiverId: 2,
        content: `🔴 LIVE DEMO: Real-time message sent at ${new Date().toLocaleTimeString()}`,
        type: 'text',
        participants: participants,
        timestamp: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now(),
        isRead: false
      };

      await db.collection('chatMessages').add(demoMessage);
      console.log('✅ Live message sent! Check the real-time update above.');
      
    }, 2000);

    // Simulate marking a message as read
    setTimeout(async () => {
      console.log('\n👁️  Simulating message read status update...');
      
      // Get the latest unread message and mark it as read
      const unreadQuery = await db.collection('chatMessages')
        .where('isRead', '==', false)
        .limit(1)
        .get();

      if (!unreadQuery.empty) {
        const doc = unreadQuery.docs[0];
        await doc.ref.update({ isRead: true });
        console.log('✅ Message marked as read! Check the real-time update above.');
      }
      
    }, 4000);

    // Clean up after demonstration
    setTimeout(() => {
      console.log('\n🔚 Demonstration completed!');
      console.log('📱 In a real application:');
      console.log('   - Multiple users would see these updates instantly');
      console.log('   - UI would update automatically without page refresh');
      console.log('   - Unread badges would update in real-time');
      console.log('   - New messages would appear immediately');
      
      unsubscribe();
      admin.app().delete();
      
    }, 6000);

  } catch (error) {
    console.error('❌ Error in demonstration:', error);
    await admin.app().delete();
  }
}

// Additional function to show conversation statistics
async function showConversationStats() {
  console.log('\n📊 Conversation Statistics');
  console.log('==========================');
  
  try {
    const messagesSnapshot = await db.collection('chatMessages').get();
    const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📈 Total messages: ${messages.length}`);
    
    // Count conversations by participants
    const conversations = {};
    messages.forEach(msg => {
      const key = `${Math.min(msg.senderId, msg.receiverId)}-${Math.max(msg.senderId, msg.receiverId)}`;
      conversations[key] = (conversations[key] || 0) + 1;
    });
    
    console.log(`💬 Active conversations: ${Object.keys(conversations).length}`);
    
    // Show most active conversations
    console.log('\n🔥 Most active conversations:');
    Object.entries(conversations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([conversation, count]) => {
        const [user1, user2] = conversation.split('-');
        console.log(`   User ${user1} ↔ User ${user2}: ${count} messages`);
      });
    
    // Count unread messages
    const unreadCount = messages.filter(msg => !msg.isRead).length;
    console.log(`\n📬 Unread messages: ${unreadCount}`);
    
    // Show message types
    const typeCount = {};
    messages.forEach(msg => {
      typeCount[msg.type] = (typeCount[msg.type] || 0) + 1;
    });
    
    console.log('\n📝 Message types:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} messages`);
    });
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
  }
}

// Main execution
async function runDemo() {
  await showConversationStats();
  await demonstrateRealTimeChat();
}

runDemo();