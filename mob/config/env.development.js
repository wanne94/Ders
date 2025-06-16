// Odredi IP adresu na osnovu platforme
const getLocalIP = () => {
  // Za development, koristimo IP adresu umjesto localhost
  return 'http://172.31.112.1:3000'; // Tvoja IP adresa
};

export const ENV = {
  API_URL: `${getLocalIP()}/api`,
  SERVER_URL: getLocalIP(),
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