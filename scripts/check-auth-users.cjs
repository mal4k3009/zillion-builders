const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

async function listAuthUsers() {
  try {
    console.log('🔍 Checking Firebase Auth users...');
    
    const listUsersResult = await admin.auth().listUsers(1000);
    
    console.log(`📊 Total users in Firebase Auth: ${listUsersResult.users.length}`);
    
    listUsersResult.users.forEach((userRecord) => {
      console.log('👤 User:', {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims
      });
    });
    
    // Also check Firestore users collection
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`\n📊 Total users in Firestore: ${usersSnapshot.docs.length}`);
    
    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      console.log('👤 Firestore User:', {
        id: doc.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        role: userData.role,
        status: userData.status
      });
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    process.exit(0);
  }
}

listAuthUsers();