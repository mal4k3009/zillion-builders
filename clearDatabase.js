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

// Collections to clear
const collections = [
  'activities',
  'chatMessages',
  'notifications',
  'projects',
  'tasks',
  'test',
  'userCategories',
  'users',
  'whatsappMessages'
];

async function deleteCollection(collectionName) {
  console.log(`🗑️  Deleting collection: ${collectionName}`);
  
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.limit(500);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`   ✅ Deleted ${snapshot.size} documents`);

    // Recurse on the next batch
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

async function clearDatabase() {
  console.log('🚨 WARNING: This will delete ALL data from your database!');
  console.log('⏳ Starting database cleanup in 3 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    for (const collection of collections) {
      await deleteCollection(collection);
      console.log(`✅ Collection '${collection}' cleared\n`);
    }

    console.log('🎉 Database cleared successfully!');
    console.log('✨ All collections are now empty.');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the cleanup
clearDatabase();
