const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK (if not already initialized)
try {
  admin.app();
} catch (e) {
  const serviceAccount = require('../serviceAccountkey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'zillion-builders-group'
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function addMalakUser() {
  const malakUser = {
    email: 'malak@zilliongroup.com',
    password: 'malak123',
    displayName: 'Malak - The Best Developer'
  };

  const malakFirestoreData = {
    id: 18, // Next available ID
    name: 'Malak - The Best Developer',
    email: 'malak@zilliongroup.com',
    username: 'malak_dev',
    role: 'employee',
    designation: 'Full Stack Developer',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: null,
    fcmToken: null
  };

  try {
    console.log('🚀 Creating Malak user...');

    // 1. Create Firebase Auth user
    try {
      const firebaseUser = await auth.createUser({
        email: malakUser.email,
        password: malakUser.password,
        displayName: malakUser.displayName
      });
      console.log('✅ Firebase Auth user created:', firebaseUser.uid);
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        console.log('⚠️ Firebase Auth user already exists, updating...');
        const existingUser = await auth.getUserByEmail(malakUser.email);
        await auth.updateUser(existingUser.uid, {
          displayName: malakUser.displayName
        });
        console.log('✅ Firebase Auth user updated');
      } else {
        throw authError;
      }
    }

    // 2. Add to Firestore users collection
    try {
      await db.collection('users').doc(malakFirestoreData.id.toString()).set(malakFirestoreData);
      console.log('✅ Firestore user document created with ID:', malakFirestoreData.id);
    } catch (firestoreError) {
      console.log('⚠️ Firestore user might already exist, updating...');
      await db.collection('users').doc(malakFirestoreData.id.toString()).update(malakFirestoreData);
      console.log('✅ Firestore user document updated');
    }

    console.log('\n🎉 Malak user setup complete!');
    console.log('📧 Email:', malakUser.email);
    console.log('🔑 Password:', malakUser.password);
    console.log('👤 Role:', malakFirestoreData.role);
    console.log('💼 Designation:', malakFirestoreData.designation);

  } catch (error) {
    console.error('❌ Error creating Malak user:', error);
  }
}

// Run the script
addMalakUser().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});