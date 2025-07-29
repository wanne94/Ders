const express = require('express');
// Load environment-specific configuration
const path = require('path');
const dotenv = require('dotenv');

// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'development' 
  ? '.env.development' 
  : '.env.production';

console.log(`🔧 Loading environment from: ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Debug environment variables
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('📦 MONGODB_URI loaded:', process.env.MONGODB_URI ? 'YES' : 'NO');
if (process.env.MONGODB_URI) {
  console.log('📦 MONGODB_URI (masked):', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));
}
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const multer = require('multer');

// 🔐 JWT utilities
const { generateToken, verifyToken, authMiddleware: jwtAuthMiddleware } = require('./utils/jwt');

// Import routes
const usersRouter = require('./routes/users');
const lecturesRouter = require('./routes/lecturesRoutes');

// Import models
const Lecture = require('./models/Lecture');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Daija = require('./models/Daija');
const Suggestion = require('./models/Suggestion');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 5003;

// Winston logger konfiguracija
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// CORS konfiguracija - dozvoliti sve domene u produkciji
const corsOptions = {
  origin: function (origin, callback) {
    // Dozvoliti sve domene u produkciji
    if (process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      // U development-u, dozvoliti localhost i lokalne IP adrese
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://127.0.0.1:3000',
        'http://192.168.0.20:3000',
        'https://ders.ba',
        'http://ders.ba',
        'https://ders.ba:3000',
        'http://ders.ba:3000',
        'http://194.163.176.171:3000',
        'http://194.163.176.171',
        'https://194.163.176.171'
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Helmet sigurnosni headers - konfiguracija za produkciju
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5003", "https://ders.ba:5003", "http://ders.ba:5003", "https://194.163.176.171:5003", "http://194.163.176.171:5003"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' })); // Reduced from 50mb to prevent memory issues
app.use(morgan('combined')); // HTTP request logging

// 🚀 Next.js build - serviranje statičkih fajlova
// Za development: koristi Next.js dev server (ne servira statičke fajlove)
// Za production: servira iz .next ili out foldera
const isProduction = process.env.NODE_ENV === 'production';

console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

if (isProduction) {
  // Production - provjeri da li postoji out folder (static export) ili koristi .next
  const outPath = path.join(__dirname, '../out');
  const nextPath = path.join(__dirname, '../.next');
  
  if (fs.existsSync(outPath)) {
    // Static export build
    app.use(express.static(outPath));
    console.log('📦 Serving production static export from /out folder');
  } else if (fs.existsSync(nextPath)) {
    // Regular Next.js build
    app.use(express.static(path.join(__dirname, '../.next/static')));
    console.log('📦 Serving production build from /.next folder');
  } else {
    console.warn('⚠️  No production build found. Run "npm run build" first.');
  }
} else {
  // Development - Next.js dev server handles static files
  console.log('🔧 Development mode - Next.js dev server handles static files');
  console.log('🔧 Start frontend with: npm run dev');
}

// Uvijek servira public folder
// Static files are now served by Next.js from web/public

// In development, uploads are handled by production server (https://ders.ba)
// This prevents local file storage and ensures consistency
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  console.log('📁 Serving uploads from server/uploads (production only)');
} else {
  console.log('📁 Development mode: uploads handled by production server (https://ders.ba)');
}

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DERS Backend server is running!', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    version: '1.0.0'
  });
});

// Detailed health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API health check
app.get('/api', (req, res) => {
  res.json({
    message: 'DERS API is working!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/lectures',
      '/api/daije', 
      '/api/organizations',
      '/api/users'
    ]
  });
});

// API health check endpoint (what frontend expects)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Use upload routes
app.use('/api/upload-image', require('./routes/uploadImage'));

// API routes
app.use('/api', express.json());

// 🔐 Koristimo novi authMiddleware iz utils/jwt.js
const authenticateToken = jwtAuthMiddleware;

// Middleware za provjeru je li korisnik admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Potrebne su administratorske dozvole za pristup ovoj funkciji.' });
  }
};

// Middleware za provjeru je li korisnik super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Potrebne su super administratorske dozvole za pristup ovoj funkciji.' });
  }
};

// Middleware za provjeru je li korisnik admin ili super admin
const isAdminOrSuperAdmin = (req, res, next) => {
  try {
    logger.info('Checking admin/super_admin access:', {
      user: req.user,
      role: req.user?.role,
      allowedRoles: ['admin', 'super_admin']
    });

    // Ensure user object exists and has role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Korisničke dozvole nisu pronađene. Molimo prijavite se ponovo.' });
    }

    const allowedRoles = ['admin', 'super_admin'];
    
    if (allowedRoles.includes(req.user.role)) {
      logger.info('Access granted for role:', req.user.role);
      next();
    } else {
      logger.warn('Access denied for role:', req.user.role);
      res.status(403).json({ message: 'Potrebne su administratorske dozvole za pristup ovoj funkciji.' });
    }
  } catch (error) {
    logger.error('Error in isAdminOrSuperAdmin middleware:', error);
    res.status(500).json({ message: 'Greška pri provjeri dozvola. Molimo pokušajte ponovo.' });
  }
};

// Middleware za provjeru da li korisnik može ažurirati profil (svoj ili ako je admin)
const canUpdateProfile = (req, res, next) => {
  try {
    console.log('🔧 canUpdateProfile middleware started');
    console.log('👤 User from token:', {
      id: req.user?.id,
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role
    });

    // Ensure user object exists
    if (!req.user || !req.user.id) {
      console.log('❌ No user found in request');
      return res.status(403).json({ message: 'Korisničke dozvole nisu pronađene. Molimo prijavite se ponovo.' });
    }

    // For /api/users/profile endpoint, user can always update their own profile
    if (req.path === '/api/users/profile') {
      console.log('✅ Profile endpoint - user can update their own profile');
      next();
      return;
    }

    // For /api/users/:id endpoints, check if user is updating their own profile or is admin
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    console.log('🔍 Checking permissions:', {
      targetUserId,
      currentUserId,
      userRole,
      isOwnProfile: targetUserId === currentUserId,
      isAdmin: ['admin', 'super_admin'].includes(userRole)
    });

    // Allow if user is updating their own profile
    if (targetUserId === currentUserId) {
      next();
      return;
    }

    // Allow if user is admin or super_admin
    if (['admin', 'super_admin'].includes(userRole)) {
      next();
      return;
    }

    // Deny access
    res.status(403).json({ message: 'Možete ažurirati samo svoj profil. Za ažuriranje drugih profila potrebne su administratorske dozvole.' });
  } catch (error) {
    console.error('Error in canUpdateProfile middleware:', error);
    res.status(500).json({ message: 'Greška pri provjeri dozvola. Molimo pokušajte ponovo.' });
  }
};

// MongoDB Connection - automatski odabir baze na osnovu NODE_ENV
const isDevelopment = process.env.NODE_ENV === 'development';
const MONGODB_URI = isDevelopment 
  ? (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja')
  : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja');

console.log('Starting server setup...');
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
console.log(`MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");
    
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja',
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log("✅ Connected to MongoDB");
    logger.info('Connected to MongoDB Database: Predavanja');
    logger.info('MongoDB connection state:', mongoose.connection.readyState);
    
    await createDatabaseIndexes();
    
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    logger.error('Could not connect to MongoDB:', err);
    process.exit(1); // zaustavi aplikaciju
  }
};

const createDatabaseIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    const lecturesCollection = db.collection('lectures');
    await lecturesCollection.createIndex({ status: 1, date: 1 }, { background: true });
    await lecturesCollection.createIndex({ status: 1 }, { background: true });
    await lecturesCollection.createIndex({ date: 1 }, { background: true });
    await lecturesCollection.createIndex({ createdBy: 1 }, { background: true });
    await lecturesCollection.createIndex({ daija: 1 }, { background: true });
    await lecturesCollection.createIndex({ organizationId: 1 }, { background: true });
    await lecturesCollection.createIndex({ status: 1, createdAt: -1 }, { background: true });
    
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { background: true, unique: true, sparse: true });
    await usersCollection.createIndex({ username: 1 }, { background: true, unique: true });
    await usersCollection.createIndex({ role: 1 }, { background: true });
    
    const daijeCollection = db.collection('daijas');
    await daijeCollection.createIndex({ status: 1 }, { background: true });
    await daijeCollection.createIndex({ firstName: 1 }, { background: true });
    await daijeCollection.createIndex({ status: 1, firstName: 1 }, { background: true });
    
    const organizationsCollection = db.collection('organizations');
    await organizationsCollection.createIndex({ status: 1 }, { background: true });
    await organizationsCollection.createIndex({ name: 1 }, { background: true });
    await organizationsCollection.createIndex({ status: 1, name: 1 }, { background: true });
    
    logger.info('Database performance indexes created');
  } catch (error) {
    logger.error('Error creating database indexes:', error);
  }
};

// Pokretanje aplikacije
(async () => {
  try {
    // Memory monitoring
    const memoryCheckInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);
      
      logger.info(`Memory Usage - Heap: ${heapUsedMB}/${heapTotalMB} MB, RSS: ${rssMB} MB`);
      
      // Alert if memory usage is too high
      if (heapUsedMB > 1024) { // Alert if heap usage exceeds 1GB
        logger.warn(`⚠️ High memory usage detected: ${heapUsedMB} MB`);
      }
    }, 60000); // Check every minute
    // Prvo se konektuj na MongoDB
    await connectDB();
    
    // Zatim pokreni Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${PORT}`);
      logger.info(`Server started on port ${PORT}`);
    });

    // Global error handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      console.error('❌ Uncaught Exception:', error);
      // Give the server time to log the error before shutting down
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit the process for unhandled rejections, just log them
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    server.on('error', (err) => {
      logger.error('Server error:', err);
    });

  } catch (err) {
    console.error("❌ Failed to start application:", err.message);
    process.exit(1);
  }
})();

mongoose.connection.on('error', err => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Routes
// Get all lectures
app.get('/api/lectures', async (req, res) => {
  try {
    logger.info('Fetching lectures for user:', {
      userId: req.user?.id,
      role: req.user?.role
    });

    const lectures = await Lecture.find()
      .populate('organization', 'name')
      .populate('daija', 'name title image')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    logger.info(`Found ${lectures.length} lectures:`,
      lectures.map(l => ({ id: l._id, title: l.title, status: l.status }))
    );

    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null
    }));

    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju predavanja' });
  }
});

// Get all rejected lectures
app.get('/api/lectures/rejected', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Fetching rejected lectures for user:', {
      id: req.user.id,
      role: req.user.role
    });
    
    const lectures = await Lecture.find({ status: 'rejected' })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    logger.info(`Found ${lectures.length} rejected lectures:`, 
      lectures.map(l => ({ id: l._id, title: l.title, status: l.status, createdBy: l.createdBy?.firstName }))
    );
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching rejected lectures:', error);
    res.status(500).json({ message: error.message });
  }
});

// Dashboard endpoint - returns all lectures for admin dashboard (public access)
app.get('/api/lectures/dashboard/public', async (req, res) => {
  try {
    logger.info('Fetching dashboard lectures');
    
    const lectures = await Lecture.find({ 
      status: 'approved'
      // No date filtering - show all lectures for dashboard
    })
      .populate('organization', 'name')
      .populate('daija', 'name title image')
      .sort({ date: 1 });

    logger.info(`Found ${lectures.length} dashboard lectures`);
    
    // Transform lectures to include daijaId and speaker for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija ? lecture.daija._id : null,
      speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač'
    }));

    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching dashboard lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju predavanja za dashboard' });
  }
});

// Admin users endpoint - protected for admin access
app.get('/api/users', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Fetching users for admin dashboard');
    
    const users = await User.find({}, '-password -securityAnswer')
      .sort({ createdAt: -1 });

    logger.info(`Found ${users.length} users for admin dashboard`);
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users for admin:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju korisnika' });
  }
});

// Admin create user endpoint - protected for admin access
app.post('/api/users', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    logger.info('Creating new user via admin dashboard:', {
      username,
      email,
      role,
      requestedBy: req.user.username
    });

    // Validation
    const errors = [];
    
    if (!username || !username.trim()) {
      errors.push('Korisničko ime je obavezno');
    } else if (username.trim().length < 2) {
      errors.push('Korisničko ime mora imati najmanje 2 karaktera');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errors.push('Korisničko ime može sadržavati samo slova, brojeve i podvlaku');
    }

    if (!email || !email.trim()) {
      errors.push('Email je obavezan');
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.push('Email format nije ispravan');
    }

    if (!password || !password.trim()) {
      errors.push('Lozinka je obavezna');
    } else if (password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }

    const validRoles = ['user', 'admin', 'super_admin'];
    if (role && !validRoles.includes(role)) {
      errors.push('Nevaljan tip korisnika');
    }

    // Only super_admin can create admin or super_admin users
    if ((role === 'admin' || role === 'super_admin') && req.user.role !== 'super_admin') {
      errors.push('Nemate dozvolu za kreiranje admin korisnika');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: username.trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Korisnik sa ovim emailom ili korisničkim imenom već postoji' 
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      securityQuestionIndex: 0, // Default security question
      securityAnswer: 'admin-created' // Default answer for admin-created users
    };

    const user = new User(userData);
    const savedUser = await user.save();

    // Remove sensitive data from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.securityAnswer;

    logger.info('New user created successfully via admin dashboard:', {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role
    });

    res.status(201).json(userResponse);
  } catch (error) {
    logger.error('Error creating user via admin dashboard:', error);
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Korisnik sa ovim emailom ili korisničkim imenom već postoji' 
      });
    } else {
      res.status(500).json({ message: 'Greška pri kreiranju korisnika' });
    }
  }
});

// Public users endpoint for dashboard
app.get('/api/users/public', async (req, res) => {
  try {
    logger.info('Fetching public users for dashboard');
    
    const users = await User.find({}, '-password -securityAnswer')
      .sort({ createdAt: -1 });

    logger.info(`Found ${users.length} users for dashboard`);
    res.json(users);
  } catch (error) {
    logger.error('Error fetching public users:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju korisnika' });
  }
});

// Public daije endpoint for dashboard
app.get('/api/daije/public', async (req, res) => {
  try {
    logger.info('Fetching public daije for dashboard');
    
    // Always return only approved daije for public endpoint (even for admins)
    // Admins can use /api/admin/daije to get all daije including pending/rejected
    const daije = await Daija.find({ status: 'approved' }).sort({ name: 1 });
    
    logger.info(`Found ${daije.length} approved daije for public endpoint`);
    
    // Add lecture count for each daija
    const daijeWithLectureCount = await Promise.all(
      daije.map(async (daija) => {
        // Count approved lectures for this daija
        const lectureCount = await Lecture.countDocuments({ 
          daija: daija._id, 
          status: 'approved' 
        });
        
        return {
          ...daija.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    // Return daije with lecture counts
    res.json(daijeWithLectureCount);
  } catch (error) {
    logger.error('Error fetching public daije:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija' });
  }
});

// Public organizations endpoint for dashboard
app.get('/api/organizations/public', async (req, res) => {
  try {
    logger.info('Fetching public organizations for dashboard');
    
    // Always return only approved organizations for public endpoint (even for admins)
    // Admins can use /api/admin/organizations to get all organizations including pending/rejected
    const organizations = await Organization.find({ status: 'approved' }).sort({ name: 1 });
    
    // Add lecture count for each organization
    const organizationsWithLectureCount = await Promise.all(
      organizations.map(async (organization) => {
        // Count approved lectures for this organization
        const lectureCount = await Lecture.countDocuments({ 
          organizationId: organization._id, 
          status: 'approved' 
        });
        
        return {
          ...organization.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    res.json(organizationsWithLectureCount);
  } catch (error) {
    logger.error('Error fetching public organizations:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju organizacija' });
  }
});

// Public settings endpoint for dashboard
app.get('/api/settings/public', async (req, res) => {
  try {
    logger.info('Fetching public settings for dashboard');
    
    // Try to find approval settings in the database
    const approvalSettingsDoc = await Settings.findOne({ key: 'approvalSettings' });
    
    const defaultSettings = {
      lecture: true,
      daija: true,
      organization: true
    };
    
    const settings = {
      approvalSettings: approvalSettingsDoc ? approvalSettingsDoc.value : defaultSettings
    };
    
    logger.info('Found settings for dashboard:', settings);
    res.json(settings);
  } catch (error) {
    logger.error('Error fetching public settings:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvaćanju postavki',
      approvalSettings: {
        lecture: true,
        daija: true,
        organization: true
      }
    });
  }
});

// PUT endpoint for saving approval settings
app.put('/api/settings/approval-settings', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Saving approval settings:', req.body);
    
    // Update or create the approval settings document
    const settings = await Settings.findOneAndUpdate(
      { key: 'approvalSettings' },
      { 
        key: 'approvalSettings',
        value: req.body,
        description: 'Approval settings for lectures, daije, and organizations'
      },
      { 
        new: true, 
        upsert: true 
      }
    );
    
    logger.info('Approval settings saved successfully:', settings);
    res.json({ 
      message: 'Postavke odobrenja su uspješno spremljene',
      approvalSettings: settings.value 
    });
  } catch (error) {
    logger.error('Error saving approval settings:', error);
    res.status(500).json({ 
      message: 'Greška pri spremanju postavki odobrenja'
    });
  }
});

// Public suggestions endpoint for dashboard
app.get('/api/suggestions/public', async (req, res) => {
  try {
    logger.info('Fetching public suggestions for dashboard');
    
    const suggestions = await Suggestion.find({ status: { $ne: 'archived' } })
      .sort({ createdAt: -1 });
    
    logger.info(`Found ${suggestions.length} suggestions for dashboard`);
    res.json(suggestions);
  } catch (error) {
    logger.error('Error fetching public suggestions:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju prijedloga' });
  }
});

// Public archived suggestions endpoint for dashboard
app.get('/api/suggestions/archived/public', async (req, res) => {
  try {
    logger.info('Fetching public archived suggestions for dashboard');
    
    const archivedSuggestions = await Suggestion.find({ status: 'archived' })
      .sort({ createdAt: -1 });
    
    logger.info(`Found ${archivedSuggestions.length} archived suggestions for dashboard`);
    res.json(archivedSuggestions);
  } catch (error) {
    logger.error('Error fetching public archived suggestions:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju arhiviranih prijedloga' });
  }
});

// Public suggestions count endpoint for dashboard
app.get('/api/suggestions/count/public', async (req, res) => {
  try {
    logger.info('Fetching public suggestions count for dashboard');
    
    const total = await Suggestion.countDocuments();
    const pending = await Suggestion.countDocuments({ status: 'pending' });
    const approved = await Suggestion.countDocuments({ status: 'approved' });
    const rejected = await Suggestion.countDocuments({ status: 'rejected' });
    
    const count = { total, pending, approved, rejected };
    
    logger.info('Found suggestions count for dashboard:', count);
    res.json(count);
  } catch (error) {
    logger.error('Error fetching public suggestions count:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvaćanju broja prijedloga',
      total: 0, 
      pending: 0, 
      approved: 0, 
      rejected: 0 
    });
  }
});

// Create new suggestion endpoint (public - no authentication required)
app.post('/api/suggestions', async (req, res) => {
  try {
    logger.info('Creating new suggestion:', req.body);
    
    const { title, description, referenceType, referenceId } = req.body;
    
    // Validation
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Opis prijedloga je obavezan' });
    }
    
    // Map frontend types to backend types
    let targetType = 'general';
    let targetName = 'Općeniti prijedlog';
    let targetId = null;
    
    if (referenceType && referenceId) {
      switch (referenceType) {
        case 'daija':
          targetType = 'daija';
          // Try to fetch daija name
          try {
            const daija = await Daija.findById(referenceId);
            if (daija) {
              targetName = daija.name || 'Nepoznat daija';
              targetId = referenceId;
            }
          } catch (error) {
            logger.warn('Could not fetch daija for suggestion:', error);
          }
          break;
        case 'udruženje':
        case 'organization':
          targetType = 'organization';
          // Try to fetch organization name
          try {
            const organization = await Organization.findById(referenceId);
            if (organization) {
              targetName = organization.name || 'Nepoznato udruženje';
              targetId = referenceId;
            }
          } catch (error) {
            logger.warn('Could not fetch organization for suggestion:', error);
          }
          break;
        case 'stranica':
          targetType = 'general';
          targetName = 'Stranica';
          break;
        case 'općenito':
        default:
          targetType = 'general';
          targetName = 'Općeniti prijedlog';
          break;
      }
    }
    
    // Get user info if authenticated
    let submittedBy = null;
    let submitterName = null;
    let submitterEmail = null;
    
    // Check if user is authenticated (optional)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        submittedBy = decoded.id;
        
        // Get user details
        const user = await User.findById(decoded.id);
        if (user) {
          submitterName = user.username;
          submitterEmail = user.email;
        }
      } catch (error) {
        // Token invalid, but that's okay for suggestions
        logger.info('Invalid token for suggestion, proceeding as anonymous');
      }
    }
    
    const suggestionData = {
      targetType,
      targetId,
      targetName,
      suggestedChanges: {
        description: description.trim(),
        title: title?.trim() || null
      },
      reason: description.trim(),
      submittedBy,
      submitterName,
      submitterEmail,
      status: 'pending'
    };
    
    logger.info('Creating suggestion with data:', suggestionData);
    const suggestion = new Suggestion(suggestionData);
    
    const savedSuggestion = await suggestion.save();
    logger.info('New suggestion saved successfully:', {
      id: savedSuggestion._id,
      targetType: savedSuggestion.targetType,
      targetName: savedSuggestion.targetName
    });
    
    res.status(201).json(savedSuggestion);
  } catch (error) {
    logger.error('Error creating suggestion:', error);
    res.status(400).json({ message: error.message || 'Greška pri kreiranju prijedloga' });
  }
});

// Update suggestion status (admin only)
app.patch('/api/suggestions/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating suggestion status:', { id: req.params.id, body: req.body });
    
    const { status, reviewNote } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Nevaljan status' });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (reviewNote) updateData.reviewNote = reviewNote;
    
    // Add review info
    updateData.reviewedBy = req.user.id;
    updateData.reviewedAt = new Date();
    
    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Prijedlog nije pronađen' });
    }
    
    logger.info('Suggestion updated successfully:', {
      id: suggestion._id,
      status: suggestion.status,
      reviewedBy: req.user.username
    });
    
    res.json(suggestion);
  } catch (error) {
    logger.error('Error updating suggestion:', error);
    res.status(400).json({ message: error.message || 'Greška pri ažuriranju prijedloga' });
  }
});

// Delete suggestion (admin only)
app.delete('/api/suggestions/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Deleting suggestion:', { id: req.params.id, user: req.user.username });
    
    const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Prijedlog nije pronađen' });
    }
    
    logger.info('Suggestion deleted successfully:', {
      id: req.params.id,
      targetType: suggestion.targetType,
      deletedBy: req.user.username
    });
    
    res.json({ message: 'Prijedlog je uspješno obrisan' });
  } catch (error) {
    logger.error('Error deleting suggestion:', error);
    res.status(400).json({ message: error.message || 'Greška pri brisanju prijedloga' });
  }
});

// Make lectures endpoint public (remove authentication requirement)
app.get('/api/lectures/public', async (req, res) => {
  const startTime = Date.now();
  console.log('🚀 [PERFORMANCE] /api/lectures/public endpoint called at:', new Date().toISOString());
  
  try {
    logger.info('Fetching public lectures');
    
    // Debug: Database connection state
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    console.log(`📊 [PERFORMANCE] Database state: ${dbStates[dbState]} (${dbState})`);
    
    if (dbState !== 1) {
      console.error('❌ [PERFORMANCE] Database not connected! State:', dbStates[dbState]);
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Debug: Start query timing
    const queryStartTime = Date.now();
    console.log('🔍 [PERFORMANCE] Starting super-optimized database query...');
    
    // 🚀 SUPER-OPTIMIZED QUERY with forced index usage and minimal data transfer
    
    // Method 1: Try with hint to force index usage
    let lectures;
    try {
      lectures = await Lecture.find({ 
        status: 'approved'
        // Removed date filter to show all lectures including past ones
      })
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
        .populate('organization', 'name')
        .populate('daija', 'name title image')
        .hint({ status: 1, date: 1 }) // 🚀 Force index usage
        .lean()
        .exec();
      
      console.log('✅ [PERFORMANCE] Used hint-forced query');
    } catch (hintError) {
      console.log('⚠️ [PERFORMANCE] Hint failed, falling back to regular query:', hintError.message);
      
      // Fallback: Regular optimized query
      lectures = await Lecture.find({ 
        status: 'approved'
        // Removed date filter to show all lectures including past ones
      })
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
        .populate('organization', 'name')
        .populate('daija', 'name title image')
        .lean()
        .exec();
    }

    const queryEndTime = Date.now();
    const queryDuration = queryEndTime - queryStartTime;
    console.log(`⚡ [PERFORMANCE] Super-optimized database query completed in: ${queryDuration}ms`);
    console.log(`📊 [PERFORMANCE] Found ${lectures.length} public lectures`);

    logger.info(`Found ${lectures.length} public lectures`);
    
    // Debug: Start transformation timing
    const transformStartTime = Date.now();
    console.log('🔄 [PERFORMANCE] Starting lightning-fast data transformation...');
    
    // 🚀 LIGHTNING-FAST transformation - pre-allocate array for better performance
    const transformedLectures = new Array(lectures.length);
    for (let i = 0; i < lectures.length; i++) {
      const lecture = lectures[i];
      transformedLectures[i] = {
        ...lecture,
        daijaId: lecture.daija?._id || lecture.daija || null,
        speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker || 'Nepoznat daija'
      };
    }

    const transformEndTime = Date.now();
    const transformDuration = transformEndTime - transformStartTime;
    console.log(`⚡ [PERFORMANCE] Lightning-fast data transformation completed in: ${transformDuration}ms`);
    
    // 🚀 CUSTOM SORTING: Future lectures first (ascending date), then past lectures (descending date)
    const sortStartTime = Date.now();
    console.log('📅 [PERFORMANCE] Starting custom date-based sorting...');
    
    const now = new Date();
    const futureLectures = [];
    const pastLectures = [];
    
    // Separate future and past lectures
    for (let i = 0; i < transformedLectures.length; i++) {
      const lecture = transformedLectures[i];
      const lectureDate = new Date(lecture.date);
      
      if (lectureDate >= now) {
        futureLectures.push(lecture);
      } else {
        pastLectures.push(lecture);
      }
    }
    
    // Sort future lectures by date ascending (earliest first)
    futureLectures.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sort past lectures by date descending (most recent first)
    pastLectures.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Combine: future lectures first, then past lectures
    const sortedLectures = [...futureLectures, ...pastLectures];
    
    const sortEndTime = Date.now();
    const sortDuration = sortEndTime - sortStartTime;
    console.log(`📅 [PERFORMANCE] Custom sorting completed in: ${sortDuration}ms`);
    console.log(`📊 [PERFORMANCE] Future lectures: ${futureLectures.length}, Past lectures: ${pastLectures.length}`);
    
    // Debug: Total endpoint timing
    const totalEndTime = Date.now();
    const totalDuration = totalEndTime - startTime;
    
    console.log('📈 [PERFORMANCE] Super-optimized endpoint timing breakdown:');
    console.log(`  - Database query: ${queryDuration}ms (${((queryDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Data transformation: ${transformDuration}ms (${((transformDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Custom sorting: ${sortDuration}ms (${((sortDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Total endpoint time: ${totalDuration}ms`);
    
    // Performance improvement metrics
    const performanceGrade = totalDuration < 50 ? 'EXCELLENT' : 
                           totalDuration < 100 ? 'VERY_GOOD' :
                           totalDuration < 300 ? 'GOOD' : 
                           totalDuration < 500 ? 'MODERATE' : 'SLOW';
    
    console.log(`🎯 [PERFORMANCE] Performance grade: ${performanceGrade} (${totalDuration}ms)`);
    
    // Add performance headers
    res.set({
      'X-Query-Time': `${queryDuration}ms`,
      'X-Transform-Time': `${transformDuration}ms`,
      'X-Sort-Time': `${sortDuration}ms`,
      'X-Total-Time': `${totalDuration}ms`,
      'X-Lecture-Count': lectures.length,
      'X-Future-Count': futureLectures.length,
      'X-Past-Count': pastLectures.length,
      'X-Performance-Grade': performanceGrade,
      'X-Optimized': 'super-optimized-with-custom-sort',
      'X-Index-Hint': 'forced'
    });

    res.json(sortedLectures);
  } catch (error) {
    const errorTime = Date.now();
    const errorDuration = errorTime - startTime;
    
    console.error('❌ [PERFORMANCE] Error in super-optimized /api/lectures/public after:', errorDuration + 'ms');
    console.error('❌ [PERFORMANCE] Error details:', error.message);
    console.error('❌ [PERFORMANCE] Error stack:', error.stack);
    
    logger.error('Error fetching public lectures:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvaćanju javnih predavanja',
      debug: {
        duration: errorDuration + 'ms',
        error: error.message,
        optimized: 'super-optimized'
      }
    });
  }
});

// Get single lecture by ID
app.get('/api/lectures/:id', async (req, res) => {
  try {
    logger.info('Fetching lecture by ID:', req.params.id);
    
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('Invalid lecture ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid lecture ID format' });
    }
    
    const lecture = await Lecture.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('daija', 'name title image');
    
    if (!lecture) {
      logger.warn('Lecture not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    logger.info('Found lecture:', { 
      id: lecture._id, 
      title: lecture.title, 
      createdBy: lecture.createdBy?.firstName 
    });
    
    // Transform lecture to include daijaId for frontend compatibility
    const transformedLecture = {
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker || 'Nepoznat daija'
    };
    
    res.json(transformedLecture);
  } catch (error) {
    logger.error('Error fetching lecture by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get lectures by daija ID
app.get('/api/lectures/daija/:daijaId', async (req, res) => {
  try {
    logger.info('Fetching lectures by daija ID:', req.params.daijaId);
    const lectures = await Lecture.find({ 
      daija: req.params.daijaId,
      status: 'approved'  // Only show approved lectures to public
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('daija', 'name title image');
    logger.info(`Found ${lectures.length} approved lectures for daija:`, req.params.daijaId);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker || 'Nepoznat daija'
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching lectures by daija ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get lectures by organization ID
app.get('/api/lectures/organization/:organizationId', async (req, res) => {
  try {
    logger.info('Fetching lectures by organization ID:', req.params.organizationId);
    const lectures = await Lecture.find({ 
      organizationId: req.params.organizationId,
      status: 'approved'  // Only show approved lectures to public
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('daija', 'name title image');
    logger.info(`Found ${lectures.length} approved lectures for organization:`, req.params.organizationId);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker || 'Nepoznat daija'
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching lectures by organization ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all lectures pending approval
app.get('/api/lectures/pending', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    logger.info('Fetching pending lectures for user:', {
      id: req.user.id,
      role: req.user.role,
      page,
      limit
    });
    
    const lectures = await Lecture.find({ status: 'pending' })
      .populate('createdBy', 'firstName lastName email')
      .populate('daija', 'name title image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Lecture.countDocuments({ status: 'pending' });
    
    logger.info(`Found ${lectures.length} pending lectures (page ${page}/${Math.ceil(total/limit)}):`, 
      lectures.map(l => ({ id: l._id, title: l.title, status: l.status, createdBy: l.createdBy?.firstName }))
    );
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json({
      lectures: transformedLectures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching pending lectures:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all approved lectures (public access with pagination)
app.get('/api/lectures/approved', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    logger.info('Fetching approved lectures with pagination:', { page, limit, skip });
    
    const currentDate = new Date();
    const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const lectures = await Lecture.find({ 
      status: 'approved',
      date: { $gte: startOfToday }  // Include today's lectures and future ones
    })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
      .populate('organization', 'name')
      .populate('daija', 'name title image')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    
    const total = await Lecture.countDocuments({ 
      status: 'approved',
      date: { $gte: startOfToday }
    });
    
    logger.info(`Found ${lectures.length} approved lectures (page ${page}/${Math.ceil(total/limit)})`);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture,
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker || 'Nepoznat daija'
    }));
    
    res.json({
      lectures: transformedLectures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching approved lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju odobrenih predavanja' });
  }
});

// Get latest lectures (public access)
app.get('/api/lectures/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    logger.info('Fetching latest lectures with limit:', limit);
    
    const currentDate = new Date();
    const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const lectures = await Lecture.find({ 
      status: 'approved',
      date: { $gte: startOfToday }  // Include today's lectures and future ones
    })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
      .populate('organization', 'name')
      .populate('daija', 'name title image')
      .sort({ date: 1 })
      .limit(limit)
      .lean()
      .exec();
    
    logger.info(`Found ${lectures.length} latest lectures`);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture,
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker || 'Nepoznat daija'
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching latest lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju najnovijih predavanja' });
  }
});

// Add new lecture
app.post('/api/lectures', authenticateToken, async (req, res) => {
  try {
    logger.info('Adding new lecture - Request body:', {
      body: req.body,
      user: req.user
    });

    const requiredFields = ['title', 'date', 'time', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.warn('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Get approval settings
    const approvalSettings = await Settings.findOne({ key: 'approvalSettings' });
    const needsApproval = approvalSettings?.value?.lecture !== false; // Default to true if setting not found
    
    // Only allow admin/super_admin to explicitly set status, otherwise use approval settings
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const finalStatus = (isAdminUser && req.body.status) ? req.body.status : (needsApproval ? 'pending' : 'approved');
    
    // Parse date from DD.MM.YYYY format if needed
    let parsedDate = req.body.date;
    if (typeof req.body.date === 'string' && req.body.date.includes('.')) {
      const [day, month, year] = req.body.date.split('.');
      parsedDate = new Date(year, month - 1, day);
    } else if (typeof req.body.date === 'string') {
      parsedDate = new Date(req.body.date);
    }

    let lectureData = {
      title: req.body.title,
      speaker: req.body.speaker || '',
      daija: req.body.daijaId || null,
      organization: req.body.organization,
      organizationId: req.body.organizationId || null,
      date: parsedDate,
      time: req.body.time,
      address: req.body.address,
      city: req.body.city,
      shortDescription: req.body.shortDescription || '',
      description: req.body.description || '',
      image: req.body.image,
      status: finalStatus,
      createdBy: req.user.id
    };
    
    logger.info('Using approval settings:', { 
      needsApproval,
      setting: approvalSettings?.value?.lecture,
      isAdminUser,
      requestedStatus: req.body.status,
      finalStatus: lectureData.status 
    });
    
    logger.info('Creating lecture with data:', lectureData);
    const lecture = new Lecture(lectureData);
    
    const savedLecture = await lecture.save();
    logger.info('New lecture saved successfully:', {
      id: savedLecture._id,
      title: savedLecture.title,
      date: savedLecture.date,
      createdBy: savedLecture.createdBy
    });
    
    // Transform response to include daijaId for frontend compatibility
    const responseData = {
      ...savedLecture.toObject(),
      daijaId: savedLecture.daija || null
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    logger.error('Error adding lecture:', error);
    res.status(400).json({ message: error.message });
  }
  });

// Add new lecture
app.post('/api/lectures', authenticateToken, async (req, res) => {
  try {
    logger.info('Adding new lecture - Request body:', {
      body: req.body,
      user: req.user
    });

    const requiredFields = ['title', 'date', 'time', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.warn('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Get approval settings
    const approvalSettings = await Settings.findOne({ key: 'approvalSettings' });
    const needsApproval = approvalSettings?.value?.lecture !== false; // Default to true if setting not found
    
    // Only allow admin/super_admin to explicitly set status, otherwise use approval settings
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const finalStatus = (isAdminUser && req.body.status) ? req.body.status : (needsApproval ? 'pending' : 'approved');
    
    // Parse date from DD.MM.YYYY format if needed
    let parsedDate = req.body.date;
    if (typeof req.body.date === 'string' && req.body.date.includes('.')) {
      const [day, month, year] = req.body.date.split('.');
      parsedDate = new Date(year, month - 1, day);
    } else if (typeof req.body.date === 'string') {
      parsedDate = new Date(req.body.date);
    }

    let lectureData = {
      title: req.body.title,
      speaker: req.body.speaker || '',
      daija: req.body.daijaId || null,
      organization: req.body.organization,
      organizationId: req.body.organizationId || null,
      date: parsedDate,
      time: req.body.time,
      address: req.body.address,
      city: req.body.city,
      shortDescription: req.body.shortDescription || '',
      description: req.body.description || '',
      image: req.body.image,
      status: finalStatus,
      createdBy: req.user.id
    };
    
    logger.info('Using approval settings:', { 
      needsApproval,
      setting: approvalSettings?.value?.lecture,
      isAdminUser,
      requestedStatus: req.body.status,
      finalStatus: lectureData.status 
    });
    
    logger.info('Creating lecture with data:', lectureData);
    const lecture = new Lecture(lectureData);
    
    const savedLecture = await lecture.save();
    logger.info('New lecture saved successfully:', {
      id: savedLecture._id,
      title: savedLecture.title,
      date: savedLecture.date,
      createdBy: savedLecture.createdBy
    });
    
    // Transform response to include daijaId for frontend compatibility
    const responseData = {
      ...savedLecture.toObject(),
      daijaId: savedLecture.daija || null
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    logger.error('Error adding lecture:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add new lecture - PUBLIC endpoint (no authentication required)
app.post('/api/lectures/public', async (req, res) => {
  try {
    logger.info('Adding new lecture via public endpoint - Request body:', {
      body: req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const requiredFields = ['title', 'date', 'time', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.warn('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Nedostaju obavezna polja', 
        fields: missingFields 
      });
    }
    
    // Parse date from DD.MM.YYYY format if needed
    let parsedDate = req.body.date;
    if (typeof req.body.date === 'string' && req.body.date.includes('.')) {
      const [day, month, year] = req.body.date.split('.');
      parsedDate = new Date(year, month - 1, day);
    } else if (typeof req.body.date === 'string') {
      parsedDate = new Date(req.body.date);
    }

    // Public submissions always go to pending status for approval
    let lectureData = {
      title: req.body.title,
      speaker: req.body.speaker || '',
      daija: req.body.daijaId || null,
      organization: req.body.organization,
      organizationId: req.body.organizationId || null,
      date: parsedDate,
      time: req.body.time,
      address: req.body.address,
      city: req.body.city,
      shortDescription: req.body.shortDescription || '',
      description: req.body.description || '',
      image: req.body.image || '/uploads/images/predavanjeslika.jpg', // Default image
      status: 'pending', // Always pending for public submissions
      createdBy: null // No user associated with public submissions
    };
    
    logger.info('Creating public lecture with data:', lectureData);
    const lecture = new Lecture(lectureData);
    
    const savedLecture = await lecture.save();
    logger.info('New public lecture saved successfully:', {
      id: savedLecture._id,
      title: savedLecture.title,
      date: savedLecture.date,
      status: savedLecture.status
    });
    
    // Transform response to include daijaId for frontend compatibility
    const responseData = {
      ...savedLecture.toObject(),
      daijaId: savedLecture.daija || null
    };
    
    res.status(201).json({
      ...responseData,
      message: 'Predavanje je uspešno poslato na odobravanje. Biće objavljeno nakon što ga administrator odobri.'
    });
  } catch (error) {
    logger.error('Error adding public lecture:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update lecture
app.put('/api/lectures/:id', authenticateToken, async (req, res) => {
  try {
    const requiredFields = ['title', 'date', 'time', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Prvo pronađi predavanje da proveris vlasništvo
    const existingLecture = await Lecture.findById(req.params.id);
    if (!existingLecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    // Provjeri da li korisnik može da edituje predavanje
    const canEdit = req.user.role === 'super_admin' || 
                   req.user.role === 'admin' || 
                   existingLecture.createdBy.toString() === req.user.id;

    if (!canEdit) {
      return res.status(403).json({ 
        message: 'Nemate dozvolu za uređivanje ovog predavanja' 
      });
    }

    // Parse date from DD.MM.YYYY format if needed
    let parsedDate = req.body.date;
    if (req.body.date && typeof req.body.date === 'string' && req.body.date.includes('.')) {
      const [day, month, year] = req.body.date.split('.');
      parsedDate = new Date(year, month - 1, day);
    } else if (req.body.date && typeof req.body.date === 'string') {
      parsedDate = new Date(req.body.date);
    }

    // Map frontend field names to model field names
    let updateData = {
      ...req.body,
      daija: req.body.daijaId || null,
      organizationId: req.body.organizationId || null
    };

    // Update date if provided
    if (req.body.date) {
      updateData.date = parsedDate;
    }
    
    // Remove daijaId from update data as it's not a model field
    delete updateData.daijaId;
    // Ne dozvoljavamo mijenjanje createdBy polja
    delete updateData.createdBy;

    const lecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Lecture updated:', { 
      id: lecture._id, 
      title: lecture.title,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    // Transform response to include daijaId for frontend compatibility
    const responseData = {
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    };
    
    res.json(responseData);
  } catch (error) {
    logger.error('Error updating lecture:', error);
    res.status(400).json({ message: error.message });
  }
});

// Patch lecture (partial update, e.g., status only)
app.patch('/api/lectures/:id', authenticateToken, async (req, res) => {
  try {
    // Prvo pronađi predavanje da proveris vlasništvo (osim za admin operacije)
    const existingLecture = await Lecture.findById(req.params.id);
    if (!existingLecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    // Za status promjene, samo admin/super_admin mogu
    if (req.body.status && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Nemate dozvolu za mijenjanje statusa predavanja' 
      });
    }

    // Za ostale promjene, provjeri vlasništvo
    const isStatusOnlyUpdate = Object.keys(req.body).length === 1 && req.body.status;
    if (!isStatusOnlyUpdate) {
      const canEdit = req.user.role === 'super_admin' || 
                     req.user.role === 'admin' || 
                     existingLecture.createdBy.toString() === req.user.id;

      if (!canEdit) {
        return res.status(403).json({ 
          message: 'Nemate dozvolu za uređivanje ovog predavanja' 
        });
      }
    }

    // Parse date from DD.MM.YYYY format if needed
    let parsedDate = req.body.date;
    if (req.body.date && typeof req.body.date === 'string' && req.body.date.includes('.')) {
      const [day, month, year] = req.body.date.split('.');
      parsedDate = new Date(year, month - 1, day);
    } else if (req.body.date && typeof req.body.date === 'string') {
      parsedDate = new Date(req.body.date);
    }

    // Map frontend field names to model field names if needed
    const updateData = { ...req.body };
    if (req.body.daijaId !== undefined) {
      updateData.daija = req.body.daijaId;
      delete updateData.daijaId;
    }
    
    // Update date if provided
    if (req.body.date) {
      updateData.date = parsedDate;
    }
    // Ne dozvoljavamo mijenjanje createdBy polja
    delete updateData.createdBy;
    
    const lecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Lecture patched:', { 
      id: lecture._id, 
      updates: Object.keys(req.body),
      patchedBy: req.user.id,
      userRole: req.user.role
    });
    
    // Transform response to include daijaId for frontend compatibility
    const responseData = {
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    };
    
    res.json(responseData);
  } catch (error) {
    logger.error('Error patching lecture:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete lecture (Admin or Super Admin)
app.delete('/api/lectures/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    logger.info('Lecture deleted:', { id: req.params.id, title: lecture.title });
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    logger.error('Error deleting lecture:', error);
    res.status(500).json({ message: error.message });
  }
});

// Daije Routes
// Get all daije with active lectures
app.get('/api/daije/with-active-lectures', async (req, res) => {
  try {
    logger.info('Fetching daije with active lectures');
    
    // Get all daije
    const daije = await Daija.find().sort({ name: 1 });
    
    // For each daija, get their active lectures
    const daijeWithLectures = await Promise.all(
      daije.map(async (daija) => {
        const lectures = await Lecture.find({ 
          daija: daija._id, 
          status: 'approved',
          date: { $gte: new Date() } // Only future lectures
        }).sort({ date: 1 });
        
        return {
          ...daija.toObject(),
          lectures: lectures.map(lecture => ({
            ...lecture.toObject(),
            daijaId: lecture.daija || null
          }))
        };
      })
    );
    
    logger.info(`Found ${daijeWithLectures.length} daije with lectures`);
    res.json(daijeWithLectures);
  } catch (error) {
    logger.error('Error fetching daije with active lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija sa predavanjima' });
  }
});

// Get all daije
app.get('/api/daije', async (req, res) => {
  try {
    logger.info('Fetching all daije');
    const daije = await Daija.find({ status: 'approved' }).sort({ name: 1 });
    logger.info(`Found ${daije.length} approved daije`);
    
    // Add lecture count for each daija
    const daijeWithLectureCount = await Promise.all(
      daije.map(async (daija) => {
        // Count approved lectures for this daija
        const lectureCount = await Lecture.countDocuments({ 
          daija: daija._id, 
          status: 'approved' 
        });
        
        return {
          ...daija.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    logger.info(`Processed ${daijeWithLectureCount.length} daije with lecture counts`);
    res.json(daijeWithLectureCount);
  } catch (error) {
    logger.error('Error fetching daije:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija' });
  }
});

// Get single daija by ID
app.get('/api/daije/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid daija ID format' });
    }
    
    logger.info('Fetching daija by ID:', req.params.id);
    const daija = await Daija.findById(req.params.id);
    
    if (!daija) {
      logger.warn('Daija not found:', req.params.id);
      return res.status(404).json({ message: 'Daija nije pronađena' });
    }
    
    logger.info('Daija found:', { id: daija._id, name: daija.name });
    res.json(daija);
  } catch (error) {
    logger.error('Error fetching daija by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search daije (public access) - Optimized with MongoDB text search
app.get('/api/daije/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    logger.info('Searching daije with query:', query);
    
    // Use MongoDB text search for better performance with text indexes
    const daije = await Daija.find({ 
      status: 'approved',
      $text: { $search: query.trim() }
    }, {
      score: { $meta: 'textScore' }
    })
      .select('name title dateOfBirth biography shortDescription education image status createdAt')
      .sort({ score: { $meta: 'textScore' }, name: 1 })
      .lean()
      .exec();
    
    logger.info(`Found ${daije.length} daije matching search query: "${query}"`);
    
    res.json(daije);
  } catch (error) {
    logger.error('Error searching daije:', error);
    res.status(500).json({ message: 'Greška pri pretraživanju daija' });
  }
});

// Add new daija
app.post('/api/daije', authenticateToken, async (req, res) => {
  try {
    logger.info('Adding new daija - Request body:', {
      body: req.body,
      user: req.user
    });

    // Get approval settings
    const approvalSettings = await Settings.findOne({ key: 'approvalSettings' });
    const needsApproval = approvalSettings?.value?.daija !== false; // Default to true if setting not found

    // Only allow admin/super_admin to explicitly set status, otherwise use approval settings
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const finalStatus = (isAdminUser && req.body.status) ? req.body.status : (needsApproval ? 'pending' : 'approved');

    const daijaData = {
      name: req.body.name || '',
      title: req.body.title,
      dateOfBirth: req.body.dateOfBirth || null,
      biography: req.body.biography || '',
      shortDescription: req.body.shortDescription || '',
      education: req.body.education || [],
      image: req.body.image || '',
      status: finalStatus
    };
    
         logger.info('Using approval settings:', { 
       needsApproval,
       setting: approvalSettings?.value?.daija,
       isAdminUser,
       requestedStatus: req.body.status,
       finalStatus: daijaData.status 
     });
    
    logger.info('Creating daija with data:', daijaData);
    const daija = new Daija(daijaData);
    
    const savedDaija = await daija.save();
    logger.info('New daija saved successfully:', {
      id: savedDaija._id,
      name: savedDaija.name,
      status: savedDaija.status
    });
    
    res.status(201).json(savedDaija);
  } catch (error) {
    logger.error('Error adding daija:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update daija
app.put('/api/daije/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating daija:', {
      id: req.params.id,
      body: req.body,
      user: req.user
    });

    // First find the daija to check if it exists
    const existingDaija = await Daija.findById(req.params.id);
    if (!existingDaija) {
      return res.status(404).json({ message: 'Daija nije pronađena' });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name || '',
      title: req.body.title,
      dateOfBirth: req.body.dateOfBirth || null,
      biography: req.body.biography || '',
      shortDescription: req.body.shortDescription || '',
      education: req.body.education || [],
      image: req.body.image || '',
      status: req.body.status || existingDaija.status,
      updatedAt: new Date()
    };

    const daija = await Daija.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Daija updated:', { 
      id: daija._id, 
      name: daija.name,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(daija);
  } catch (error) {
    logger.error('Error updating daija:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID daije' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update daija status (PATCH)
app.patch('/api/daije/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating daija status:', {
      id: req.params.id,
      body: req.body,
      user: req.user
    });

    // First find the daija to check if it exists
    const existingDaija = await Daija.findById(req.params.id);
    if (!existingDaija) {
      return res.status(404).json({ message: 'Daija nije pronađena' });
    }

    // For PATCH, only update the fields that are provided
    const updateData = { updatedAt: new Date() };
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }
    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }
    if (req.body.title !== undefined) {
      updateData.title = req.body.title;
    }
    if (req.body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = req.body.dateOfBirth;
    }
    if (req.body.biography !== undefined) {
      updateData.biography = req.body.biography;
    }
    if (req.body.shortDescription !== undefined) {
      updateData.shortDescription = req.body.shortDescription;
    }
    if (req.body.education !== undefined) {
      updateData.education = req.body.education;
    }
    if (req.body.image !== undefined) {
      updateData.image = req.body.image;
    }

    const daija = await Daija.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Daija updated via PATCH:', { 
      id: daija._id, 
      name: daija.name,
      status: daija.status,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(daija);
  } catch (error) {
    logger.error('Error updating daija:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID daije' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete daija (Admin or Super Admin)
app.delete('/api/daije/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const daija = await Daija.findByIdAndDelete(req.params.id);
    if (!daija) {
      return res.status(404).json({ message: 'Daija not found' });
    }
    logger.info('Daija deleted:', { id: req.params.id, name: daija.name });
    res.json({ message: 'Daija deleted successfully' });
  } catch (error) {
    logger.error('Error deleting daija:', error);
    res.status(500).json({ message: error.message });
  }
});

// Organization Routes
// Get all organizations
app.get('/api/organizations', async (req, res) => {
  try {
    logger.info('Fetching all organizations');
    const organizations = await Organization.find({ status: 'approved' }).sort({ name: 1 });
    logger.info(`Found ${organizations.length} approved organizations`);
    
    // Add lecture count for each organization
    const organizationsWithLectureCount = await Promise.all(
      organizations.map(async (organization) => {
        // Count approved lectures for this organization
        const lectureCount = await Lecture.countDocuments({ 
          organizationId: organization._id, 
          status: 'approved' 
        });
        
        return {
          ...organization.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    logger.info(`Processed ${organizationsWithLectureCount.length} organizations with lecture counts`);
    res.json(organizationsWithLectureCount);
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju organizacija' });
  }
});

// Get single organization by ID
app.get('/api/organizations/:id', async (req, res) => {
  try {
    logger.info('Fetching organization by ID:', req.params.id);
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      logger.warn('Organization not found:', req.params.id);
      return res.status(404).json({ message: 'Organizacija nije pronađena' });
    }
    
    logger.info('Organization found:', { id: organization._id, name: organization.name });
    res.json(organization);
  } catch (error) {
    logger.error('Error fetching organization:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID organizacije' });
    }
    res.status(500).json({ message: 'Greška pri dohvaćanju organizacije' });
  }
});

// Search organizations (public access) - Optimized with MongoDB text search
app.get('/api/organizations/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    logger.info('Searching organizations with query:', query);
    
    // Use MongoDB text search for better performance with text indexes
    const organizations = await Organization.find({ 
      status: 'approved',
      $text: { $search: query.trim() }
    }, {
      score: { $meta: 'textScore' }
    })
      .select('name description address city facebook instagram youtube website image type status createdAt')
      .sort({ score: { $meta: 'textScore' }, name: 1 })
      .lean()
      .exec();
    
    logger.info(`Found ${organizations.length} organizations matching search query: "${query}"`);
    
    res.json(organizations);
  } catch (error) {
    logger.error('Error searching organizations:', error);
    res.status(500).json({ message: 'Greška pri pretraživanju organizacija' });
  }
});

// Add new organization
app.post('/api/organizations', authenticateToken, async (req, res) => {
  try {
    logger.info('Adding new organization - Request body:', {
      body: req.body,
      user: req.user
    });

    // Get approval settings
    const approvalSettings = await Settings.findOne({ key: 'approvalSettings' });
    const needsApproval = approvalSettings?.value?.organization !== false; // Default to true if setting not found

    // Only allow admin/super_admin to explicitly set status, otherwise use approval settings
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const finalStatus = (isAdminUser && req.body.status) ? req.body.status : (needsApproval ? 'pending' : 'approved');

    const organizationData = {
      name: req.body.name,
      description: req.body.description || '',
      address: req.body.address || '',
      city: req.body.city || '',
      facebook: req.body.facebook || '',
      instagram: req.body.instagram || '',
      telegram: req.body.telegram || '',
      viber: req.body.viber || '',
      image: req.body.image || '',
      status: finalStatus
    };
    
         logger.info('Using approval settings:', { 
       needsApproval,
       setting: approvalSettings?.value?.organization,
       isAdminUser,
       requestedStatus: req.body.status,
       finalStatus: organizationData.status 
     });
    
    logger.info('Creating organization with data:', organizationData);
    const organization = new Organization(organizationData);
    
    const savedOrganization = await organization.save();
    logger.info('New organization saved successfully:', {
      id: savedOrganization._id,
      name: savedOrganization.name,
      status: savedOrganization.status
    });
    
    res.status(201).json(savedOrganization);
  } catch (error) {
    logger.error('Error adding organization:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update organization
app.put('/api/organizations/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating organization:', {
      id: req.params.id,
      body: req.body,
      user: req.user
    });

    // First find the organization to check if it exists
    const existingOrganization = await Organization.findById(req.params.id);
    if (!existingOrganization) {
      return res.status(404).json({ message: 'Organizacija nije pronađena' });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      description: req.body.description || '',
      address: req.body.address || '',
      city: req.body.city || '',
      facebook: req.body.facebook || '',
      instagram: req.body.instagram || '',
      telegram: req.body.telegram || '',
      viber: req.body.viber || '',
      image: req.body.image || '',
      status: req.body.status || existingOrganization.status
    };

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Organization updated:', { 
      id: organization._id, 
      name: organization.name,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(organization);
  } catch (error) {
    logger.error('Error updating organization:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID organizacije' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update organization status (PATCH)
app.patch('/api/organizations/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating organization status:', {
      id: req.params.id,
      body: req.body,
      user: req.user
    });

    // First find the organization to check if it exists
    const existingOrganization = await Organization.findById(req.params.id);
    if (!existingOrganization) {
      return res.status(404).json({ message: 'Organizacija nije pronađena' });
    }

    // For PATCH, only update the fields that are provided
    const updateData = {};
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }
    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }
    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }
    if (req.body.address !== undefined) {
      updateData.address = req.body.address;
    }
    if (req.body.city !== undefined) {
      updateData.city = req.body.city;
    }
    if (req.body.facebook !== undefined) {
      updateData.facebook = req.body.facebook;
    }
    if (req.body.instagram !== undefined) {
      updateData.instagram = req.body.instagram;
    }
    if (req.body.telegram !== undefined) {
      updateData.telegram = req.body.telegram;
    }
    if (req.body.viber !== undefined) {
      updateData.viber = req.body.viber;
    }
    if (req.body.image !== undefined) {
      updateData.image = req.body.image;
    }

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Organization updated via PATCH:', { 
      id: organization._id, 
      name: organization.name,
      status: organization.status,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(organization);
  } catch (error) {
    logger.error('Error updating organization:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID organizacije' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete organization (Admin or Super Admin)
app.delete('/api/organizations/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    logger.info('Organization deleted:', { id: req.params.id, name: organization.name });
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    logger.error('Error deleting organization:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get organizations with active lectures
app.get('/api/organizations/with-active-lectures', async (req, res) => {
  try {
    logger.info('Fetching organizations with active lectures');
    
    // Get all organizations
    const organizations = await Organization.find().sort({ name: 1 });
    
    // For each organization, get their active lectures
    const organizationsWithLectures = await Promise.all(
      organizations.map(async (organization) => {
        const lectures = await Lecture.find({ 
          organizationId: organization._id, 
          status: 'approved',
          date: { $gte: new Date() } // Only future lectures
        }).sort({ date: 1 });
        
        return {
          ...organization.toObject(),
          lectures: lectures.map(lecture => ({
            ...lecture.toObject(),
            daijaId: lecture.daija || null
          }))
        };
      })
    );
    
    // Filter to only include organizations that have upcoming lectures
    const organizationsWithUpcomingLectures = organizationsWithLectures.filter(org => org.lectures.length > 0);
    
    logger.info(`Found ${organizationsWithUpcomingLectures.length} organizations with upcoming lectures`);
    res.json(organizationsWithUpcomingLectures);
  } catch (error) {
    logger.error('Error fetching organizations with active lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju organizacija sa predavanjima' });
  }
});

// Test endpoint za provjeru povezivanja s bazom
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const testUser = await User.findOne().limit(1);
    const testLecture = await Lecture.findOne().limit(1);
    
    res.json({
      status: 'success',
      database: {
        state: states[dbState],
        connectionString: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'), // Sakriva credentials
        collections: {
          users: testUser ? 'accessible' : 'empty',
          lectures: testLecture ? 'accessible' : 'empty'
        }
      }
    });
  } catch (error) {
    logger.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      database: {
        state: mongoose.connection.readyState,
        connectionString: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')
      }
    });
  }
});

// Test JWT middleware - simple version
app.get('/api/test-auth', authenticateToken, (req, res) => {
  console.log('🧪 Test auth route called');
  console.log('👤 req.user in test route:', req.user);
  
  res.json({
    message: 'JWT middleware is working!',
    user: req.user,
    timestamp: new Date().toISOString(),
    success: true
  });
});

// Alternative token verification endpoint (manual check)
app.get('/api/verify-token', (req, res) => {
  console.log('🧪 Manual token verification called');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      valid: false, 
      message: 'No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified manually:', decoded);
    
    return res.status(200).json({ 
      valid: true, 
      user: decoded,
      message: 'Token is valid' 
    });
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(401).json({ 
      valid: false, 
      message: 'Invalid token',
      error: err.message 
    });
  }
});

// 🔧 Test endpoint za debug baze podataka
app.get('/api/test-database', authenticateToken, async (req, res) => {
  console.log('🧪 Test database route called');
  console.log('👤 Current user:', req.user);

  try {
    // Get all lectures with their createdBy info
    const allLectures = await Lecture.find().populate('createdBy', 'firstName lastName email');
    
    // Get all users
    const allUsers = await User.find({}, 'firstName lastName email');
    
    console.log('📊 Database overview:', {
      totalLectures: allLectures.length,
      totalUsers: allUsers.length,
      currentUserId: req.user?.id
    });
    
    // Show lectures and their creators
    const lectureInfo = allLectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      createdBy: lecture.createdBy,
      createdByString: lecture.createdBy?.toString(),
      currentUserMatch: lecture.createdBy?.toString() === req.user?.id
    }));
    
    console.log('📋 Lectures in database:', lectureInfo);
    
    res.json({
      message: 'Database test completed',
      currentUser: req.user,
      stats: {
        totalLectures: allLectures.length,
        totalUsers: allUsers.length,
        lecturesForCurrentUser: lectureInfo.filter(l => l.currentUserMatch).length
      },
      lectures: lectureInfo,
      users: allUsers.map(u => ({ id: u._id, name: `${u.firstName} ${u.lastName}`, email: u.email }))
    });
  } catch (err) {
    console.error('❌ Database test error:', err);
    res.status(500).json({ message: 'Database test failed', error: err.message });
  }
});

// 🔧 Test endpoint za debug korisnika u bazi
app.get('/api/test-users', async (req, res) => {
  console.log('🧪 Test users route called');

  try {
    // Get all users (without passwords)
    const allUsers = await User.find({}, '-password -securityAnswer');
    
    console.log('📊 Users in database:', {
      totalUsers: allUsers.length,
      users: allUsers.map(u => ({
        id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        hasPassword: !!u.password,
        createdAt: u.createdAt,
        // Check if data might be mixed up
        firstNameLooksLikeEmail: u.firstName?.includes('@'),
        lastNameLooksLikePassword: u.lastName?.length > 10,
        emailLooksLikeName: u.email && !u.email.includes('@')
      }))
    });
    
    // Check for potential data mix-ups
    const potentialIssues = allUsers.filter(u => 
      u.firstName?.includes('@') || 
      !u.email?.includes('@') ||
      u.lastName?.length > 20
    );
    
    if (potentialIssues.length > 0) {
      console.log('⚠️ Potential data mix-ups detected:', potentialIssues.map(u => ({
        id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        issues: {
          firstNameLooksLikeEmail: u.firstName?.includes('@'),
          emailLooksInvalid: !u.email?.includes('@'),
          lastNameTooLong: u.lastName?.length > 20
        }
      })));
    }
    
    res.json({
      message: 'Users test completed',
      totalUsers: allUsers.length,
      potentialIssues: potentialIssues.length,
      users: allUsers.map(u => ({
        id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        hasPassword: !!u.password,
        createdAt: u.createdAt,
        // Analysis flags
        flags: {
          firstNameLooksLikeEmail: u.firstName?.includes('@'),
          lastNameLooksLikePassword: u.lastName?.length > 10,
          emailLooksLikeName: u.email && !u.email.includes('@')
        }
      })),
      analysis: {
        usersWithEmailAsFirstName: allUsers.filter(u => u.firstName?.includes('@')).length,
        usersWithInvalidEmail: allUsers.filter(u => !u.email?.includes('@')).length,
        usersWithLongLastName: allUsers.filter(u => u.lastName?.length > 20).length
      }
    });
  } catch (err) {
    console.error('❌ Users test error:', err);
    res.status(500).json({ message: 'Users test failed', error: err.message });
  }
});

// 🔧 Admin endpoint to fix lectures without createdBy field
app.post('/api/admin/fix-lectures-createdby', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  console.log('🔧 Admin fix lectures createdBy endpoint called');
  console.log('👤 Admin user:', req.user);

  try {
    // Find lectures without createdBy field
    const lecturesWithoutCreatedBy = await Lecture.find({ 
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined }
      ]
    });

    console.log(`📊 Found ${lecturesWithoutCreatedBy.length} lectures without createdBy field`);

    if (lecturesWithoutCreatedBy.length === 0) {
      return res.json({
        message: 'No lectures need fixing - all have createdBy field',
        fixed: 0,
        total: 0
      });
    }

    // Get the admin user ID to assign as default creator
    const adminUserId = req.user.id;
    
    // Option 1: Assign all to the current admin (safest)
    const updateResult = await Lecture.updateMany(
      { 
        $or: [
          { createdBy: { $exists: false } },
          { createdBy: null },
          { createdBy: undefined }
        ]
      },
      { 
        $set: { createdBy: adminUserId }
      }
    );

    console.log('✅ Update result:', updateResult);

    // Verify the fix
    const remainingWithoutCreatedBy = await Lecture.countDocuments({ 
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined }
      ]
    });

    res.json({
      message: 'Lectures createdBy field fixed successfully',
      fixed: updateResult.modifiedCount,
      total: lecturesWithoutCreatedBy.length,
      remainingWithoutCreatedBy: remainingWithoutCreatedBy,
      assignedTo: {
        userId: adminUserId,
        userEmail: req.user.email,
        userName: `${req.user.firstName} ${req.user.lastName}`
      }
    });

  } catch (err) {
    console.error('❌ Error fixing lectures createdBy:', err);
    res.status(500).json({ 
      message: 'Error fixing lectures createdBy field', 
      error: err.message 
    });
  }
});

// 🔧 Admin endpoint to cleanup invalid data from database
app.post('/api/admin/cleanup-database', authenticateToken, isSuperAdmin, async (req, res) => {
  console.log('🧹 Admin database cleanup endpoint called');
  console.log('👤 Super admin user:', req.user);

  try {
    const cleanupResults = {
      daije: { before: 0, deleted: 0, after: 0 },
      organizations: { before: 0, deleted: 0, after: 0 },
      lectures: { before: 0, deleted: 0, after: 0 }
    };

    // Keep only approved, pending and rejected statuses
    const allowedStatuses = ['approved', 'pending', 'rejected'];

    // 1. Cleanup Daije - delete all except approved, pending and rejected
    console.log('🧹 Cleaning up Daije (keeping only approved, pending and rejected)...');
    cleanupResults.daije.before = await Daija.countDocuments();
    
    const deleteInvalidDaije = await Daija.deleteMany({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: { $nin: allowedStatuses } }
      ]
    });
    console.log(`🗑️ Deleted ${deleteInvalidDaije.deletedCount} Daije (kept only approved, pending and rejected)`);
    
    cleanupResults.daije.deleted = deleteInvalidDaije.deletedCount;
    cleanupResults.daije.after = await Daija.countDocuments();

    // 2. Cleanup Organizations - delete all except approved, pending and rejected
    console.log('🧹 Cleaning up Organizations (keeping only approved, pending and rejected)...');
    cleanupResults.organizations.before = await Organization.countDocuments();
    
    const deleteInvalidOrgs = await Organization.deleteMany({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: { $nin: allowedStatuses } }
      ]
    });
    console.log(`🗑️ Deleted ${deleteInvalidOrgs.deletedCount} Organizations (kept only approved, pending and rejected)`);
    
    cleanupResults.organizations.deleted = deleteInvalidOrgs.deletedCount;
    cleanupResults.organizations.after = await Organization.countDocuments();

    // 3. Cleanup Lectures - delete all except approved, pending and rejected
    console.log('🧹 Cleaning up Lectures (keeping only approved, pending and rejected)...');
    cleanupResults.lectures.before = await Lecture.countDocuments();
    
    const deleteInvalidLectures = await Lecture.deleteMany({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: { $nin: allowedStatuses } }
      ]
    });
    console.log(`🗑️ Deleted ${deleteInvalidLectures.deletedCount} Lectures (kept only approved, pending and rejected)`);
    
    cleanupResults.lectures.deleted = deleteInvalidLectures.deletedCount;
    cleanupResults.lectures.after = await Lecture.countDocuments();

    // 4. Cleanup orphaned lectures (referencing deleted daije/organizations)
    console.log('🧹 Cleaning up orphaned Lectures...');
    
    // Find lectures with daija references that don't exist
    const orphanedByDaija = await Lecture.find({
      daija: { $exists: true, $ne: null }
    }).populate('daija');
    
    const orphanedDaijaLectures = orphanedByDaija.filter(lecture => !lecture.daija);
    
    if (orphanedDaijaLectures.length > 0) {
      const orphanedDaijaIds = orphanedDaijaLectures.map(l => l._id);
      await Lecture.deleteMany({ _id: { $in: orphanedDaijaIds } });
      console.log(`🗑️ Deleted ${orphanedDaijaLectures.length} lectures with orphaned daija references`);
      cleanupResults.lectures.deleted += orphanedDaijaLectures.length;
    }

    // Find lectures with organization references that don't exist
    const orphanedByOrg = await Lecture.find({
      organizationId: { $exists: true, $ne: null }
    }).populate('organization');
    
    const orphanedOrgLectures = orphanedByOrg.filter(lecture => !lecture.organization);
    
    if (orphanedOrgLectures.length > 0) {
      const orphanedOrgIds = orphanedOrgLectures.map(l => l._id);
      await Lecture.deleteMany({ _id: { $in: orphanedOrgIds } });
      console.log(`🗑️ Deleted ${orphanedOrgLectures.length} lectures with orphaned organization references`);
      cleanupResults.lectures.deleted += orphanedOrgLectures.length;
    }

    // Update final lecture count
    cleanupResults.lectures.after = await Lecture.countDocuments();

    // 5. Summary
    const totalDeleted = cleanupResults.daije.deleted + 
                        cleanupResults.organizations.deleted + 
                        cleanupResults.lectures.deleted;

    console.log('✅ Database cleanup completed:', cleanupResults);

    res.json({
      message: 'Database cleanup completed successfully (kept only approved, pending and rejected items)',
      results: cleanupResults,
      summary: {
        totalDeleted,
        cleanupDate: new Date().toISOString(),
        cleanupPolicy: 'Deleted all items except those with approved, pending or rejected status',
        keptStatuses: ['approved', 'pending', 'rejected'],
        performedBy: {
          userId: req.user.id,
          userEmail: req.user.email,
          userName: `${req.user.firstName} ${req.user.lastName}`
        }
      }
    });

  } catch (err) {
    console.error('❌ Error during database cleanup:', err);
    res.status(500).json({ 
      message: 'Error during database cleanup (approved/pending/rejected only)', 
      error: err.message 
    });
  }
});

// 🔧 Admin endpoint to analyze lectures ownership
app.get('/api/admin/analyze-lectures', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  console.log('🔧 Admin analyze lectures endpoint called');

  try {
    // Get comprehensive analysis
    const totalLectures = await Lecture.countDocuments();
    const lecturesWithCreatedBy = await Lecture.countDocuments({ createdBy: { $exists: true, $ne: null } });
    const lecturesWithoutCreatedBy = await Lecture.countDocuments({ 
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined }
      ]
    });

    // Get all users for reference
    const allUsers = await User.find({}, 'firstName lastName email role');
    
    // Get lectures grouped by creator
    const lecturesByCreator = await Lecture.aggregate([
      {
        $match: { createdBy: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$createdBy',
          count: { $sum: 1 },
          lectures: { $push: { title: '$title', date: '$date', _id: '$_id' } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    // Sample of lectures without createdBy
    const sampleWithoutCreatedBy = await Lecture.find({ 
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined }
      ]
    }).limit(5).select('title date address city');

    res.json({
      message: 'Lectures ownership analysis completed',
      summary: {
        totalLectures,
        lecturesWithCreatedBy,
        lecturesWithoutCreatedBy,
        percentageWithCreatedBy: ((lecturesWithCreatedBy / totalLectures) * 100).toFixed(2)
      },
      lecturesByCreator: lecturesByCreator.map(item => ({
        userId: item._id,
        user: item.user[0] ? {
          name: `${item.user[0].firstName} ${item.user[0].lastName}`,
          email: item.user[0].email,
          role: item.user[0].role
        } : 'User not found',
        lectureCount: item.count,
        lectures: item.lectures
      })),
      sampleWithoutCreatedBy: sampleWithoutCreatedBy.map(l => ({
        id: l._id,
        title: l.title,
        date: l.date,
        location: `${l.address}, ${l.city}`
      })),
      allUsers: allUsers.map(u => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role
      }))
    });

  } catch (err) {
    console.error('❌ Error analyzing lectures:', err);
    res.status(500).json({ 
      message: 'Error analyzing lectures', 
      error: err.message 
    });
  }
});

// 🔧 Test endpoint za registraciju
app.post('/api/test-register', async (req, res) => {
  console.log('🧪 Test registration endpoint called');
  console.log('📥 Request body:', req.body);
  
  try {
    // Test web format
    const webTestData = {
      username: 'webuser123',
      email: 'web@test.com',
      password: 'password123',
      securityQuestionIndex: 0,
      securityAnswer: 'test answer'
    };
    
    res.json({
      message: 'Test registration endpoint working',
      webFormat: webTestData,
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test registration error:', error);
    res.status(500).json({ message: 'Test registration failed', error: error.message });
  }
});

// 🔧 Test endpoint za simulaciju registracije
app.post('/api/test-register-simulation', async (req, res) => {
  console.log('🧪 Test registration simulation endpoint called');
  console.log('📥 Request body:', req.body);
  
  try {
    // Extract fields - web format
    let { username, firstName, lastName, email, password, securityQuestionIndex, securityAnswer } = req.body;
    
    console.log('🔍 Extracted fields:', {
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email,
      hasPassword: !!password,
      securityQuestionIndex: securityQuestionIndex,
      hasSecurityAnswer: !!securityAnswer
    });
    
    // Validation
    const errors = [];
    
    if (!username || !username.trim()) {
      errors.push('Username je obavezan');
    } else if (username.trim().length < 2) {
      errors.push('Username mora imati najmanje 2 karaktera');
    } else if (username.trim().length > 50) {
      errors.push('Username može imati maksimalno 50 karaktera');
    }
    
    if (email && email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      errors.push('Email format nije ispravan');
    }
    
    if (!password || !password.trim()) {
      errors.push('Lozinka je obavezna');
    } else if (password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }
    
    if (securityQuestionIndex === undefined || securityQuestionIndex === null || securityQuestionIndex === '') {
      errors.push('Sigurnosno pitanje je obavezno');
    } else {
      const questionIndex = parseInt(securityQuestionIndex);
      if (isNaN(questionIndex) || questionIndex < 0 || questionIndex > 9) {
        errors.push('Sigurnosno pitanje mora biti između 0 i 9');
      }
    }
    
    if (!securityAnswer || !securityAnswer.trim()) {
      errors.push('Odgovor na sigurnosno pitanje je obavezan');
    } else if (securityAnswer.trim().length < 2) {
      errors.push('Odgovor na sigurnosno pitanje mora imati najmanje 2 karaktera');
    }
    
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({ 
        message: 'Validacijske greške:\n• ' + errors.join('\n• '),
        errors: errors,
        step: 'validation'
      });
    }
    
    // Normalize data
    const normalizedUsername = username.trim();
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    console.log('✅ Validation passed, normalized data:', {
      normalizedUsername,
      normalizedEmail,
      hasPassword: !!password,
      securityQuestionIndex: parseInt(securityQuestionIndex),
      hasSecurityAnswer: !!securityAnswer
    });
    
    // Check for existing user by email or username
    const searchQuery = {
      $or: [
        { username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') } }
      ]
    };
    
    // Only check email if provided
    if (normalizedEmail) {
      searchQuery.$or.push({ email: normalizedEmail });
    }
    
    console.log('🔍 Searching for existing user with query:', searchQuery);
    
    const existingUser = await User.findOne(searchQuery);
    
    if (existingUser) {
      console.log('❌ User already exists:', {
        existingUserId: existingUser._id,
        existingUsername: existingUser.username,
        existingEmail: existingUser.email
      });
      
      if (normalizedEmail && existingUser.email === normalizedEmail) {
        return res.status(400).json({ 
          message: 'Korisnik sa ovim emailom već postoji',
          step: 'duplicate_check',
          conflict: 'email'
        });
      }
      if (existingUser.username.toLowerCase() === normalizedUsername.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Korisnik sa ovim korisničkim imenom već postoji',
          step: 'duplicate_check',
          conflict: 'username'
        });
      }
    }
    
    console.log('✅ No existing user found, proceeding with registration simulation');
    
    res.json({
      message: 'Registration simulation successful - all validations passed',
      step: 'simulation_complete',
      normalizedData: {
        username: normalizedUsername,
        email: normalizedEmail,
        securityQuestionIndex: parseInt(securityQuestionIndex),
        securityAnswer: securityAnswer.toLowerCase().trim()
      },
      wouldCreateUser: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test registration simulation error:', error);
    res.status(500).json({ 
      message: 'Test registration simulation failed', 
      error: error.message,
      step: 'error'
    });
  }
});

// 🔧 Test endpoint za debug req.body
app.post('/api/test-body', (req, res) => {
  console.log('🧪 Test body endpoint called');
  console.log('📥 REQ.BODY DEBUG:', req.body);
  console.log('📥 REQ.HEADERS:', req.headers);
  
  res.json({
    message: 'Test body endpoint working',
    receivedBody: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body || {}),
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', usersRouter);

// Performance test endpoint
app.get('/api/performance-test', async (req, res) => {
  const startTime = Date.now();
  console.log('🧪 [PERFORMANCE TEST] Starting performance test...');
  
  try {
    const results = {};
    
    // Test 1: Database connection ping
    const pingStart = Date.now();
    await mongoose.connection.db.admin().ping();
    results.dbPing = Date.now() - pingStart;
    console.log(`📊 [PERFORMANCE TEST] DB Ping: ${results.dbPing}ms`);
    
    // Test 2: Count all lectures
    const countStart = Date.now();
    const totalLectures = await Lecture.countDocuments();
    results.lectureCount = {
      duration: Date.now() - countStart,
      total: totalLectures
    };
    console.log(`📊 [PERFORMANCE TEST] Lecture Count: ${results.lectureCount.duration}ms (${totalLectures} lectures)`);
    
    // Test 3: Simple find query
    const simpleFindStart = Date.now();
    const simpleLectures = await Lecture.find().limit(5);
    results.simpleFind = {
      duration: Date.now() - simpleFindStart,
      count: simpleLectures.length
    };
    console.log(`📊 [PERFORMANCE TEST] Simple Find: ${results.simpleFind.duration}ms (${simpleLectures.length} lectures)`);
    
    // Test 4: Complex query (same as public endpoint)
    const complexQueryStart = Date.now();
    const complexLectures = await Lecture.find({ 
      status: 'approved',
      date: { $gte: new Date() }
    }).limit(10);
    results.complexQuery = {
      duration: Date.now() - complexQueryStart,
      count: complexLectures.length
    };
    console.log(`📊 [PERFORMANCE TEST] Complex Query: ${results.complexQuery.duration}ms (${complexLectures.length} lectures)`);
    
    // Test 5: Query with populate
    const populateQueryStart = Date.now();
    const populatedLectures = await Lecture.find({ 
      status: 'approved',
      date: { $gte: new Date() }
    })
      .populate('organization', 'name')
      .limit(10);
    results.populateQuery = {
      duration: Date.now() - populateQueryStart,
      count: populatedLectures.length
    };
    console.log(`📊 [PERFORMANCE TEST] Populate Query: ${results.populateQuery.duration}ms (${populatedLectures.length} lectures)`);
    
    // 🚀 Test 6: Optimized query with lean()
    const optimizedQueryStart = Date.now();
    const optimizedLectures = await Lecture.find({ 
      status: 'approved',
      date: { $gte: new Date() }
    })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
      .populate('organization', 'name')
      .sort({ date: 1 })
      .lean()
      .limit(10);
    results.optimizedQuery = {
      duration: Date.now() - optimizedQueryStart,
      count: optimizedLectures.length
    };
    console.log(`📊 [PERFORMANCE TEST] Optimized Lean Query: ${results.optimizedQuery.duration}ms (${optimizedLectures.length} lectures)`);
    
    // Test 7: Data transformation
    const transformStart = Date.now();
    const transformed = populatedLectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    results.dataTransform = {
      duration: Date.now() - transformStart,
      count: transformed.length
    };
    console.log(`📊 [PERFORMANCE TEST] Data Transform: ${results.dataTransform.duration}ms (${transformed.length} lectures)`);
    
    // 🚀 Test 8: Optimized data transformation (with lean data)
    const optimizedTransformStart = Date.now();
    const optimizedTransformed = optimizedLectures.map(lecture => ({
      ...lecture,
      daijaId: lecture.daija || null
    }));
    results.optimizedDataTransform = {
      duration: Date.now() - optimizedTransformStart,
      count: optimizedTransformed.length
    };
    console.log(`📊 [PERFORMANCE TEST] Optimized Data Transform: ${results.optimizedDataTransform.duration}ms (${optimizedTransformed.length} lectures)`);
    
    // Total test time
    results.totalTime = Date.now() - startTime;
    
    // Calculate performance improvements
    const populateImprovement = results.populateQuery.duration - results.optimizedQuery.duration;
    const transformImprovement = results.dataTransform.duration - results.optimizedDataTransform.duration;
    const totalImprovement = (results.populateQuery.duration + results.dataTransform.duration) - 
                            (results.optimizedQuery.duration + results.optimizedDataTransform.duration);
    
    console.log('📈 [PERFORMANCE TEST] Complete results:');
    console.log(`  - DB Ping: ${results.dbPing}ms`);
    console.log(`  - Lecture Count: ${results.lectureCount.duration}ms`);
    console.log(`  - Simple Find: ${results.simpleFind.duration}ms`);
    console.log(`  - Complex Query: ${results.complexQuery.duration}ms`);
    console.log(`  - Populate Query: ${results.populateQuery.duration}ms`);
    console.log(`  - Optimized Query: ${results.optimizedQuery.duration}ms (${populateImprovement}ms faster)`);
    console.log(`  - Data Transform: ${results.dataTransform.duration}ms`);
    console.log(`  - Optimized Transform: ${results.optimizedDataTransform.duration}ms (${transformImprovement}ms faster)`);
    console.log(`  - Total Time: ${results.totalTime}ms`);
    console.log(`  - Total Improvement: ${totalImprovement}ms (${((totalImprovement/(results.populateQuery.duration + results.dataTransform.duration))*100).toFixed(1)}% faster)`);
    
    res.json({
      message: 'Performance test completed',
      timestamp: new Date().toISOString(),
      results: results,
      improvements: {
        queryImprovement: populateImprovement,
        transformImprovement: transformImprovement,
        totalImprovement: totalImprovement,
        percentageImprovement: ((totalImprovement/(results.populateQuery.duration + results.dataTransform.duration))*100).toFixed(1) + '%'
      },
      analysis: {
        dbConnectionHealth: results.dbPing < 100 ? 'good' : results.dbPing < 500 ? 'moderate' : 'slow',
        queryPerformance: results.optimizedQuery.duration < 100 ? 'excellent' : results.optimizedQuery.duration < 300 ? 'good' : results.optimizedQuery.duration < 500 ? 'moderate' : 'slow',
        populateImpact: results.populateQuery.duration - results.complexQuery.duration,
        optimizationImpact: populateImprovement,
        recommendations: [
          results.dbPing > 500 ? 'Consider database connection optimization' : null,
          results.optimizedQuery.duration > 300 ? 'Consider adding more specific indexes' : null,
          populateImprovement > 50 ? 'Lean queries provide significant performance boost' : null,
          transformImprovement > 10 ? 'Optimized transformations reduce processing time' : null
        ].filter(Boolean)
      }
    });
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('❌ [PERFORMANCE TEST] Error after:', errorTime + 'ms');
    console.error('❌ [PERFORMANCE TEST] Error:', error.message);
    
    res.status(500).json({
      message: 'Performance test failed',
      error: error.message,
      duration: errorTime
    });
  }
});

// 🚀 Database performance analysis endpoint
app.get('/api/database-analysis', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  const startTime = Date.now();
  console.log('🔍 [DATABASE ANALYSIS] Starting comprehensive database analysis...');
  
  try {
    const analysis = {};
    const db = mongoose.connection.db;
    
    // 1. Collection statistics
    console.log('📊 Analyzing collection statistics...');
    const collections = ['lectures', 'users', 'daijas', 'organizations', 'suggestions'];
    analysis.collections = {};
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const stats = await collection.stats();
      analysis.collections[collectionName] = {
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        indexes: stats.nindexes,
        totalIndexSize: stats.totalIndexSize
      };
    }
    
    // 2. Index analysis for lectures (most critical)
    console.log('🔍 Analyzing indexes...');
    const lecturesCollection = db.collection('lectures');
    const indexes = await lecturesCollection.indexes();
    analysis.lectureIndexes = indexes.map(index => ({
      name: index.name,
      key: index.key,
      unique: index.unique || false,
      background: index.background || false
    }));
    
    // 3. Query performance analysis
    console.log('⚡ Testing query performance...');
    const queryTests = {};
    
    // Test most common queries
    const testQueries = [
      {
        name: 'approved_lectures_by_date',
        query: { status: 'approved', date: { $gte: new Date() } },
        sort: { date: 1 }
      },
      {
        name: 'pending_lectures',
        query: { status: 'pending' },
        sort: { createdAt: -1 }
      },
      {
        name: 'lectures_by_user',
        query: { createdBy: new mongoose.Types.ObjectId() }, // Dummy ObjectId for testing
        sort: { createdAt: -1 }
      }
    ];
    
    for (const test of testQueries) {
      const testStart = Date.now();
      const explain = await lecturesCollection.find(test.query).sort(test.sort).explain('executionStats');
      const duration = Date.now() - testStart;
      
      queryTests[test.name] = {
        duration: duration,
        executionStats: {
          totalDocsExamined: explain.executionStats.totalDocsExamined,
          totalDocsReturned: explain.executionStats.totalDocsReturned,
          executionTimeMillis: explain.executionStats.executionTimeMillis,
          indexesUsed: explain.executionStats.executionStages?.indexName || 'COLLSCAN'
        }
      };
    }
    
    analysis.queryPerformance = queryTests;
    
    // 4. Database connection analysis
    analysis.connection = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
    
    // 5. Performance recommendations
    const recommendations = [];
    
    // Check for missing indexes
    const hasStatusDateIndex = indexes.some(idx => 
      idx.key.status === 1 && idx.key.date === 1
    );
    if (!hasStatusDateIndex) {
      recommendations.push('Add compound index on {status: 1, date: 1} for better query performance');
    }
    
    // Check query performance
    Object.entries(queryTests).forEach(([queryName, stats]) => {
      if (stats.executionStats.indexesUsed === 'COLLSCAN') {
        recommendations.push(`Query ${queryName} is doing collection scan - needs index optimization`);
      }
      if (stats.duration > 100) {
        recommendations.push(`Query ${queryName} is slow (${stats.duration}ms) - consider optimization`);
      }
    });
    
    // Check collection sizes
    Object.entries(analysis.collections).forEach(([name, stats]) => {
      if (stats.totalIndexSize > stats.size) {
        recommendations.push(`Collection ${name} has more index data than actual data - review index usage`);
      }
    });
    
    analysis.recommendations = recommendations;
    analysis.analysisTime = Date.now() - startTime;
    
    console.log(`✅ [DATABASE ANALYSIS] Analysis completed in ${analysis.analysisTime}ms`);
    console.log(`📋 [DATABASE ANALYSIS] Found ${recommendations.length} recommendations`);
    
    res.json({
      message: 'Database analysis completed',
      timestamp: new Date().toISOString(),
      analysis: analysis,
      summary: {
        totalCollections: Object.keys(analysis.collections).length,
        totalIndexes: Object.values(analysis.collections).reduce((sum, col) => sum + col.indexes, 0),
        recommendationsCount: recommendations.length,
        overallHealth: recommendations.length === 0 ? 'excellent' : 
                      recommendations.length <= 2 ? 'good' : 
                      recommendations.length <= 5 ? 'moderate' : 'needs_attention'
      }
    });
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('❌ [DATABASE ANALYSIS] Error after:', errorTime + 'ms');
    console.error('❌ [DATABASE ANALYSIS] Error:', error.message);
    
    res.status(500).json({
      message: 'Database analysis failed',
      error: error.message,
      duration: errorTime
    });
  }
});

// 🚀 Alternative super-fast aggregation endpoint for public lectures
app.get('/api/lectures/public-fast', async (req, res) => {
  const startTime = Date.now();
  console.log('🚀 [AGGREGATION] /api/lectures/public-fast endpoint called at:', new Date().toISOString());
  
  try {
    logger.info('Fetching public lectures via aggregation');
    
    // Debug: Database connection state
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
      console.error('❌ [AGGREGATION] Database not connected!');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Debug: Start query timing
    const queryStartTime = Date.now();
    console.log('🔍 [AGGREGATION] Starting aggregation pipeline...');
    
    // 🚀 AGGREGATION PIPELINE - Always uses indexes and is very fast
    const currentDate = new Date();
    // Set to start of today to include today's lectures
    const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const lectures = await Lecture.aggregate([
      // Stage 1: Match with index hint
      {
        $match: {
          status: 'approved',
          date: { $gte: startOfToday }  // Include today's lectures and future ones
        }
      },
      // Stage 2: Sort by date (uses index)
      {
        $sort: { date: 1 }
      },
      // Stage 3: Lookup organization data
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organizationData',
          pipeline: [
            { $project: { name: 1 } } // Only get name field
          ]
        }
      },
      // Stage 4: Project only needed fields and transform data
      {
        $project: {
          title: 1,
          speaker: 1,
          daija: 1,
          daijaId: '$daija', // Create daijaId field directly
          organization: 1,
          organizationId: 1,
          'organization.name': { $arrayElemAt: ['$organizationData.name', 0] },
          address: 1,
          city: 1,
          date: 1,
          time: 1,
          shortDescription: 1,
          description: 1,
          image: 1,
          status: 1,
          createdAt: 1
        }
      }
    ]).option({ hint: { status: 1, date: 1 } }); // Force index usage

    const queryEndTime = Date.now();
    const queryDuration = queryEndTime - queryStartTime;
    console.log(`⚡ [AGGREGATION] Aggregation pipeline completed in: ${queryDuration}ms`);
    console.log(`📊 [AGGREGATION] Found ${lectures.length} public lectures`);

    logger.info(`Found ${lectures.length} public lectures via aggregation`);
    
    // Debug: Total endpoint timing
    const totalEndTime = Date.now();
    const totalDuration = totalEndTime - startTime;
    
    console.log('📈 [AGGREGATION] Endpoint timing:');
    console.log(`  - Aggregation pipeline: ${queryDuration}ms (${((queryDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Total endpoint time: ${totalDuration}ms`);
    
    // Performance grade
    const performanceGrade = totalDuration < 25 ? 'EXCELLENT' : 
                           totalDuration < 50 ? 'VERY_GOOD' :
                           totalDuration < 100 ? 'GOOD' : 
                           totalDuration < 300 ? 'MODERATE' : 'SLOW';
    
    console.log(`🎯 [AGGREGATION] Performance grade: ${performanceGrade} (${totalDuration}ms)`);
    
    // Add performance headers
    res.set({
      'X-Query-Time': `${queryDuration}ms`,
      'X-Transform-Time': '0ms',
      'X-Total-Time': `${totalDuration}ms`,
      'X-Lecture-Count': lectures.length,
      'X-Performance-Grade': performanceGrade,
      'X-Method': 'aggregation',
      'X-Index-Hint': 'forced'
    });

    res.json(lectures);
  } catch (error) {
    const errorTime = Date.now();
    const errorDuration = errorTime - startTime;
    
    console.error('❌ [AGGREGATION] Error in /api/lectures/public-fast after:', errorDuration + 'ms');
    console.error('❌ [AGGREGATION] Error details:', error.message);
    
    logger.error('Error fetching public lectures via aggregation:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvaćanju javnih predavanja (agregacija)',
      debug: {
        duration: errorDuration + 'ms',
        error: error.message,
        method: 'aggregation'
      }
    });
  }
});

// Debug endpoint to check "On je Allah" lecture status
app.get('/api/debug/on-je-allah', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Checking "On je Allah" lecture status...');
    
    // Find all lectures with "On je Allah" in title
    const onJeAllahLectures = await Lecture.find({
      title: { $regex: /on je allah/i }
    }).populate('organization', 'name');
    
    // Also search for similar titles
    const similarLectures = await Lecture.find({
      title: { $regex: /(allah|on je)/i }
    }).populate('organization', 'name').limit(10);
    
    // Get all active lectures for comparison
    const activeLectures = await Lecture.find({ status: 'approved' })
      .select('title status date')
      .limit(5);
    
    // Get all approved lectures for comparison
    const approvedLectures = await Lecture.find({ status: 'approved' })
      .select('title status date')
      .limit(5);
    
    console.log('🔍 [DEBUG] Found lectures with "On je Allah":', onJeAllahLectures.length);
    console.log('🔍 [DEBUG] Found similar lectures:', similarLectures.length);
    console.log('🔍 [DEBUG] Total active lectures:', activeLectures.length);
    console.log('🔍 [DEBUG] Total approved lectures:', approvedLectures.length);
    
    res.json({
      message: 'Debug information for "On je Allah" lecture',
      timestamp: new Date().toISOString(),
      results: {
        onJeAllahLectures: onJeAllahLectures.map(l => ({
          id: l._id,
          title: l.title,
          status: l.status,
          date: l.date,
          organization: l.organization,
          speaker: l.speaker,
          address: l.address,
          city: l.city
        })),
        similarLectures: similarLectures.map(l => ({
          id: l._id,
          title: l.title,
          status: l.status,
          date: l.date,
          organization: l.organization
        })),
        sampleActiveLectures: activeLectures.map(l => ({
          id: l._id,
          title: l.title,
          status: l.status,
          date: l.date
        })),
        sampleApprovedLectures: approvedLectures.map(l => ({
          id: l._id,
          title: l.title,
          status: l.status,
          date: l.date
        }))
      },
      counts: {
        onJeAllahFound: onJeAllahLectures.length,
        similarFound: similarLectures.length,
        totalActive: activeLectures.length,
        totalApproved: approvedLectures.length
      }
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Error in debug endpoint:', error);
    res.status(500).json({ 
      message: 'Debug endpoint error', 
      error: error.message 
    });
  }
});

// Admin endpoint - Get all daije (including pending/rejected)
app.get('/api/admin/daije', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Admin fetching all daije (including pending/rejected)');
    const daije = await Daija.find().sort({ name: 1 });
    logger.info(`Found ${daije.length} daije for admin`);
    
    // Return daije as-is with name field (no firstName mapping)
    res.json(daije);
  } catch (error) {
    logger.error('Error fetching all daije for admin:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija' });
  }
});

// Admin endpoint - Get all organizations (including pending/rejected)
app.get('/api/admin/organizations', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Admin fetching all organizations (including pending/rejected)');
    const organizations = await Organization.find().sort({ name: 1 });
    logger.info(`Found ${organizations.length} organizations for admin with statuses:`, 
      organizations.map(org => ({ name: org.name, status: org.status }))
    );
    res.json(organizations);
  } catch (error) {
    logger.error('Error fetching all organizations for admin:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju organizacija' });
  }
});

// Admin endpoint - Get all lectures by daija ID (including pending/rejected)
app.get('/api/admin/lectures/daija/:daijaId', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Admin fetching all lectures by daija ID:', req.params.daijaId);
    const lectures = await Lecture.find({ daija: req.params.daijaId })
      .populate('createdBy', 'firstName lastName email');
    logger.info(`Found ${lectures.length} lectures for daija (admin):`, req.params.daijaId);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching all lectures by daija ID for admin:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin endpoint - Get all lectures by organization ID (including pending/rejected)
app.get('/api/admin/lectures/organization/:organizationId', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Admin fetching all lectures by organization ID:', req.params.organizationId);
    const lectures = await Lecture.find({ organizationId: req.params.organizationId })
      .populate('createdBy', 'firstName lastName email');
    logger.info(`Found ${lectures.length} lectures for organization (admin):`, req.params.organizationId);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error fetching all lectures by organization ID for admin:', error);
    res.status(500).json({ message: error.message });
  }
});



// Update user endpoint - protected for admin access
app.put('/api/users/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userId = req.params.id;
    
    logger.info('Updating user via admin dashboard:', {
      userId,
      username,
      email,
      role,
      requestedBy: req.user.username
    });

    // Find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    // Validation
    const errors = [];
    
    if (!username || !username.trim()) {
      errors.push('Korisničko ime je obavezno');
    } else if (username.trim().length < 2) {
      errors.push('Korisničko ime mora imati najmanje 2 karaktera');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errors.push('Korisničko ime može sadržavati samo slova, brojeve i podvlaku');
    }

    if (!email || !email.trim()) {
      errors.push('Email je obavezan');
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.push('Email format nije ispravan');
    }

    // Password is optional for updates
    if (password && password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }

    const validRoles = ['user', 'admin', 'super_admin'];
    if (role && !validRoles.includes(role)) {
      errors.push('Nevaljan tip korisnika');
    }

    // Only super_admin can update admin or super_admin users
    if ((role === 'admin' || role === 'super_admin') && req.user.role !== 'super_admin') {
      errors.push('Nemate dozvolu za ažuriranje admin korisnika');
    }

    // Prevent non-super_admin from updating super_admin users
    if (existingUser.role === 'super_admin' && req.user.role !== 'super_admin') {
      errors.push('Nemate dozvolu za ažuriranje super admin korisnika');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check if username or email already exists (excluding current user)
    const duplicateUser = await User.findOne({
      _id: { $ne: userId },
      $or: [
        { email: email.trim().toLowerCase() },
        { username: username.trim() }
      ]
    });

    if (duplicateUser) {
      return res.status(400).json({ 
        message: 'Korisnik sa ovim emailom ili korisničkim imenom već postoji' 
      });
    }

    // Prepare update data
    const updateData = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role: role || existingUser.role
    };

    // Hash new password if provided
    if (password && password.trim()) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    // Remove sensitive data from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.securityAnswer;

    logger.info('User updated successfully via admin dashboard:', {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });

    res.json(userResponse);
  } catch (error) {
    logger.error('Error updating user via admin dashboard:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID korisnika' });
    }
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Korisnik sa ovim emailom ili korisničkim imenom već postoji' 
      });
    } else {
      res.status(500).json({ message: 'Greška pri ažuriranju korisnika' });
    }
  }
});

// Delete user endpoint - protected for super admin access only
app.delete('/api/users/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    logger.info('Deleting user via admin dashboard:', {
      userId,
      requestedBy: req.user.username
    });

    // Find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    // Prevent deletion of super_admin users (safety measure)
    if (existingUser.role === 'super_admin') {
      return res.status(403).json({ message: 'Super admin korisnici se ne mogu obrisati' });
    }

    // Prevent users from deleting themselves
    if (userId === req.user.id) {
      return res.status(403).json({ message: 'Ne možete obrisati sebe' });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    logger.info('User deleted successfully via admin dashboard:', {
      id: userId,
      username: existingUser.username,
      email: existingUser.email
    });

    res.json({ message: 'Korisnik je uspješno obrisan' });
  } catch (error) {
    logger.error('Error deleting user via admin dashboard:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID korisnika' });
    }
    res.status(500).json({ message: 'Greška pri brisanju korisnika' });
  }
});

// Search lectures (public access) - Optimized with MongoDB text search
app.get('/api/lectures/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    logger.info('Searching lectures with query:', query);
    
    // Use MongoDB text search for better performance with text indexes
    const lectures = await Lecture.find({ 
      status: 'approved',
      $text: { $search: query.trim() }
    }, {
      score: { $meta: 'textScore' }
    })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
      .populate('organization', 'name')
      .sort({ score: { $meta: 'textScore' }, date: 1 })
      .lean()
      .exec();
    
    logger.info(`Found ${lectures.length} lectures matching search query: "${query}"`);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture,
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    logger.error('Error searching lectures:', error);
    res.status(500).json({ message: 'Greška pri pretraživanju predavanja' });
  }
});

// Debug endpoint - Get all organizations (public debug access)
app.get('/api/debug/organizations', async (req, res) => {
  try {
    logger.info('Debug fetching all organizations (including pending/rejected)');
    const organizations = await Organization.find().sort({ createdAt: -1 }); // Newest first
    logger.info(`Found ${organizations.length} organizations for debug`);
    
    const summary = organizations.map(org => ({
      id: org._id,
      name: org.name,
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
    
    res.json({
      message: 'Debug organizations data',
      total: organizations.length,
      byStatus: {
        approved: organizations.filter(o => o.status === 'approved').length,
        pending: organizations.filter(o => o.status === 'pending').length,
        rejected: organizations.filter(o => o.status === 'rejected').length,
        other: organizations.filter(o => !['approved', 'pending', 'rejected'].includes(o.status)).length
      },
      organizations: summary
    });
  } catch (error) {
    logger.error('Error fetching debug organizations:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju debug organizacija' });
  }
});

// Debug endpoint - Auto-approve pending organizations
app.post('/api/debug/approve-pending-organizations', async (req, res) => {
  try {
    logger.info('Debug auto-approving pending organizations');
    
    const pendingOrganizations = await Organization.find({ status: 'pending' });
    logger.info(`Found ${pendingOrganizations.length} pending organizations to approve`);
    
    const updateResult = await Organization.updateMany(
      { status: 'pending' },
      { status: 'approved', updatedAt: new Date() }
    );
    
    logger.info(`Auto-approved ${updateResult.modifiedCount} organizations`);
    
    res.json({
      message: 'Auto-approved pending organizations',
      pendingFound: pendingOrganizations.length,
      approved: updateResult.modifiedCount,
      organizations: pendingOrganizations.map(org => ({
        id: org._id,
        name: org.name,
        previousStatus: 'pending',
        newStatus: 'approved'
      }))
    });
  } catch (error) {
    logger.error('Error auto-approving pending organizations:', error);
    res.status(500).json({ message: 'Greška pri odobravanju pending organizacija' });
  }
});


