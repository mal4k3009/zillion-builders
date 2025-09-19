const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

const db = admin.firestore();
const auth = admin.auth();

// Indian names for users (same as before but with Firebase Auth integration)
const indianNames = {
  chairman: [
    { name: 'Rajesh Kumar Sharma', email: 'rajesh.chairman@zilliongroup.com', username: 'rajesh_chairman' }
  ],
  directors: [
    { name: 'Priya Patel', email: 'priya.director@zilliongroup.com', username: 'priya_director' },
    { name: 'Ankit Gupta', email: 'ankit.director@zilliongroup.com', username: 'ankit_director' }
  ],
  staff: [
    { name: 'Suresh Reddy', email: 'suresh.staff@zilliongroup.com', username: 'suresh_staff' },
    { name: 'Meera Singh', email: 'meera.staff@zilliongroup.com', username: 'meera_staff' },
    { name: 'Vikram Joshi', email: 'vikram.staff@zilliongroup.com', username: 'vikram_staff' },
    { name: 'Sneha Agarwal', email: 'sneha.staff@zilliongroup.com', username: 'sneha_staff' },
    { name: 'Arjun Nair', email: 'arjun.staff@zilliongroup.com', username: 'arjun_staff' },
    { name: 'Kavya Iyer', email: 'kavya.staff@zilliongroup.com', username: 'kavya_staff' },
    { name: 'Rohit Verma', email: 'rohit.staff@zilliongroup.com', username: 'rohit_staff' },
    { name: 'Deepika Rao', email: 'deepika.staff@zilliongroup.com', username: 'deepika_staff' },
    { name: 'Karthik Menon', email: 'karthik.staff@zilliongroup.com', username: 'karthik_staff' },
    { name: 'Pooja Mishra', email: 'pooja.staff@zilliongroup.com', username: 'pooja_staff' },
    { name: 'Sanjay Kapoor', email: 'sanjay.staff@zilliongroup.com', username: 'sanjay_staff' },
    { name: 'Ritu Bansal', email: 'ritu.staff@zilliongroup.com', username: 'ritu_staff' }
  ]
};

// Create users array
const users = [];
let userId = 1;

// Add master admin (existing)
users.push({
  id: userId++,
  username: 'masteradmin',
  password: 'admin123',
  role: 'master',
  designation: 'master',
  name: 'Master Administrator',
  email: 'admin@zilliongroup.com',
  authEmail: 'masteradmin@zillion-builders-internal.com', // Email for Firebase Auth
  status: 'active',
  createdAt: new Date().toISOString()
});

// Add Chairman (1 user) - Master role for full access
const chairman = indianNames.chairman[0];
users.push({
  id: userId++,
  username: chairman.username,
  password: 'chairman123',
  role: 'master', // Chairman gets master role
  designation: 'chairman',
  name: chairman.name,
  email: chairman.email,
  authEmail: `${chairman.username}@zillion-builders-internal.com`, // Email for Firebase Auth
  status: 'active',
  createdAt: new Date().toISOString()
});

// Add Directors (2 users) - Master role for full access
indianNames.directors.forEach(director => {
  users.push({
    id: userId++,
    username: director.username,
    password: 'director123',
    role: 'master', // Directors get master role
    designation: 'director',
    name: director.name,
    email: director.email,
    authEmail: `${director.username}@zillion-builders-internal.com`, // Email for Firebase Auth
    status: 'active',
    createdAt: new Date().toISOString()
  });
});

// Add Staff (12 users) - Sub role
indianNames.staff.forEach(staff => {
  users.push({
    id: userId++,
    username: staff.username,
    password: 'staff123',
    role: 'sub',
    designation: 'staff',
    name: staff.name,
    email: staff.email,
    authEmail: `${staff.username}@zillion-builders-internal.com`, // Email for Firebase Auth
    status: 'active',
    createdAt: new Date().toISOString()
  });
});

// Function to upload users to both Firebase Auth and Firestore
async function createUsersWithFirebaseAuth() {
  try {
    console.log('🚀 Creating users with Firebase Authentication...');
    console.log(`📊 Total users to create: ${users.length}`);
    
    // Step 1: Clear existing Firebase Auth users
    console.log('🗑️ Clearing existing Firebase Auth users...');
    try {
      const existingUsers = await auth.listUsers();
      for (const user of existingUsers.users) {
        await auth.deleteUser(user.uid);
      }
      console.log(`✅ Cleared ${existingUsers.users.length} existing auth users`);
    } catch (error) {
      console.log('ℹ️  No existing auth users to clear');
    }
    
    // Step 2: Clear existing Firestore users
    console.log('🗑️ Clearing existing Firestore users...');
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('✅ Existing Firestore users cleared');

    // Step 3: Create users in both Firebase Auth and Firestore
    console.log('📤 Creating users in Firebase Auth and Firestore...');
    const results = [];
    
    for (const user of users) {
      try {
        // Create user in Firebase Auth
        const authUser = await auth.createUser({
          uid: `user_${user.id}`,
          email: user.authEmail,
          password: user.password,
          displayName: user.name,
          disabled: user.status !== 'active'
        });
        
        // Create user document in Firestore (without password)
        const firestoreUserData = {
          ...user,
          firebaseUid: authUser.uid,
          // Remove password from Firestore (handled by Firebase Auth)
          password: undefined
        };
        delete firestoreUserData.password;
        delete firestoreUserData.authEmail; // Remove internal auth email
        
        const docRef = db.collection('users').doc(user.id.toString());
        await docRef.set(firestoreUserData);
        
        console.log(`✅ Created: ${user.name} (${user.username})`);
        results.push({
          name: user.name,
          username: user.username,
          authEmail: user.authEmail,
          role: user.role,
          status: 'success'
        });
        
      } catch (error) {
        console.error(`❌ Error creating user ${user.username}:`, error.message);
        results.push({
          name: user.name,
          username: user.username,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log('🎉 User creation completed!');
    console.log('\n📋 Summary:');
    
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    console.log(`✅ Successfully created: ${successful.length} users`);
    console.log(`❌ Failed creations: ${failed.length} users`);
    
    if (successful.length > 0) {
      console.log('\n✅ Created Users by Role:');
      const masterUsers = successful.filter(u => u.role === 'master');
      const subUsers = successful.filter(u => u.role === 'sub');
      
      console.log(`👑 Master Role: ${masterUsers.length}`);
      masterUsers.forEach(u => console.log(`  - ${u.name} (${u.username})`));
      
      console.log(`👤 Sub Role: ${subUsers.length}`);
      subUsers.forEach(u => console.log(`  - ${u.name} (${u.username})`));
    }

    console.log('\n🔐 Login Credentials (same as before):');
    console.log('Master Admin: masteradmin / admin123');
    console.log('Chairman: rajesh_chairman / chairman123');
    console.log('Directors: [username] / director123');
    console.log('Staff: [username] / staff123');
    
    console.log('\n🔧 Technical Details:');
    console.log('- Users can log in with their username (converted to email internally)');
    console.log('- Authentication is handled by Firebase Auth for persistence');
    console.log('- User profile data is stored in Firestore (without passwords)');
    console.log('- Sessions persist across browser restarts until manual logout');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    // Close the admin app
    admin.app().delete();
  }
}

// Run the creation
createUsersWithFirebaseAuth();