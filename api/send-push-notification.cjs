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

async function sendPushNotification(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { taskId, assignedUserId, assignedByUserId, taskTitle } = req.body;

    // Get user's FCM token from Firestore
    const userDoc = await db.collection('users').doc(assignedUserId).get();
    
    if (!userDoc.exists) {
      console.error('User not found:', assignedUserId);
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token found for user:', assignedUserId);
      res.status(400).json({ success: false, error: 'No FCM token found for user' });
      return;
    }

    // Get the user who assigned the task
    const assignedByDoc = await db.collection('users').doc(assignedByUserId).get();
    const assignedByName = assignedByDoc.exists ? assignedByDoc.data().name : 'Someone';

    // Prepare the message for real push notification
    const message = {
      notification: {
        title: '📋 New Task Assigned',
        body: `${assignedByName} assigned you: "${taskTitle}"`
      },
      data: {
        type: 'task_assigned',
        taskId: taskId,
        assignedBy: assignedByUserId,
        taskTitle: taskTitle,
        click_action: '/tasks',
        url: `/tasks?taskId=${taskId}`
      },
      token: fcmToken,
      webpush: {
        headers: {
          'TTL': '300',
          'Urgency': 'high'
        },
        notification: {
          title: '📋 New Task Assigned',
          body: `${assignedByName} assigned you: "${taskTitle}"`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'task-notification',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          sound: 'default',
          actions: [
            {
              action: 'view',
              title: '👀 View Task',
              icon: '/icons/view.png'
            },
            {
              action: 'dismiss',
              title: '❌ Dismiss',
              icon: '/icons/dismiss.png'
            }
          ],
          data: {
            url: `/tasks?taskId=${taskId}`,
            taskId: taskId
          }
        },
        fcm_options: {
          link: `/tasks?taskId=${taskId}`
        }
      },
      android: {
        priority: 'high',
        notification: {
          title: '📋 New Task Assigned',
          body: `${assignedByName} assigned you: "${taskTitle}"`,
          icon: '/favicon.ico',
          sound: 'default',
          click_action: '/tasks',
          channel_id: 'task_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: '📋 New Task Assigned',
              body: `${assignedByName} assigned you: "${taskTitle}"`
            },
            badge: 1,
            sound: 'default',
            'content-available': 1
          }
        },
        fcm_options: {
          link: `/tasks?taskId=${taskId}`
        }
      }
    };

    // Send the push notification
    const response = await messaging.send(message);
    console.log('✅ Push notification sent successfully:', response);

    // Create notification document in Firestore
    await db.collection('notifications').add({
      userId: assignedUserId,
      title: '📋 New Task Assigned',
      message: `${assignedByName} assigned you: "${taskTitle}"`,
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

    res.json({ 
      success: true, 
      message: 'Push notification sent successfully',
      messageId: response
    });

  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    
    // If token is invalid, remove it from user document
    if (error.code === 'messaging/registration-token-not-registered') {
      try {
        await db.collection('users').doc(req.body.assignedUserId).update({
          fcmToken: admin.firestore.FieldValue.delete()
        });
        console.log('🗑️ Removed invalid FCM token for user:', req.body.assignedUserId);
      } catch (cleanupError) {
        console.error('Error cleaning up invalid token:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code 
    });
  }
}

module.exports = sendPushNotification;
