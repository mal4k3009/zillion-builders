const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'zillion-builders-group'
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Send push notification to a specific user
 * @param {string} userId - The ID of the user to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data to send with notification
 */
async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    // Get user's FCM token from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('User not found:', userId);
      return false;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token found for user:', userId);
      return false;
    }

    // Prepare the message
    const message = {
      notification: {
        title: title,
        body: body,
        icon: '/favicon.ico'
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token: fcmToken,
      webpush: {
        headers: {
          'TTL': '300'
        },
        notification: {
          title: title,
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'task-notification',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Task'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        }
      }
    };

    // Send the message
    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return true;

  } catch (error) {
    console.error('Error sending notification:', error);
    
    // If token is invalid, remove it from user document
    if (error.code === 'messaging/registration-token-not-registered') {
      await db.collection('users').doc(userId).update({
        fcmToken: admin.firestore.FieldValue.delete()
      });
      console.log('Removed invalid FCM token for user:', userId);
    }
    
    return false;
  }
}

/**
 * Send notification when a task is assigned
 * @param {string} taskId - The ID of the assigned task
 * @param {string} assignedUserId - The ID of the user the task is assigned to
 * @param {string} assignedByUserId - The ID of the user who assigned the task
 * @param {string} taskTitle - The title of the task
 */
async function sendTaskAssignedNotification(taskId, assignedUserId, assignedByUserId, taskTitle) {
  try {
    // Get the user who assigned the task
    const assignedByDoc = await db.collection('users').doc(assignedByUserId).get();
    const assignedByName = assignedByDoc.exists ? assignedByDoc.data().name : 'Someone';

    const title = 'New Task Assigned';
    const body = `${assignedByName} assigned you a new task: "${taskTitle}"`;
    
    const data = {
      type: 'task_assigned',
      taskId: taskId,
      assignedBy: assignedByUserId,
      taskTitle: taskTitle
    };

    const success = await sendNotificationToUser(assignedUserId, title, body, data);
    
    if (success) {
      // Also create a notification document in Firestore
      await db.collection('notifications').add({
        userId: assignedUserId,
        title: title,
        message: body,
        type: 'task_assigned',
        taskId: taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        data: data
      });
    }

    return success;
  } catch (error) {
    console.error('Error in sendTaskAssignedNotification:', error);
    return false;
  }
}

module.exports = {
  sendNotificationToUser,
  sendTaskAssignedNotification
};
