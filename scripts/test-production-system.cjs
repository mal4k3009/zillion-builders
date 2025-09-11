const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || 'zillion-builders-group',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'zillion-builders-group'
    });
  } else {
    try {
      const serviceAccount = require('../serviceAccountkey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'zillion-builders-group'
      });
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      process.exit(1);
    }
  }
}

const db = admin.firestore();

async function testProductionSystem() {
  console.log('🔍 Testing Production Notification System...\n');

  try {
    // 1. Check Firebase connection
    console.log('1️⃣ Testing Firebase connection...');
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true
    });
    console.log('✅ Firebase connection successful\n');

    // 2. List all users and their FCM tokens
    console.log('2️⃣ Checking users and FCM tokens...');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in database\n');
      return;
    }

    console.log(`Found ${usersSnapshot.size} users:`);
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const hasToken = userData.fcmToken ? '✅' : '❌';
      console.log(`  ${hasToken} ${userData.name} (ID: ${doc.id}) - Token: ${userData.fcmToken ? 'Available' : 'Missing'}`);
    });
    console.log('');

    // 3. Check recent tasks
    console.log('3️⃣ Checking recent tasks...');
    const tasksSnapshot = await db.collection('tasks')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    if (tasksSnapshot.empty) {
      console.log('❌ No tasks found in database\n');
    } else {
      console.log(`Found ${tasksSnapshot.size} recent tasks:`);
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        console.log(`  📋 ${taskData.title} - Assigned to: ${taskData.assignedTo} by ${taskData.assignedBy}`);
      });
      console.log('');
    }

    // 4. Check notifications
    console.log('4️⃣ Checking recent notifications...');
    const notificationsSnapshot = await db.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    if (notificationsSnapshot.empty) {
      console.log('❌ No notifications found in database\n');
    } else {
      console.log(`Found ${notificationsSnapshot.size} recent notifications:`);
      notificationsSnapshot.forEach(doc => {
        const notifData = doc.data();
        const timestamp = notifData.createdAt?.toDate?.() || 'Unknown time';
        console.log(`  🔔 ${notifData.title} - User: ${notifData.userId} - ${timestamp}`);
      });
      console.log('');
    }

    // 5. Environment check
    console.log('5️⃣ Environment configuration check...');
    console.log(`Current environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Firebase Project ID: ${admin.app().options.projectId}`);
    console.log(`Has environment variables: ${process.env.FIREBASE_PRIVATE_KEY ? '✅' : '❌'}`);
    console.log('');

    console.log('🎉 Production system test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure users have FCM tokens (they need to visit the site and allow notifications)');
    console.log('2. Test task assignment between users with FCM tokens');
    console.log('3. Check browser console for notification errors');
    console.log('4. Verify API endpoint is accessible at your production URL');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductionSystem().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});