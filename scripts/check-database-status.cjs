const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

const db = admin.firestore();

async function checkDatabaseStatus() {
  console.log('🔍 ZILLION BUILDERS - DATABASE STATUS CHECK');
  console.log('==========================================\n');
  
  try {
    // Collections to check
    const collections = [
      'users',
      'tasks', 
      'chatMessages',
      'notifications',
      'whatsappMessages',
      'activities',
      'projects',
      'categories',
      'userCategories'
    ];

    console.log('📊 Collection Status:');
    console.log('────────────────────────────────────────\n');

    let totalDocuments = 0;
    const collectionSummary = {};

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        const count = snapshot.size;
        totalDocuments += count;
        collectionSummary[collectionName] = count;

        const status = count === 0 ? '🟢 EMPTY' : '🔵 HAS DATA';
        console.log(`${collectionName.padEnd(18)} ${status.padEnd(12)} (${count} documents)`);
        
        // For users collection, show additional details
        if (collectionName === 'users' && count > 0) {
          const userRoles = {};
          snapshot.docs.forEach(doc => {
            const user = doc.data();
            const role = user.role || 'unknown';
            userRoles[role] = (userRoles[role] || 0) + 1;
          });
          
          console.log('                   └─ Roles: ' + Object.entries(userRoles)
            .map(([role, count]) => `${role}(${count})`)
            .join(', '));
        }
        
      } catch (error) {
        console.log(`${collectionName.padEnd(18)} ❌ ERROR     (${error.message})`);
      }
    }

    console.log('\n────────────────────────────────────────');
    console.log(`Total Documents: ${totalDocuments}`);
    
    // Determine database state
    const hasUsers = collectionSummary.users > 0;
    const hasMockData = Object.entries(collectionSummary)
      .filter(([name]) => name !== 'users')
      .some(([, count]) => count > 0);
    
    console.log('\n🎯 Database Assessment:');
    console.log('────────────────────────────────────────');
    
    if (hasUsers && !hasMockData) {
      console.log('✅ PRODUCTION READY');
      console.log('   - Users are configured');
      console.log('   - No mock data present');
      console.log('   - Ready for client use');
    } else if (hasUsers && hasMockData) {
      console.log('⚠️  DEVELOPMENT/TESTING STATE');
      console.log('   - Users are configured');
      console.log('   - Mock data is present');
      console.log('   - Run production cleanup before deployment');
    } else if (!hasUsers) {
      console.log('❌ NOT CONFIGURED');
      console.log('   - No users found');
      console.log('   - Run user migration scripts first');
    }

    // Check Firebase Auth users
    console.log('\n🔐 Firebase Authentication Status:');
    console.log('────────────────────────────────────────');
    
    try {
      const listUsersResult = await admin.auth().listUsers(1000);
      const authUsers = listUsersResult.users;
      
      console.log(`Firebase Auth Users: ${authUsers.length}`);
      
      if (authUsers.length > 0) {
        console.log('✅ Authentication configured');
        
        // Show some auth user details
        const authSummary = authUsers.reduce((acc, user) => {
          const domain = user.email ? user.email.split('@')[1] : 'no-email';
          acc[domain] = (acc[domain] || 0) + 1;
          return acc;
        }, {});
        
        console.log('   Email domains: ' + Object.entries(authSummary)
          .map(([domain, count]) => `${domain}(${count})`)
          .join(', '));
      } else {
        console.log('❌ No authentication users found');
      }
      
    } catch (error) {
      console.log('❌ Error checking Firebase Auth:', error.message);
    }

    console.log('\n📋 Recommendations:');
    console.log('────────────────────────────────────────');
    
    if (!hasUsers) {
      console.log('1. 🔧 Run: node scripts/migrate-to-firebase-auth.cjs');
      console.log('2. 🔧 Run: node scripts/populate-firestore-users.cjs');
    } else if (hasMockData) {
      console.log('1. 🧹 Run: node scripts/prepare-for-production.cjs');
      console.log('2. 🚀 Deploy to production');
    } else {
      console.log('1. 🚀 Ready for production deployment!');
      console.log('2. 📊 Monitor application usage');
    }

  } catch (error) {
    console.error('❌ Error checking database status:', error);
  } finally {
    // Clean up Firebase connection
    admin.app().delete();
  }
}

// Run the check
checkDatabaseStatus().catch(console.error);