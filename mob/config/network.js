// Network configuration for development
// WSL2 ima problem sa networking - koristićemo localhost umjesto IP adrese
export const NETWORK_CONFIG = {
  // Za WSL2 koristimo localhost umjesto IP adrese
  LOCAL_IP: 'localhost',
  
  // Port na kome radi vaš lokalni server
  LOCAL_PORT: '5003',
  
  // Production URL
  PRODUCTION_URL: 'https://ders.ba'
};

// Helper funkcije
export const getLocalServerUrl = () => `http://${NETWORK_CONFIG.LOCAL_IP}:${NETWORK_CONFIG.LOCAL_PORT}`;
export const getLocalApiUrl = () => `${getLocalServerUrl()}/api`;

// Funkcija za automatsko detektovanje IP adrese (za buduće poboljšanje)
export const detectLocalIP = async () => {
  // Ova funkcija može biti proširena da automatski detektuje IP adresu
  // Za sada vraća statičku vrednost
  return NETWORK_CONFIG.LOCAL_IP;
}; 