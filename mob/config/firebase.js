// Safe imports for Expo Go compatibility
let firebase, crashlytics, perf, analytics, remoteConfig;

try {
  firebase = require('@react-native-firebase/app').firebase;
  crashlytics = require('@react-native-firebase/crashlytics').default;
  perf = require('@react-native-firebase/perf').default;
  analytics = require('@react-native-firebase/analytics').default;
  remoteConfig = require('@react-native-firebase/remote-config').default;
} catch (error) {
  console.log('Firebase modules not available in Expo Go - this is expected');
}

// Firebase inicijalizacija
class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.isExpoGo = !firebase; // Detect if running in Expo Go
    this.init();
  }

  async init() {
    try {
      if (this.isExpoGo) {
        console.log('Running in Expo Go - Firebase mock mode');
        this.isInitialized = true;
        return;
      }

      // Firebase se automatski inicijalizuje sa google-services.json/GoogleService-Info.plist
      
      // Crashlytics setup
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Analytics setup
      await analytics().setAnalyticsCollectionEnabled(true);
      
      // Remote Config setup
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 60000, // 1 minuta za development
      });
      
      // Default Remote Config vrijednosti
      await remoteConfig().setDefaults({
        welcome_message: 'Dobrodošli u Ders aplikaciju!',
        feature_flag_new_ui: false,
        theme_primary_color: '#007AFF',
        max_lecture_duration: 120,
        enable_push_notifications: true,
      });

      // Performance Monitoring se automatski aktivira
      
      this.isInitialized = true;
      console.log('Firebase services initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      if (crashlytics) {
        crashlytics().recordError(error);
      }
    }
  }

  // Crashlytics methods
  logError(error, context = {}) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Error:', error.message, context);
      return;
    }
    crashlytics().recordError(error);
    crashlytics().setAttributes(context);
  }

  logCrash(message, stack) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Crash:', message);
      return;
    }
    crashlytics().log(message);
    if (stack) {
      crashlytics().recordError(new Error(message));
    }
  }

  setUserId(userId) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - User ID:', userId);
      return;
    }
    crashlytics().setUserId(userId);
    analytics().setUserId(userId);
  }

  setUserProperties(properties) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - User Properties:', properties);
      return;
    }
    Object.keys(properties).forEach(key => {
      analytics().setUserProperty(key, properties[key]);
    });
  }

  // Analytics methods
  logEvent(eventName, parameters = {}) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Event:', eventName, parameters);
      return;
    }
    analytics().logEvent(eventName, parameters);
  }

  logScreenView(screenName, screenClass) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Screen View:', screenName, screenClass);
      return;
    }
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass,
    });
  }

  // Performance Monitoring methods
  async startTrace(traceName) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Start Trace:', traceName);
      return { stop: () => console.log('Firebase Mock - Stop Trace:', traceName) };
    }
    const trace = perf().newTrace(traceName);
    await trace.start();
    return trace;
  }

  async stopTrace(trace) {
    if (this.isExpoGo) {
      if (trace && trace.stop) trace.stop();
      return;
    }
    await trace.stop();
  }

  // Remote Config methods
  async fetchAndActivate() {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Remote Config fetch');
      return;
    }
    try {
      await remoteConfig().fetchAndActivate();
      console.log('Remote config fetched and activated');
    } catch (error) {
      console.error('Remote config fetch error:', error);
      this.logError(error);
    }
  }

  getValue(key) {
    if (this.isExpoGo) {
      return { asBoolean: () => false, asString: () => '', asNumber: () => 0 };
    }
    return remoteConfig().getValue(key);
  }

  getBoolean(key) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - Get Boolean:', key, false);
      return false;
    }
    return remoteConfig().getValue(key).asBoolean();
  }

  getString(key) {
    if (this.isExpoGo) {
      const defaults = {
        welcome_message: 'Dobrodošli u Ders aplikaciju!',
        theme_primary_color: '#007AFF'
      };
      console.log('Firebase Mock - Get String:', key, defaults[key] || '');
      return defaults[key] || '';
    }
    return remoteConfig().getValue(key).asString();
  }

  getNumber(key) {
    if (this.isExpoGo) {
      const defaults = { max_lecture_duration: 120 };
      console.log('Firebase Mock - Get Number:', key, defaults[key] || 0);
      return defaults[key] || 0;
    }
    return remoteConfig().getValue(key).asNumber();
  }

  // A/B Testing methods
  async getABTestVariant(experimentName) {
    if (this.isExpoGo) {
      console.log('Firebase Mock - A/B Test:', experimentName, 'control');
      return 'control';
    }
    await this.fetchAndActivate();
    return this.getString(`ab_test_${experimentName}`);
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