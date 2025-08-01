import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
const environment = require('../../config/environment');

// Firebase configuration for ders-6ea21
const firebaseConfig = {
  apiKey: environment.FIREBASE_API_KEY,
  authDomain: environment.FIREBASE_AUTH_DOMAIN,
  projectId: environment.FIREBASE_PROJECT_ID,
  storageBucket: environment.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.FIREBASE_APP_ID,
  measurementId: environment.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let analytics;
let performance;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Analytics only in browser and when analytics is enabled
  if (typeof window !== 'undefined' && environment.ENABLE_ANALYTICS) {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
        performance = getPerformance(app);
      }
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Helper function to check if analytics is available
const isAnalyticsAvailable = () => {
  return typeof window !== 'undefined' && analytics;
};

// Helper function to check if performance is available
const isPerformanceAvailable = () => {
  return typeof window !== 'undefined' && performance;
};

export { app, analytics, performance, isAnalyticsAvailable, isPerformanceAvailable };
export default app;