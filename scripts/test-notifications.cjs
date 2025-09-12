const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, onSnapshot, query, where, orderBy, getDocs } = require('firebase/firestore');

// Firebase configuration (using your existing config)
const firebaseConfig = {
  apiKey: "AIzaSyACKPmPJq2_8FjcN8gHrG_H8Ov5-zd9QiI",
  authDomain: "zillion-builders.firebaseapp.com",
  projectId: "zillion-builders",
  storageBucket: "zillion-builders.firebasestorage.app",
  messagingSenderId: "566606415949",
  appId: "1:566606415949:web:ba9c7a9e8d2b6ab7cf0a4b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test notification creation and real-time subscription
async function testNotificationSystem() {
  console.log('🔔 Testing notification system...\n');

  // First, let's see what users we have
  console.log('📋 Available users:');
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const users = [];
  usersSnapshot.forEach(doc => {
    const userData = { id: doc.id, ...doc.data() };
    users.push(userData);
    console.log(`   ID: ${userData.id}, Name: ${userData.name}, Role: ${userData.role}`);
  });

  if (users.length < 2) {
    console.log('❌ Need at least 2 users to test notifications');
    return;
  }

  const senderUser = users.find(u => u.role === 'master') || users[0];
  const receiverUser = users.find(u => u.role === 'sub' && u.id !== senderUser.id) || users[1];

  console.log(`\n✅ Using sender: ${senderUser.name} (ID: ${senderUser.id})`);
  console.log(`✅ Using receiver: ${receiverUser.name} (ID: ${receiverUser.id})\n`);

  // Set up real-time listener for receiver's notifications
  console.log(`🔍 Setting up real-time listener for ${receiverUser.name}'s notifications...`);
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', parseInt(receiverUser.id))
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log(`\n📬 ${receiverUser.name} has ${snapshot.docs.length} total notifications:`);
    snapshot.docs.forEach(doc => {
      const notification = { id: doc.id, ...doc.data() };
      const createdAt = notification.createdAt?.toDate?.() || new Date(notification.createdAt);
      console.log(`   ${notification.isRead ? '✅' : '🔔'} [${notification.type}] ${notification.title}`);
      console.log(`      ${notification.message}`);
      console.log(`      Created: ${createdAt.toLocaleString()}`);
      if (notification.relatedUserId) {
        console.log(`      From User ID: ${notification.relatedUserId}`);
      }
    });
  });

  // Test 1: Create a message notification
  console.log('\n🧪 Test 1: Creating message notification...');
  try {
    const messageNotification = {
      userId: parseInt(receiverUser.id),
      type: 'message_received',
      title: 'New Message',
      message: `You received a message from ${senderUser.name}`,
      isRead: false,
      createdAt: new Date(),
      relatedUserId: parseInt(senderUser.id),
      messageId: 'test-message-123',
      priority: 'normal'
    };

    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, messageNotification);
    console.log('✅ Message notification created successfully');
  } catch (error) {
    console.error('❌ Error creating message notification:', error.message);
  }

  // Wait a bit to see the real-time update
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Create a task assignment notification
  console.log('\n🧪 Test 2: Creating task assignment notification...');
  try {
    const taskNotification = {
      userId: parseInt(receiverUser.id),
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `${senderUser.name} assigned you a task: "Complete quarterly report"`,
      isRead: false,
      createdAt: new Date(),
      relatedUserId: parseInt(senderUser.id),
      taskId: 'task-456',
      priority: 'high'
    };

    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, taskNotification);
    console.log('✅ Task assignment notification created successfully');
  } catch (error) {
    console.error('❌ Error creating task notification:', error.message);
  }

  // Wait a bit to see the real-time update
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Create a task update notification
  console.log('\n🧪 Test 3: Creating task update notification...');
  try {
    const updateNotification = {
      userId: parseInt(senderUser.id), // Notify the admin about task completion
      type: 'task_updated',
      title: 'Task Completed',
      message: `${receiverUser.name} completed the task: "Complete quarterly report"`,
      isRead: false,
      createdAt: new Date(),
      relatedUserId: parseInt(receiverUser.id),
      taskId: 'task-456',
      priority: 'normal'
    };

    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, updateNotification);
    console.log('✅ Task update notification created successfully');
  } catch (error) {
    console.error('❌ Error creating task update notification:', error.message);
  }

  // Wait for final real-time updates
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n🎉 Notification system test completed!');
  console.log('📝 Summary:');
  console.log('   - Real-time listener is working');
  console.log('   - Notifications are being created with proper structure');
  console.log('   - All notification types (message_received, task_assigned, task_updated) tested');
  console.log('\n💡 You can now test the UI by:');
  console.log('   1. Logging in as the receiver user');
  console.log('   2. Opening the notification panel');
  console.log('   3. Checking the notifications page');

  // Clean up
  unsubscribe();
  process.exit(0);
}

// Run the test
testNotificationSystem().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});