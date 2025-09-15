const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

const db = admin.firestore();

// Indian names for users
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
    status: 'active',
    createdAt: new Date().toISOString()
  });
});

// Function to upload users to Firestore
async function uploadUsers() {
  try {
    console.log('🚀 Starting user upload to Firestore...');
    console.log(`📊 Total users to upload: ${users.length}`);
    
    // Clear existing users collection
    console.log('🗑️ Clearing existing users...');
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('✅ Existing users cleared');

    // Upload new users
    console.log('📤 Uploading new users...');
    for (const user of users) {
      const docRef = db.collection('users').doc(user.id.toString());
      await docRef.set(user);
      console.log(`✅ Uploaded: ${user.name} (${user.department})`);
    }

    console.log('🎉 All users uploaded successfully!');
    console.log('\n📋 Summary:');
    console.log(`� Master Admin: 1`);
    console.log(`� Chairman (Master): 1`);
    console.log(`� Directors (Master): 2`);
    console.log(`� Staff (Sub): 12`);
    console.log(`📊 Total: ${users.length} users`);

    console.log('\n🔐 Login Credentials:');
    console.log('Master Admin: masteradmin / admin123');
    console.log('Chairman: rajesh_chairman / chairman123');
    console.log('Directors: [username] / director123');
    console.log('Staff: [username] / staff123');

  } catch (error) {
    console.error('❌ Error uploading users:', error);
  } finally {
    // Close the admin app
    admin.app().delete();
  }
}

// Run the upload
uploadUsers();