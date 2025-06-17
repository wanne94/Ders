import { ENV as DEV_ENV } from './env.development';
import { ENV as PROD_ENV } from './env.production';

// Određujemo environment na sigurniji način
// Provjeravamo različite načine detekcije development okruženja
const isDevelopment = (
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  process.env.NODE_ENV === 'development' ||
  process.env.EXPO_ENV === 'development'
);

// Eksportuj odgovarajuću konfiguraciju
export const ENV = isDevelopment ? DEV_ENV : PROD_ENV;

// Helper funkcije za lakše korišćenje
export const getApiUrl = () => ENV.API_URL;
export const getServerUrl = () => ENV.SERVER_URL;
export const isDebugMode = () => ENV.DEBUG;
export const getEnvironmentName = () => ENV.ENV_NAME; 