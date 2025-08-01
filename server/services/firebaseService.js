const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    // Try to find service account file
    const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      // Initialize with default credentials (for development)
      firebaseApp = admin.initializeApp();
      console.log('✅ Firebase Admin SDK initialized with default credentials');
    }
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

// Send notification to a single user
const sendNotification = async (fcmToken, notification) => {
  try {
    if (!fcmToken) {
      throw new Error('FCM token is required');
    }

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to multiple users
const sendMultipleNotifications = async (fcmTokens, notification) => {
  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      throw new Error('At least one FCM token is required');
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens: fcmTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Sent ${response.successCount} notifications successfully`);
    console.log(`❌ Failed to send ${response.failureCount} notifications`);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('❌ Error sending multiple notifications:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to topic
const sendToTopic = async (topic, notification) => {
  try {
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Topic notification sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe tokens to topic
const subscribeToTopic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log(`✅ Successfully subscribed ${response.successCount} tokens to topic ${topic}`);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error subscribing to topic:', error);
    return { success: false, error: error.message };
  }
};

// Unsubscribe tokens from topic
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log(`✅ Successfully unsubscribed ${response.successCount} tokens from topic ${topic}`);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error unsubscribing from topic:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeFirebase,
  sendNotification,
  sendMultipleNotifications,
  sendToTopic,
  sendTopicNotification: sendToTopic, // Alias for consistency
  subscribeToTopic,
  unsubscribeFromTopic
};