const jwt = require('jsonwebtoken');

/**
 * 🔐 Generiše JWT token
 * @param {Object} payload - Podaci za token (userId, email, role)
 * @param {string} expiresIn - Vrijeme isteka tokena (default: '7d')
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * 🔒 Verificira JWT token
 * @param {string} token - JWT token za verifikaciju
 * @returns {Object} Decoded token podatci
 * @throws {Error} Ako token nije valjan
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * 🔐 Middleware za autentifikaciju
 * Koristi se za zaštićene rute
 */
const authMiddleware = async (req, res, next) => {
  console.log('🚀 JWT MIDDLEWARE STARTED - Entry point');
  console.log('🔍 Request details:', {
    method: req.method,
    url: req.url,
    path: req.path
  });
  
  try {
    console.log('🔧 JWT Middleware started for:', {
      method: req.method,
      url: req.url,
      path: req.path,
      headers: {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
      }
    });

    // Izvlačimo token iz Authorization header-a
    const authHeader = req.headers.authorization;
    console.log('📋 Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid Authorization header format');
      return res.status(401).json({ message: 'Nema tokena ili pogrešan format' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      console.log('❌ No token found in Authorization header');
      return res.status(401).json({ message: 'Nema tokena' });
    }

    console.log('🔑 Token found, verifying...', {
      tokenPreview: `${token.substring(0, 20)}...`,
      tokenLength: token.length,
      jwtSecret: process.env.JWT_SECRET ? 'Present' : 'Missing'
    });

    // Verificiramo token
    const decoded = verifyToken(token);
    
    console.log('✅ Decoded user from token:', decoded);
    console.log('🔧 Token payload details:', {
      fullDecoded: decoded,
      hasId: !!decoded.id,
      hasUserId: !!decoded.userId,
      has_id: !!decoded._id,
      userId: decoded.id || decoded.userId || decoded._id,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp,
      iat: decoded.iat,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      allKeys: Object.keys(decoded)
    });
    
    // Dodajemo decoded informacije u req.user
    req.user = decoded;
    
    console.log('🔧 JWT Middleware completed successfully, calling next()');
    console.log('🔧 req.user set to:', req.user);
    
    next();
  } catch (err) {
    console.log('❌ JWT Middleware error:', {
      name: err.name,
      message: err.message,
      stack: err.stack?.substring(0, 200) + '...'
    });

    const errorMessage = err.name === 'TokenExpiredError' ? 'Token je istekao' : 'Token nije validan';
    const statusCode = err.name === 'TokenExpiredError' ? 401 : 403;
    console.log('🔧 Returning', statusCode, 'with message:', errorMessage);
    return res.status(statusCode).json({ 
      message: errorMessage
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware
}; 