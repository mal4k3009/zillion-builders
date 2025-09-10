const fetch = require('node-fetch');

async function testPushNotification() {
  try {
    console.log('🧪 Testing push notification system...');
    
    const response = await fetch('http://localhost:3001/api/send-push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: 'test-task-123',
        assignedUserId: '2', // Sales admin
        assignedByUserId: '1', // Master admin  
        taskTitle: 'Test Push Notification Task'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Push notification test PASSED!');
      console.log('📱 Notification details:', result);
    } else {
      console.log('❌ Push notification test FAILED!');
      console.log('Error:', result.error);
    }
    
    return result.success;
  } catch (error) {
    console.error('🚨 Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testPushNotification()
  .then((success) => {
    if (success) {
      console.log('\n🎉 SYSTEM READY! Push notifications are working!');
      console.log('📋 Next steps:');
      console.log('1. Open http://localhost:5175/ in your browser');
      console.log('2. Login as any admin user');
      console.log('3. Allow notification permissions when prompted');
      console.log('4. Create a task and assign it to another user');
      console.log('5. Check your phone for real push notifications! 📱');
    } else {
      console.log('\n❌ System needs attention. Check the errors above.');
    }
    process.exit(success ? 0 : 1);
  });
