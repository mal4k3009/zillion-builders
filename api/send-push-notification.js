const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Try to use environment variables first (for production)
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
    // Fall back to local service account file (for development)
    try {
      const serviceAccount = require('../serviceAccountkey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'zillion-builders-group'
      });
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw new Error('Firebase configuration missing');
    }
  }
}

const db = admin.firestore();
const messaging = admin.messaging();

module.exports = async function handler(req, res) {
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
    
    console.log('🔔 Push notification request:', {
      taskId,
      assignedUserId,
      assignedByUserId,
      taskTitle
    });

    // Get user's FCM token from Firestore
    const userDoc = await db.collection('users').doc(assignedUserId).get();
    
    if (!userDoc.exists) {
      console.error('❌ User not found:', assignedUserId);
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log('⚠️ No FCM token found for user:', assignedUserId);
      res.status(400).json({ success: false, error: 'No FCM token found for user' });
      return;
    }

    console.log('🎯 FCM Token found for user:', assignedUserId, 'Token:', fcmToken.substring(0, 20) + '...');

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
    console.log('📤 Sending push notification...');
    const response = await messaging.send(message);
    console.log('✅ Push notification sent successfully:', response);

    // Create notification document in Firestore
    console.log('💾 Creating notification document...');
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

    console.log('✅ Notification process completed successfully');
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
};
