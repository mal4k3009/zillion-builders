const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateOldMessages() {
  console.log('🔧 Looking for messages without participants array...');
  
  // Get all messages
  const snapshot = await db.collection('chatMessages').get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    // Check if participants array is missing or empty
    if (!data.participants || !Array.isArray(data.participants) || data.participants.length === 0) {
      const participants = [
        `${data.senderId}_${data.receiverId}`,
        `${data.receiverId}_${data.senderId}`
      ];
      
      console.log(`📝 Updating message from ${data.senderId} to ${data.receiverId}`);
      batch.update(doc.ref, { participants });
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`✅ Updated ${count} messages with participants array`);
  } else {
    console.log('✅ All messages already have participants array');
  }
  
  admin.app().delete();
}

updateOldMessages();