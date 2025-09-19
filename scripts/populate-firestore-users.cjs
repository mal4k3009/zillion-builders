const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

const db = admin.firestore();

// Users data with corrected email format to match Firebase Auth
const users = [
  {
    id: 1,
    username: 'masteradmin',
    role: 'master',
    designation: 'master',
    name: 'Master Administrator',
    email: 'masteradmin@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'rajesh_chairman',
    role: 'chairman',
    designation: 'chairman',
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh_chairman@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    username: 'priya_director',
    role: 'director',
    designation: 'director',
    name: 'Priya Patel',
    email: 'priya_director@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    username: 'ankit_director',
    role: 'director',
    designation: 'director',
    name: 'Ankit Gupta',
    email: 'ankit_director@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    username: 'suresh_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Suresh Reddy',
    email: 'suresh_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    username: 'meera_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Meera Singh',
    email: 'meera_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    username: 'vikram_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Vikram Joshi',
    email: 'vikram_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    username: 'sneha_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Sneha Agarwal',
    email: 'sneha_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    username: 'arjun_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Arjun Nair',
    email: 'arjun_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    username: 'kavya_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Kavya Iyer',
    email: 'kavya_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 11,
    username: 'rohit_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Rohit Verma',
    email: 'rohit_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 12,
    username: 'deepika_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Deepika Rao',
    email: 'deepika_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 13,
    username: 'karthik_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Karthik Menon',
    email: 'karthik_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 14,
    username: 'pooja_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Pooja Mishra',
    email: 'pooja_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 15,
    username: 'sanjay_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Sanjay Kapoor',
    email: 'sanjay_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 16,
    username: 'ritu_staff',
    role: 'staff',
    designation: 'staff',
    name: 'Ritu Bansal',
    email: 'ritu_staff@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 17,
    username: 'best_developer_malak',
    role: 'developer',
    designation: 'senior_developer',
    name: 'Malak - The Best Developer',
    email: 'best_developer_malak@zillion-builders-internal.com',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

async function populateFirestoreUsers() {
  try {
    console.log('🔄 Populating Firestore users collection...');
    
    // Clear existing users collection
    const existingUsers = await db.collection('users').get();
    const batch = db.batch();
    
    existingUsers.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    if (existingUsers.docs.length > 0) {
      await batch.commit();
      console.log(`🗑️ Cleared ${existingUsers.docs.length} existing users`);
    }
    
    // Add new users
    const newBatch = db.batch();
    
    users.forEach((user) => {
      const docRef = db.collection('users').doc(user.id.toString());
      newBatch.set(docRef, user);
    });
    
    await newBatch.commit();
    console.log(`✅ Successfully created ${users.length} users in Firestore`);
    
    // Verify the users were created
    const verification = await db.collection('users').get();
    console.log(`🔍 Verification: ${verification.docs.length} users now exist in Firestore`);
    
    verification.docs.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 User: ${userData.name} (${userData.email}) - ${userData.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error populating Firestore users:', error);
  } finally {
    process.exit(0);
  }
}

populateFirestoreUsers();