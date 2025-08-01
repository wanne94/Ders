import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';
import logger from '../utils/logger';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.analytics = analytics;
    this.crashlytics = crashlytics;
    this.performance = perf;
  }

  async init() {
    try {
      // Enable analytics collection
      await this.analytics().setAnalyticsCollectionEnabled(true);
      
      // Enable crashlytics
      await this.crashlytics().setCrashlyticsCollectionEnabled(true);
      
      this.isInitialized = true;
      logger.log('Firebase initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase:', error);
    }
  }

  // Crashlytics methods
  logError(error, context = {}) {
    if (this.isInitialized) {
      this.crashlytics().recordError(error);
      if (context && Object.keys(context).length > 0) {
        Object.entries(context).forEach(([key, value]) => {
          this.crashlytics().setAttribute(key, String(value));
        });
      }
    }
    logger.error('Firebase Error:', error.message, context);
  }

  logCrash(message, stack) {
    if (this.isInitialized) {
      this.crashlytics().log(message);
      if (stack) {
        this.crashlytics().recordError(new Error(message));
      }
    }
    logger.error('Firebase Crash:', message);
  }

  setUserId(userId) {
    if (this.isInitialized) {
      this.crashlytics().setUserId(userId);
      this.analytics().setUserId(userId);
    }
    logger.log('Firebase - User ID set:', userId);
  }

  setUserProperties(properties) {
    if (this.isInitialized && properties) {
      Object.entries(properties).forEach(([key, value]) => {
        this.analytics().setUserProperty(key, String(value));
        this.crashlytics().setAttribute(key, String(value));
      });
    }
    logger.log('Firebase - User Properties set:', properties);
  }

  // Analytics methods
  logEvent(eventName, parameters = {}) {
    if (this.isInitialized) {
      this.analytics().logEvent(eventName, parameters);
    }
    if (__DEV__) {
      logger.log('Firebase Event:', eventName, parameters);
    }
  }

  logScreenView(screenName, screenClass) {
    if (this.isInitialized) {
      this.analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName
      });
    }
    if (__DEV__) {
      logger.log('Firebase Screen View:', screenName, screenClass);
    }
  }

  // Performance Monitoring methods
  async startTrace(traceName) {
    if (this.isInitialized) {
      const trace = await this.performance().startTrace(traceName);
      return trace;
    }
    logger.log('Firebase - Start Trace:', traceName);
    return { stop: () => logger.log('Firebase - Stop Trace:', traceName) };
  }

  async stopTrace(trace) {
    if (trace && trace.stop) {
      await trace.stop();
    }
  }

  // Remote Config methods - keeping as mock for now until we implement in later phase
  async fetchAndActivate() {
    logger.log('Remote Config - fetch (not implemented yet)');
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

  // A/B Testing methods - keeping as mock for now
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
const firebaseService = new FirebaseService();

export default firebaseService;