// Firebase wrapper for Expo - koristi JavaScript SDK
import logger from '../utils/logger';

class FirebaseExpoService {
  constructor() {
    this.isInitialized = true;
    logger.log('Using Firebase for Expo (Web SDK)');
  }

  async init() {
    logger.log('Firebase Expo Service initialized');
    // Za Expo, Firebase se inicijalizuje kroz google-services.json automatski
  }

  // Analytics methods - za sada mock, može se dodati expo-firebase-analytics
  logEvent(eventName, parameters = {}) {
    if (__DEV__) {
      logger.log('Firebase Event:', eventName, parameters);
    }
    // TODO: Implementirati sa expo-firebase-analytics kada bude dostupan
  }

  logScreenView(screenName, screenClass) {
    if (__DEV__) {
      logger.log('Firebase Screen View:', screenName, screenClass);
    }
  }

  // Crashlytics methods - za sada mock
  logError(error, context = {}) {
    logger.error('Firebase Error:', error.message, context);
    // TODO: Implementirati sa Sentry ili drugim crash reporting servisom
  }

  logCrash(message, stack) {
    logger.error('Firebase Crash:', message);
  }

  setUserId(userId) {
    logger.log('Firebase - User ID set:', userId);
  }

  setUserProperties(properties) {
    logger.log('Firebase - User Properties set:', properties);
  }

  // Performance methods - mock
  async startTrace(traceName) {
    logger.log('Firebase - Start Trace:', traceName);
    return { stop: () => logger.log('Firebase - Stop Trace:', traceName) };
  }

  async stopTrace(trace) {
    if (trace && trace.stop) {
      trace.stop();
    }
  }

  // Remote Config methods - mock
  async fetchAndActivate() {
    logger.log('Remote Config - fetch (not implemented for Expo)');
  }

  getValue(key) {
    return { asBoolean: () => false, asString: () => '', asNumber: () => 0 };
  }

  getBoolean(key) {
    logger.log('Remote Config - Get Boolean:', key, false);
    return false;
  }

  getString(key) {
    const defaults = {
      welcome_message: 'Dobrodošli u Ders aplikaciju!',
      theme_primary_color: '#007AFF'
    };
    logger.log('Remote Config - Get String:', key, defaults[key] || '');
    return defaults[key] || '';
  }

  getNumber(key) {
    const defaults = { max_lecture_duration: 120 };
    logger.log('Remote Config - Get Number:', key, defaults[key] || 0);
    return defaults[key] || 0;
  }

  // A/B Testing methods - mock
  async getABTestVariant(experimentName) {
    logger.log('A/B Test:', experimentName, 'control');
    return 'control';
  }

  // Custom events za tracking korisničkih akcija
  trackUserAction(action, details = {}) {
    this.logEvent('user_action', {
      action_type: action,
      timestamp: Date.now(),
      ...details
    });
  }

  trackLectureEvent(eventType, lectureId, details = {}) {
    this.logEvent('lecture_interaction', {
      event_type: eventType,
      lecture_id: lectureId,
      timestamp: Date.now(),
      ...details
    });
  }

  trackSearchEvent(query, resultsCount = 0) {
    this.logEvent('search', {
      search_term: query,
      results_count: resultsCount,
      timestamp: Date.now()
    });
  }
}

// Singleton instance
const firebaseService = new FirebaseExpoService();

export default firebaseService;