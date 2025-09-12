const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testRealTimeUpdates() {
  console.log('🚀 Testing real-time updates...');
  
  // Set up a listener for conversation between User 1 and User 2
  console.log('👂 Setting up listener for User 1 ↔ User 2...');
  
  const q = db.collection('chatMessages')
    .where('participants', 'array-contains-any', ['1_2', '2_1'])
    .orderBy('timestamp', 'asc');
  
  const unsubscribe = q.onSnapshot((snapshot) => {
    console.log('📨 Real-time update received!');
    console.log(`📊 Messages in conversation: ${snapshot.docs.length}`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.content} (${data.senderId} → ${data.receiverId})`);
    });
    console.log('');
  });
  
  // Wait a moment, then send a test message
  setTimeout(async () => {
    console.log('📤 Sending test message...');
    
    await db.collection('chatMessages').add({
      senderId: 1,
      receiverId: 2,
      content: `Test real-time message at ${new Date().toLocaleTimeString()}`,
      type: 'text',
      participants: ['1_2', '2_1'],
      timestamp: admin.firestore.Timestamp.now(),
      isRead: false
    });
    
    console.log('✅ Test message sent!');
    
    // Clean up after 5 seconds
    setTimeout(() => {
      unsubscribe();
      admin.app().delete();
      console.log('🔚 Test completed');
    }, 3000);
    
  }, 2000);
}

testRealTimeUpdates();