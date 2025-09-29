import { ENV as DEV_ENV } from './env.development';
import { ENV as PROD_ENV } from './env.production';

// Određujemo environment na sigurniji način
// Za standalone APK, uvek koristi production
const isDevelopment = __DEV__ || false; // Use React Native's __DEV__ flag

// Eksportuj odgovarajuću konfiguraciju
export const ENV = isDevelopment ? DEV_ENV : PROD_ENV;

// Helper funkcije za lakše korišćenje
export const getApiUrl = () => ENV.API_URL;
export const getServerUrl = () => ENV.SERVER_URL;
export const isDebugMode = () => __DEV__ && ENV.DEBUG; // Only enable debug in dev mode
export const getEnvironmentName = () => ENV.ENV_NAME; 