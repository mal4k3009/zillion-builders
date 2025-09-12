const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRecentMessages() {
  console.log('🔍 Checking recent messages...');
  const snapshot = await db.collection('chatMessages').orderBy('timestamp', 'desc').limit(5).get();
  
  console.log('Recent messages:');
  snapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    console.log(`${index + 1}. ID: ${doc.id}`);
    console.log('   From:', data.senderId, 'To:', data.receiverId);
    console.log('   Content:', data.content);
    console.log('   Participants:', data.participants);
    console.log('   Has participants array:', Array.isArray(data.participants));
    console.log('');
  });
  
  admin.app().delete();
}

checkRecentMessages();