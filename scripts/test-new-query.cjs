const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testNewQuery() {
  console.log('🚀 Testing new query approach...');
  
  // Test the simpler query that our updated code uses
  console.log('👂 Setting up listener for User 1 ↔ User 2...');
  
  const q = db.collection('chatMessages')
    .where('senderId', 'in', [1, 2])
    .where('receiverId', 'in', [1, 2]);
  
  const unsubscribe = q.onSnapshot((snapshot) => {
    console.log('📨 Real-time update received!');
    console.log(`📊 Total matching messages: ${snapshot.docs.length}`);
    
    // Filter for specific conversation
    const conversationMessages = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(msg => 
        (msg.senderId === 1 && msg.receiverId === 2) ||
        (msg.senderId === 2 && msg.receiverId === 1)
      );
    
    console.log(`💬 Conversation messages: ${conversationMessages.length}`);
    conversationMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.content} (${msg.senderId} → ${msg.receiverId})`);
    });
    console.log('');
  });
  
  // Wait a moment, then send a test message
  setTimeout(async () => {
    console.log('📤 Sending test message...');
    
    await db.collection('chatMessages').add({
      senderId: 2,
      receiverId: 1,
      content: `New real-time test at ${new Date().toLocaleTimeString()}`,
      type: 'text',
      participants: ['1_2', '2_1'],
      timestamp: admin.firestore.Timestamp.now(),
      isRead: false
    });
    
    console.log('✅ Test message sent!');
    
    // Clean up after 3 seconds
    setTimeout(() => {
      unsubscribe();
      admin.app().delete();
      console.log('🔚 Test completed');
    }, 3000);
    
  }, 2000);
}

testNewQuery();