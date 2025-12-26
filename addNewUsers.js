import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountkey.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://zillion-builders-group.firebaseio.com"
});

const db = admin.firestore();

// New users to add
const newUsers = [
  {
    name: 'Jignesh',
    email: 'jignesh@sentimentalrealestate.com',
    username: 'jignesh',
    password: 'Jignesh@2025',
    designation: 'admin',
    role: 'admin',
    status: 'active',
    whatsappNumber: '+919925823424',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Manthan',
    email: 'manthan@sentimentalrealestate.com',
    username: 'manthan',
    password: 'Manthan@2025',
    designation: 'manager',
    role: 'manager',
    status: 'active',
    whatsappNumber: '+917284045643',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Ketan',
    email: 'ketan@sentimentalrealestate.com',
    username: 'ketan',
    password: 'Ketan@2025',
    designation: 'employee',
    role: 'employee',
    status: 'active',
    whatsappNumber: '+919228502050',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Dhaval',
    email: 'dhaval@sentimentalrealestate.com',
    username: 'dhaval',
    password: 'Dhaval@2025',
    designation: 'employee',
    role: 'employee',
    status: 'active',
    whatsappNumber: '+919978223424',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function clearUsers() {
  console.log('🗑️  Clearing existing users...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('✅ Cleared all existing users');
}

async function addUsers() {
  console.log('👥 Adding new users...');
  
  for (const user of newUsers) {
    await db.collection('users').add(user);
    console.log(`✅ Added user: ${user.name} (${user.role})`);
  }
  
  console.log('\n✨ All users added successfully!\n');
  console.log('📋 User Credentials:');
  console.log('═'.repeat(60));
  newUsers.forEach(user => {
    console.log(`\n👤 ${user.name}`);
    console.log(`   Role: ${user.role.toUpperCase()}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   WhatsApp: ${user.whatsappNumber}`);
  });
  console.log('\n' + '═'.repeat(60));
}

async function main() {
  try {
    console.log('🚀 Starting user update process...\n');
    
    await clearUsers();
    await addUsers();
    
    console.log('\n✅ Process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
