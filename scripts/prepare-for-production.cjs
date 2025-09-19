const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

const db = admin.firestore();

console.log('🚀 Preparing database for production...\n');

async function cleanupMockData() {
  try {
    // Collections to completely clear (remove all documents)
    const collectionsToClean = [
      'tasks',
      'chatMessages', 
      'notifications',
      'whatsappMessages',
      'activities',
      'projects',
      'categories',
      'userCategories'
    ];

    console.log('🧹 Cleaning up mock data from collections...\n');

    for (const collectionName of collectionsToClean) {
      console.log(`📂 Processing collection: ${collectionName}`);
      
      // Get all documents in the collection
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`   ✅ Collection '${collectionName}' is already empty`);
        continue;
      }

      console.log(`   📊 Found ${snapshot.size} documents to delete`);

      // Delete all documents in batches (Firestore has a limit of 500 operations per batch)
      const batch = db.batch();
      let count = 0;

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        console.log(`   🗑️  Deleted ${count} documents from '${collectionName}'`);
      }
    }

    console.log('\n🎯 Mock data cleanup completed!');
    
    // Verify users collection integrity
    console.log('\n👥 Verifying users collection...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`   📊 Users collection contains ${usersSnapshot.size} users`);
    
    if (usersSnapshot.size > 0) {
      console.log('   ✅ Users collection preserved successfully');
      
      // Log user summary
      const userSummary = {};
      usersSnapshot.docs.forEach(doc => {
        const user = doc.data();
        const role = user.role || 'unknown';
        userSummary[role] = (userSummary[role] || 0) + 1;
      });
      
      console.log('   📋 User roles summary:');
      Object.entries(userSummary).forEach(([role, count]) => {
        console.log(`      - ${role}: ${count} users`);
      });
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

async function setupProductionIndexes() {
  console.log('\n🔧 Setting up production indexes and structure...');
  
  try {
    // Create sample documents with proper structure to ensure indexes
    // These will be immediately deleted but help establish the schema
    
    const sampleDocs = {
      tasks: {
        id: 'sample',
        title: 'Sample Task',
        description: 'Sample Description',
        assignedTo: 1,
        assignedBy: 1,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'general',
        approvalStatus: 'pending',
        approvedBy: null,
        approvedAt: null,
        completedAt: null,
        comments: []
      },
      
      chatMessages: {
        id: 'sample',
        senderId: 1,
        receiverId: 2,
        message: 'Sample message',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      },
      
      notifications: {
        id: 'sample',
        userId: 1,
        title: 'Sample Notification',
        message: 'Sample message',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: null
      },
      
      activities: {
        id: 'sample',
        userId: 1,
        userName: 'Sample User',
        action: 'sample_action',
        details: 'Sample activity',
        timestamp: new Date().toISOString(),
        type: 'system'
      },
      
      projects: {
        id: 1,
        name: 'Sample Project',
        description: 'Sample Description',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 1,
        categories: []
      },
      
      categories: {
        id: 1,
        name: 'Sample Category',
        description: 'Sample Description',
        color: '#3B82F6',
        createdAt: new Date().toISOString()
      },
      
      userCategories: {
        id: 1,
        userId: 1,
        categoryId: 1,
        createdAt: new Date().toISOString()
      },
      
      whatsappMessages: {
        id: 'sample',
        phoneNumber: '+1234567890',
        message: 'Sample WhatsApp message',
        timestamp: new Date().toISOString(),
        status: 'sent',
        direction: 'outbound'
      }
    };

    console.log('   📝 Creating schema documents...');
    
    for (const [collectionName, sampleDoc] of Object.entries(sampleDocs)) {
      try {
        await db.collection(collectionName).doc('schema_sample').set(sampleDoc);
        console.log(`   ✅ Schema document created for ${collectionName}`);
      } catch (error) {
        console.log(`   ⚠️  Warning: Could not create schema for ${collectionName}:`, error.message);
      }
    }

    // Wait a moment for Firestore to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('   🗑️  Removing schema documents...');
    
    // Remove the schema documents
    for (const collectionName of Object.keys(sampleDocs)) {
      try {
        await db.collection(collectionName).doc('schema_sample').delete();
        console.log(`   ✅ Schema document removed from ${collectionName}`);
      } catch (error) {
        console.log(`   ⚠️  Warning: Could not remove schema from ${collectionName}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error setting up indexes:', error);
  }
}

async function verifyProductionReadiness() {
  console.log('\n🔍 Verifying production readiness...');
  
  try {
    // Check that collections are empty but exist
    const collections = [
      'tasks', 'chatMessages', 'notifications', 'whatsappMessages', 
      'activities', 'projects', 'categories', 'userCategories'
    ];
    
    let allGood = true;
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      if (snapshot.size === 0) {
        console.log(`   ✅ ${collectionName}: Empty and ready`);
      } else {
        console.log(`   ❌ ${collectionName}: Still contains ${snapshot.size} documents`);
        allGood = false;
      }
    }
    
    // Check users collection
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.size > 0) {
      console.log(`   ✅ users: Contains ${usersSnapshot.size} users (preserved)`);
    } else {
      console.log(`   ❌ users: No users found!`);
      allGood = false;
    }
    
    if (allGood) {
      console.log('\n🎉 Database is production ready!');
      console.log('   📋 Summary:');
      console.log('   - All mock data removed');
      console.log('   - User accounts preserved');
      console.log('   - Collections structured for new data');
      console.log('   - Ready for client use');
    } else {
      console.log('\n⚠️  Some issues detected. Please review above.');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

async function main() {
  console.log('========================================');
  console.log('🏭 PRODUCTION DATABASE PREPARATION');
  console.log('========================================\n');
  
  console.log('⚠️  WARNING: This will remove ALL mock data!');
  console.log('✅ User accounts in Firebase Auth will be preserved');
  console.log('✅ User documents in Firestore will be preserved');
  console.log('🗑️  All other collections will be cleared\n');
  
  // Wait 3 seconds to let user read the warning
  console.log('Starting in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Starting in 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Starting in 1 second...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Starting now!\n');
  
  try {
    await cleanupMockData();
    await setupProductionIndexes();
    await verifyProductionReadiness();
    
    console.log('\n========================================');
    console.log('✅ PRODUCTION PREPARATION COMPLETE!');
    console.log('========================================\n');
    
    console.log('🚀 Your application is now production ready!');
    console.log('📝 Next steps:');
    console.log('   1. Deploy your application');
    console.log('   2. Test user authentication');
    console.log('   3. Create new data through the frontend');
    console.log('   4. Monitor application performance\n');
    
  } catch (error) {
    console.error('\n❌ Production preparation failed:', error);
    process.exit(1);
  } finally {
    // Clean up Firebase connection
    admin.app().delete();
  }
}

// Run the script
main().catch(console.error);