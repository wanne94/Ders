const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Helper function for cleaning up temp files with retry logic (Windows fix)
const cleanupTempFile = async (filePath, maxRetries = 5, delay = 100) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Temp file deleted:', filePath);
        return;
      }
      return; // File doesn't exist, nothing to clean up
    } catch (error) {
      if (error.code === 'EBUSY' && i < maxRetries - 1) {
        console.log(`⏳ File busy, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('❌ Error cleaning up temp file:', error);
        return; // Give up after all retries
      }
    }
  }
};

// Define upload directory - unified for both environments
const uploadsDir = path.join(__dirname, '../uploads/images'); // Unified path - server/uploads/images

console.log('📁 Upload configuration:', {
  environment: process.env.NODE_ENV,
  uploadsDir: uploadsDir,
  uploadsExists: fs.existsSync(uploadsDir)
});

// Create uploads directory if it doesn't exist
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadsDir);
  }
} catch (error) {
  console.error('❌ Error creating directories:', error);
}

// Configure multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for processing with Sharp

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Upload endpoint is working',
    environment: process.env.NODE_ENV,
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir),
    timestamp: new Date().toISOString()
  });
});

// Upload endpoint with Sharp optimization
router.post('/', upload.single('image'), async (req, res) => {
  console.log('🔄 Upload endpoint hit');
  console.log('📁 Request details:', {
    method: req.method,
    url: req.url,
    environment: process.env.NODE_ENV,
    uploadsDir: uploadsDir,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    },
    file: req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file'
  });

  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const originalSize = req.file.size;
    
    // Generate final filename (WebP format)
    const timestamp = Date.now();
    const finalFileName = `optimized-${timestamp}.webp`;
    const finalFilePath = path.join(uploadsDir, finalFileName);

    console.log('🔄 Starting Sharp optimization...');
    console.log('📁 Final file path:', finalFilePath);

    // Get metadata from buffer
    const sharpInstance = sharp(req.file.buffer);
    const metadata = await sharpInstance.metadata();
    
    console.log('📊 Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: originalSize
    });

    // Optimize with Sharp
    await sharpInstance
      .resize({
        height: 1080, // Max height
        width: undefined, // Auto width to maintain aspect ratio
        withoutEnlargement: true // Don't enlarge small images
      })
      .webp({ 
        quality: 85, // 85% quality
        effort: 6 // Maximum compression effort
      })
      .toFile(finalFilePath);

    // Get final image info
    const finalStats = fs.statSync(finalFilePath);
    const finalSize = finalStats.size;
    const finalMetadata = await sharp(finalFilePath).metadata();

    // Calculate compression ratio
    const compressionRatio = ((originalSize - finalSize) / originalSize * 100).toFixed(2);

    console.log('✅ Image optimization completed:', {
      originalSize: originalSize,
      finalSize: finalSize,
      compressionRatio: `${compressionRatio}%`,
      finalDimensions: {
        width: finalMetadata.width,
        height: finalMetadata.height
      },
      savedTo: finalFilePath
    });

    // Return path in format expected by frontend
    // This will be served by Express server in both environments
    const returnPath = `/uploads/images/${finalFileName}`; // Unified path for both environments
    console.log('🔗 Returning path:', returnPath);

    // Return optimized info
    res.json({
      success: true,
      path: returnPath, // Frontend expects this format
      filename: finalFileName,
      originalSize: originalSize,
      finalSize: finalSize,
      compressionRatio: `${compressionRatio}%`,
      dimensions: {
        width: finalMetadata.width,
        height: finalMetadata.height
      }
    });

  } catch (error) {
    console.error('❌ Sharp optimization error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Greška pri obradi slike',
      error: 'PROCESSING_ERROR',
      details: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Slika je prevelika. Maksimalna veličina je 5MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
      error: 'UPLOAD_ERROR'
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'GENERAL_ERROR'
    });
  }

  next();
});

module.exports = router; 