const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountkey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://zillion-builders-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function createChairmanUser() {
  console.log('👑 Creating Chairman User for Testing...\n');
  
  const chairmanData = {
    name: 'Chairman Williams',
    email: 'chairman@zillionbuilders.com',
    role: 'chairman',
    designation: 'Chairman',
    department: 'Executive',
    phone: '+1234567890',
    address: 'Executive Office, Zillion Builders HQ',
    status: 'active',
    profilePicture: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Create Firebase Auth user
    console.log('🔐 Creating Firebase Auth account...');
    const authUser = await auth.createUser({
      email: chairmanData.email,
      password: 'Chairman@123',
      displayName: chairmanData.name,
      emailVerified: true
    });

    console.log(`✅ Firebase Auth user created with UID: ${authUser.uid}`);

    // Create Firestore user document
    console.log('📄 Creating Firestore user document...');
    await db.collection('users').doc(authUser.uid).set({
      ...chairmanData,
      uid: authUser.uid
    });

    console.log('✅ Firestore user document created');

    console.log('\n🎉 Chairman user created successfully!');
    console.log('📧 Email:', chairmanData.email);
    console.log('🔑 Password: Chairman@123');
    console.log('👤 Role:', chairmanData.role);
    console.log('🆔 UID:', authUser.uid);

  } catch (error) {
    console.error('❌ Error creating chairman user:', error);
  }
}

// Run the script
createChairmanUser().then(() => {
  console.log('\n✅ Chairman user creation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});