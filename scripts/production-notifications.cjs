// For production deployment - API endpoint version
// This could be deployed as a serverless function or API route

const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  // In production, use environment variables or secure config
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

// API endpoint handler (Express.js example)
async function sendNotificationAPI(req, res) {
  try {
    const { taskId, assignedUserId, assignedByUserId, taskTitle } = req.body;
    
    const success = await sendTaskAssignedNotification(
      taskId, 
      assignedUserId, 
      assignedByUserId, 
      taskTitle
    );
    
    if (success) {
      res.json({ success: true, message: 'Notification sent successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Same notification function as before
async function sendTaskAssignedNotification(taskId, assignedUserId, assignedByUserId, taskTitle) {
  try {
    const userDoc = await db.collection('users').doc(assignedUserId).get();
    
    if (!userDoc.exists) {
      console.error('User not found:', assignedUserId);
      return false;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token found for user:', assignedUserId);
      return false;
    }

    const assignedByDoc = await db.collection('users').doc(assignedByUserId).get();
    const assignedByName = assignedByDoc.exists ? assignedByDoc.data().name : 'Someone';

    const message = {
      notification: {
        title: 'New Task Assigned',
        body: `${assignedByName} assigned you a new task: "${taskTitle}"`,
        icon: '/favicon.ico'
      },
      data: {
        type: 'task_assigned',
        taskId: taskId,
        assignedBy: assignedByUserId,
        taskTitle: taskTitle,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token: fcmToken,
      webpush: {
        headers: {
          'TTL': '300'
        },
        notification: {
          title: 'New Task Assigned',
          body: `${assignedByName} assigned you a new task: "${taskTitle}"`,
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

    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);

    // Create notification document in Firestore
    await db.collection('notifications').add({
      userId: assignedUserId,
      title: 'New Task Assigned',
      message: `${assignedByName} assigned you a new task: "${taskTitle}"`,
      type: 'task_assigned',
      taskId: taskId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      data: {
        type: 'task_assigned',
        taskId: taskId,
        assignedBy: assignedByUserId,
        taskTitle: taskTitle
      }
    });

    return true;

  } catch (error) {
    console.error('Error sending notification:', error);
    
    if (error.code === 'messaging/registration-token-not-registered') {
      await db.collection('users').doc(assignedUserId).update({
        fcmToken: admin.firestore.FieldValue.delete()
      });
      console.log('Removed invalid FCM token for user:', assignedUserId);
    }
    
    return false;
  }
}

module.exports = {
  sendNotificationAPI,
  sendTaskAssignedNotification
};
