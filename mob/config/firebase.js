// Mock Firebase Service - bez stvarnih Firebase poziva
import logger from '../utils/logger';

class FirebaseService {
  constructor() {
    this.isInitialized = true;
    logger.log('Using Mock Firebase Service');
  }

  async init() {
    logger.log('Mock Firebase initialized');
  }

  // Crashlytics methods
  logError(error, context = {}) {
    logger.error('Mock Firebase - Error:', error.message, context);
  }

  logCrash(message, stack) {
    logger.error('Mock Firebase - Crash:', message);
  }

  setUserId(userId) {
    logger.log('Mock Firebase - User ID:', userId);
  }

  setUserProperties(properties) {
    logger.log('Mock Firebase - User Properties:', properties);
  }

  // Analytics methods
  logEvent(eventName, parameters = {}) {
    logger.log('Mock Firebase - Event:', eventName, parameters);
  }

  logScreenView(screenName, screenClass) {
    logger.log('Mock Firebase - Screen View:', screenName, screenClass);
  }

  // Performance Monitoring methods
  async startTrace(traceName) {
    logger.log('Mock Firebase - Start Trace:', traceName);
    return { stop: () => logger.log('Mock Firebase - Stop Trace:', traceName) };
  }

  async stopTrace(trace) {
    if (trace && trace.stop) trace.stop();
  }

  // Remote Config methods
  async fetchAndActivate() {
    logger.log('Mock Firebase - Remote Config fetch');
  }

  getValue(key) {
    return { asBoolean: () => false, asString: () => '', asNumber: () => 0 };
  }

  getBoolean(key) {
    logger.log('Mock Firebase - Get Boolean:', key, false);
    return false;
  }

  getString(key) {
    const defaults = {
      welcome_message: 'Dobrodošli u Ders aplikaciju!',
      theme_primary_color: '#007AFF'
    };
    logger.log('Mock Firebase - Get String:', key, defaults[key] || '');
    return defaults[key] || '';
  }

  getNumber(key) {
    const defaults = { max_lecture_duration: 120 };
    logger.log('Mock Firebase - Get Number:', key, defaults[key] || 0);
    return defaults[key] || 0;
  }

  // A/B Testing methods
  async getABTestVariant(experimentName) {
    logger.log('Mock Firebase - A/B Test:', experimentName, 'control');
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
const firebaseService = new FirebaseService();

export default firebaseService;