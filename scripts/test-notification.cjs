const { sendTaskAssignedNotification } = require('./push-notifications.cjs');

// Example usage function - call this from your frontend when a task is created
async function triggerTaskNotification(taskId, assignedUserId, assignedByUserId, taskTitle) {
  console.log('Triggering task notification...');
  const success = await sendTaskAssignedNotification(taskId, assignedUserId, assignedByUserId, taskTitle);
  
  if (success) {
    console.log('Notification sent successfully');
  } else {
    console.log('Failed to send notification');
  }
  
  return success;
}

// For testing - you can run this script directly
if (require.main === module) {
  // Example test call
  triggerTaskNotification('test-task-123', '2', '1', 'Complete the project proposal')
    .then(() => {
      console.log('Test notification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  triggerTaskNotification
};
