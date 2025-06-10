import { getLocalApiUrl, getLocalServerUrl } from './network';

export const ENV = {
  API_URL: getLocalApiUrl(),
  SERVER_URL: getLocalServerUrl(),
  APP_NAME: 'DERS Mobile',
  ENV_NAME: 'development',
  DEBUG: true,
  API_ENDPOINTS: {
    PREDAVANJA: '/lectures',
    DAIJE: '/daije',
    UDRUZENJA: '/organizations',
    USERS: '/users'
  }
}; 