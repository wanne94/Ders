import { ENV as DEV_ENV } from './env.development';
import { ENV as PROD_ENV } from './env.production';

// Određujemo environment na osnovu Expo konstantiog
// __DEV__ je true samo tokom development-a
const isDevelopment = __DEV__;

// Eksportuj odgovarajuću konfiguraciju
export const ENV = isDevelopment ? DEV_ENV : PROD_ENV;

// Helper funkcije za lakše korišćenje
export const getApiUrl = () => ENV.API_URL;
export const getServerUrl = () => ENV.SERVER_URL;
export const isDebugMode = () => ENV.DEBUG;
export const getEnvironmentName = () => ENV.ENV_NAME; 