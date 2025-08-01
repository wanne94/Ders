// Safe wrapper that completely isolates Firebase for Expo Go
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

class FirebaseMessagingWrapperSafe {
  constructor() {
    this.messaging = null;
    this.isAvailable = false;
    this.isExpoGo = isExpoGo;
    
    // Only try to load Firebase in production builds
    if (!this.isExpoGo) {
      this.initializeMessaging();
    }
  }

  initializeMessaging() {
    // This method is intentionally empty in Expo Go
    // Firebase will only be initialized in production builds
    // Firebase messaging skipped - using Expo notifications
  }

  // Stub methods that return safe defaults
  async requestPermission() {
    if (!this.isAvailable || !this.messaging) return false;
    try {
      const authStatus = await this.messaging().requestPermission();
      return authStatus === this.messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === this.messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async hasPermission() {
    if (!this.isAvailable || !this.messaging) return false;
    try {
      const authStatus = await this.messaging().hasPermission();
      return authStatus === this.messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async getToken() {
    if (!this.isAvailable || !this.messaging) return null;
    try {
      return await this.messaging().getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  onMessage(handler) {
    if (!this.isAvailable || !this.messaging) return () => {};
    try {
      return this.messaging().onMessage(handler);
    } catch (error) {
      console.error('Error setting message handler:', error);
      return () => {};
    }
  }

  onNotificationOpenedApp(handler) {
    if (!this.isAvailable || !this.messaging) return () => {};
    try {
      return this.messaging().onNotificationOpenedApp(handler);
    } catch (error) {
      console.error('Error setting notification opened handler:', error);
      return () => {};
    }
  }

  async getInitialNotification() {
    if (!this.isAvailable || !this.messaging) return null;
    try {
      return await this.messaging().getInitialNotification();
    } catch (error) {
      console.error('Error getting initial notification:', error);
      return null;
    }
  }

  onTokenRefresh(handler) {
    if (!this.isAvailable || !this.messaging) return () => {};
    try {
      return this.messaging().onTokenRefresh(handler);
    } catch (error) {
      console.error('Error setting token refresh handler:', error);
      return () => {};
    }
  }

  setBackgroundMessageHandler(handler) {
    if (!this.isAvailable || !this.messaging) return;
    try {
      this.messaging().setBackgroundMessageHandler(handler);
    } catch (error) {
      console.error('Error setting background message handler:', error);
    }
  }

  async subscribeToTopic(topic) {
    if (!this.isAvailable || !this.messaging) return false;
    try {
      await this.messaging().subscribeToTopic(topic);
      return true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(topic) {
    if (!this.isAvailable || !this.messaging) return false;
    try {
      await this.messaging().unsubscribeFromTopic(topic);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  get AuthorizationStatus() {
    if (!this.isAvailable || !this.messaging) {
      return {
        AUTHORIZED: 1,
        PROVISIONAL: 2
      };
    }
    return this.messaging.AuthorizationStatus;
  }
}

export default new FirebaseMessagingWrapperSafe();