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

async function migrateUsersToFirebaseAuth() {
  try {
    console.log('🚀 Starting migration from Firestore users to Firebase Authentication...');
    
    // Step 1: Get all existing users from Firestore
    console.log('📋 Fetching existing users from Firestore...');
    const usersSnapshot = await db.collection('users').get();
    const firestoreUsers = [];
    
    usersSnapshot.forEach(doc => {
      firestoreUsers.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📊 Found ${firestoreUsers.length} users in Firestore`);
    
    if (firestoreUsers.length === 0) {
      console.log('❌ No users found in Firestore. Please run populate-users.cjs first.');
      return;
    }
    
    // Step 2: Create Firebase Auth accounts for each user
    console.log('🔐 Creating Firebase Authentication accounts...');
    const batch = db.batch();
    const migrationResults = [];
    
    for (const user of firestoreUsers) {
      try {
        // Create email from username for Firebase Auth
        const email = `${user.username}@zillion-builders-internal.com`;
        
        console.log(`Creating auth account for: ${user.name} (${user.username})`);
        
        // Check if user already exists in Firebase Auth
        let authUser;
        try {
          authUser = await auth.getUserByEmail(email);
          console.log(`⚠️  Auth user already exists for ${user.username}, updating...`);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // User doesn't exist, create new one
            authUser = await auth.createUser({
              uid: `user_${user.id}`, // Use consistent UID
              email: email,
              password: user.password, // Use existing password
              displayName: user.name,
              disabled: user.status !== 'active'
            });
            console.log(`✅ Created Firebase Auth user: ${user.username}`);
          } else {
            throw error;
          }
        }
        
        // Step 3: Update Firestore user document (remove password, keep other data)
        const updatedUserData = {
          ...user,
          firebaseUid: authUser.uid,
          email: email, // Ensure email is stored
          // Remove password from Firestore (now handled by Firebase Auth)
          password: admin.firestore.FieldValue.delete()
        };
        
        // Update the user document in Firestore
        const userDocRef = db.collection('users').doc(user.id.toString());
        batch.set(userDocRef, updatedUserData, { merge: true });
        
        migrationResults.push({
          username: user.username,
          name: user.name,
          email: email,
          firebaseUid: authUser.uid,
          status: 'migrated'
        });
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.username}:`, error.message);
        migrationResults.push({
          username: user.username,
          name: user.name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    // Commit all Firestore updates
    console.log('💾 Updating Firestore user documents...');
    await batch.commit();
    
    // Step 4: Display migration results
    console.log('\n🎉 Migration completed!');
    console.log('\n📊 Migration Summary:');
    
    const successful = migrationResults.filter(r => r.status === 'migrated');
    const failed = migrationResults.filter(r => r.status === 'failed');
    
    console.log(`✅ Successfully migrated: ${successful.length} users`);
    console.log(`❌ Failed migrations: ${failed.length} users`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successfully Migrated Users:');
      successful.forEach(user => {
        console.log(`  - ${user.name} (${user.username}) -> ${user.email}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Migrations:');
      failed.forEach(user => {
        console.log(`  - ${user.name} (${user.username}): ${user.error}`);
      });
    }
    
    console.log('\n🔐 Updated Login Instructions:');
    console.log('Users can now log in using their username as before.');
    console.log('The system will automatically convert username to email for Firebase Auth.');
    console.log('Passwords remain the same as before:');
    console.log('  - Master Admin: masteradmin / admin123');
    console.log('  - Chairman: rajesh_chairman / chairman123'); 
    console.log('  - Directors: [username] / director123');
    console.log('  - Staff: [username] / staff123');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Test the login system with the new Firebase Auth integration');
    console.log('2. Verify that authentication persists across browser sessions');
    console.log('3. Ensure users can only logout manually');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close the admin app
    admin.app().delete();
  }
}

// Function to verify migration (optional)
async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration...');
    
    // Check Firebase Auth users
    const authUsers = await auth.listUsers();
    console.log(`🔐 Firebase Auth has ${authUsers.users.length} users`);
    
    // Check Firestore users
    const firestoreSnapshot = await db.collection('users').get();
    console.log(`📋 Firestore has ${firestoreSnapshot.size} user documents`);
    
    // Check for users without passwords in Firestore
    let passwordlessUsers = 0;
    firestoreSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.password) {
        passwordlessUsers++;
      }
    });
    
    console.log(`✅ ${passwordlessUsers} users have passwords removed from Firestore`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run migration
console.log('🔄 Firebase Authentication Migration Tool');
console.log('==========================================');
migrateUsersToFirebaseAuth().then(() => {
  console.log('\n🔍 Running verification...');
  return verifyMigration();
});