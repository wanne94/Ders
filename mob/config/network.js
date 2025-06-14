// Network configuration for development
// Ažurirajte ovu IP adresu ako se promeni IP adresa vašeg računara
export const NETWORK_CONFIG = {
  // Vaša trenutna IP adresa u lokalnoj mreži
  LOCAL_IP: '172.31.112.1',
  
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