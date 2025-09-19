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

async function createEmployeeUser() {
  console.log('👨‍💼 Creating Employee User for Testing...\n');
  
  const employeeData = {
    name: 'John Smith',
    email: 'john.smith@zillionbuilders.com',
    role: 'employee',
    designation: 'Project Coordinator',
    department: 'Operations',
    phone: '+1234567891',
    address: '123 Employee Street, City',
    status: 'active',
    profilePicture: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Create Firebase Auth user
    console.log('🔐 Creating Firebase Auth account...');
    const authUser = await auth.createUser({
      email: employeeData.email,
      password: 'Employee@123',
      displayName: employeeData.name,
      emailVerified: true
    });

    console.log(`✅ Firebase Auth user created with UID: ${authUser.uid}`);

    // Create Firestore user document
    console.log('📄 Creating Firestore user document...');
    await db.collection('users').doc(authUser.uid).set({
      ...employeeData,
      uid: authUser.uid
    });

    console.log('✅ Firestore user document created');

    console.log('\n🎉 Employee user created successfully!');
    console.log('📧 Email:', employeeData.email);
    console.log('🔑 Password: Employee@123');
    console.log('👤 Role:', employeeData.role);
    console.log('🆔 UID:', authUser.uid);

  } catch (error) {
    console.error('❌ Error creating employee user:', error);
  }
}

// Run the script
createEmployeeUser().then(() => {
  console.log('\n✅ Employee user creation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});