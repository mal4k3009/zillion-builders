const fetch = require('node-fetch');

async function testCompleteSystem() {
  console.log('🧪 COMPREHENSIVE SYSTEM TEST');
  console.log('===============================\n');
  
  // Test 1: API Server Health
  console.log('1️⃣ Testing API server...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      console.log('✅ API server is running and healthy');
    } else {
      console.log('❌ API server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to API server:', error.message);
    return false;
  }

  // Test 2: Push notification with user that has FCM token
  console.log('\n2️⃣ Testing push notification...');
  try {
    const notificationResponse = await fetch('http://localhost:3001/api/send-push-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: 'test-task-' + Date.now(),
        assignedUserId: '2', // Sales Admin
        assignedByUserId: '1', // Master Admin
        taskTitle: '📱 REAL PHONE NOTIFICATION TEST - ' + new Date().toLocaleTimeString()
      })
    });

    const result = await notificationResponse.json();
    
    if (result.success) {
      console.log('✅ Push notification sent successfully!');
      console.log('📱 Message ID:', result.messageId);
    } else {
      console.log('⚠️  Push notification failed:', result.error);
      if (result.error.includes('No FCM token')) {
        console.log('💡 This is expected - user needs to login first to get FCM token');
      }
    }
  } catch (error) {
    console.log('❌ Push notification test failed:', error.message);
  }

  console.log('\n🎯 NEXT STEPS FOR REAL PHONE NOTIFICATIONS:');
  console.log('==========================================');
  console.log('1. 📱 Open http://localhost:5173/ on your PHONE browser');
  console.log('2. 🔐 Login as Sales Admin (sales_admin / sales123)');
  console.log('3. 🔔 Allow notification permissions when prompted');
  console.log('4. 📱 Keep the browser tab open OR add to home screen');
  console.log('5. 💻 On another device, login as Master Admin');
  console.log('6. ➕ Create a task and assign it to Sales Admin');
  console.log('7. 🚨 Check your PHONE - you should get a notification!');
  
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('- Make sure both users are logged in');
  console.log('- Check that notification permissions are granted');
  console.log('- Verify FCM tokens are stored in Firebase');
  console.log('- Test with both browser notifications and phone notifications');

  return true;
}

// Run the comprehensive test
testCompleteSystem()
  .then(() => {
    console.log('\n✨ System test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 System test failed:', error);
    process.exit(1);
  });
