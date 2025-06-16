// Odredi IP adresu na osnovu platforme
const getLocalIP = () => {
  // Za development, koristi stvarnu IP adresu Windows mašine
  // Server se pokreće iz PowerShell-a na ovoj IP adresi
  return 'http://192.168.0.4:5003'; // Windows IP adresa
};

const getBackupURL = () => {
  // Backup opcija - localhost za slučaj da IP ne radi
  return 'http://localhost:5003'; // Localhost fallback
};

const getFallbackLocalURL = () => {
  // Fallback opcija uklonjena za development
  return null;
};

export const ENV = {
  // API pozivi - koristi lokalni server
  API_URL: `${getLocalIP()}/api`,
  SERVER_URL: getLocalIP(),
  BACKUP_API_URL: `${getBackupURL()}/api`,
  BACKUP_SERVER_URL: getBackupURL(),
  FALLBACK_API_URL: `${getFallbackLocalURL()}/api`, // WSL IP fallback
  FALLBACK_SERVER_URL: getFallbackLocalURL(),
  
  // Hibridni pristup - isto kao web aplikacija
  // Upload i prikaz slika uvek koristi produkcijski server
  IMAGE_SERVER_URL: 'https://ders.ba',
  UPLOAD_SERVER_URL: 'https://ders.ba',
  
  APP_NAME: 'DERS Mobile',
  ENV_NAME: 'development',
  DEBUG: true,
  API_ENDPOINTS: {
    PREDAVANJA: '/lectures',
    DAIJE: '/daije',
    UDRUZENJA: '/organizations',
    USERS: '/users'
  },
  
  // Helper function za slike - isto kao web app
  getImageUrl: (imagePath) => {
    if (!imagePath) return 'https://ders.ba/uploads/images/default.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Unified path handling - always use production server for images
    let cleanPath = imagePath;
    
    // Ensure /uploads/images/ format
    cleanPath = imagePath.replace('/upload/images/', '/uploads/images/');
    if (!cleanPath.startsWith('/uploads/images/')) {
      cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '')}`;
    }
    
    // Always use production server for images
    return `https://ders.ba${cleanPath}`;
  },
  
  getDefaultImages: () => ({
    lecture: 'https://ders.ba/uploads/images/predavanjeslika.jpg',
    daija: 'https://ders.ba/uploads/images/daijaslika.jpg',
    organization: 'https://ders.ba/uploads/images/udruzenjeslika.jpg',
    default: 'https://ders.ba/uploads/images/default.jpg',
    logo: 'https://ders.ba/uploads/images/logo.jpg'
  })
}; 