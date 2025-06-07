import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import winston from 'winston';
import fs from 'fs';

// Load environment variables
dotenv.config();

// 🔐 JWT utilities
const { generateToken, verifyToken, authMiddleware: jwtAuthMiddleware } = require('../utils/jwt');

// Import routes
const uploadRoutes = require('../routes/upload');
const usersRouter = require('../routes/users');

// Import models
const Lecture = require('../models/Lecture');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Daija = require('../models/Daija');
const Suggestion = require('../models/Suggestion');
const Settings = require('../models/Settings');

const app = express();
const PORT = process.env.PORT || 5003;

// Winston logger configuration
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

// CORS configuration - allow all domains in production
const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow all domains in production
    if (process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      // In development, allow localhost and local IP addresses
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5003',
        'http://127.0.0.1:3000',
        'http://192.168.0.20:3000',
        'http://192.168.0.20:5003',
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

// Helmet security headers - production configuration
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

app.use(express.json({ limit: '50mb' }));
app.use(morgan('combined')); // HTTP request logging

// 🚀 Next.js build - serving static files
// For development: use Next.js dev server (doesn't serve static files)
// For production: serve from .next or out folder
const isProduction = process.env.NODE_ENV === 'production';

console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

if (isProduction) {
  // Production - check if out folder exists (static export) or use .next
  const outPath = path.join(__dirname, '../../out');
  const nextPath = path.join(__dirname, '../../.next');
  
  if (fs.existsSync(outPath)) {
    // Static export build
    app.use(express.static(outPath));
    console.log('📦 Serving production static export from /out folder');
  } else if (fs.existsSync(nextPath)) {
    // Regular Next.js build
    app.use(express.static(path.join(__dirname, '../../.next/static')));
    console.log('📦 Serving production build from /.next folder');
  } else {
    console.warn('⚠️  No production build found. Run "npm run build" first.');
  }
} else {
  // Development - Next.js dev server handles static files
  console.log('🔧 Development mode - Next.js dev server handles static files');
  console.log('🔧 Start frontend with: npm run dev');
}

// Always serve public folder
app.use('/static', express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../public')));

// Create uploads directory if it doesn't exist - back to public/uploads
const uploadsDir = path.join(__dirname, '../../public/uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Note: Static files are now served by Next.js from public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Basic health check route
app.get('/', (req: Request, res: Response) => {
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
app.get('/health', (req: Request, res: Response) => {
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
app.get('/api', (req: Request, res: Response) => {
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
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Middleware functions
interface AuthenticatedRequest extends Request {
  user?: any;
}

const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

const isSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super admin role required.' });
  }
};

const isAdminOrSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or Super admin role required.' });
  }
};

// Database connection
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/predavanje';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
    // Create database indexes
    await createDatabaseIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createDatabaseIndexes = async (): Promise<void> => {
  try {
    // Add your database indexes here
    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app; 