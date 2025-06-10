const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Helper funkcija za brisanje temp fajlova sa retry logikom (Windows fix)
const cleanupTempFile = async (filePath, maxRetries = 5, delay = 100) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Temp file deleted:', filePath);
        return;
      }
      return; // Fajl ne postoji, nema šta da se briše
    } catch (error) {
      if (error.code === 'EBUSY' && i < maxRetries - 1) {
        console.log(`⏳ File busy, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('❌ Error cleaning up temp file:', error);
        return; // Odustani nakon svih pokušaja
      }
    }
  }
};

// Kreiraj uploads direktorij ako ne postoji
const uploadsDir = path.join(__dirname, '../../web/public/uploads/images');
const tempDir = path.join(__dirname, '../../web/public/uploads/temp');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer storage za temp folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Prvo u temp folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-temp-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Provjeri da li je fajl slika
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
    uploadsDir: uploadsDir,
    tempDir: tempDir,
    dirExists: fs.existsSync(uploadsDir),
    timestamp: new Date().toISOString()
  });
});

// Upload endpoint sa Sharp optimizacijom
router.post('/', upload.single('image'), async (req, res) => {
  console.log('🔄 Upload endpoint hit');
  console.log('📁 Request details:', {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    },
    file: req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      destination: req.file.destination,
      path: req.file.path
    } : 'No file'
  });

  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const tempFilePath = req.file.path;
    const originalSize = req.file.size;
    
    // Generiši finalno ime fajla (WebP format)
    const timestamp = Date.now();
    const finalFileName = `optimized-${timestamp}.webp`;
    const finalFilePath = path.join(uploadsDir, finalFileName);

    console.log('🔄 Starting Sharp optimization...');
    console.log('📁 Temp file:', tempFilePath);
    console.log('📁 Final file:', finalFilePath);

    // Sharp obrada
    const sharpInstance = sharp(tempFilePath);
    const metadata = await sharpInstance.metadata();
    
    console.log('📊 Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: originalSize
    });

    // Optimizacija sa Sharp
    await sharpInstance
      .resize({
        height: 1080, // Maksimalna visina
        width: undefined, // Automatski width da zadrži aspect ratio
        withoutEnlargement: true // Ne povećavaj male slike
      })
      .webp({ 
        quality: 85, // 85% kvalitet
        effort: 6 // Maksimalni effort za kompresiju
      })
      .toFile(finalFilePath);

    // Dobij informacije o finalnoj slici
    const finalStats = fs.statSync(finalFilePath);
    const finalSize = finalStats.size;
    const finalMetadata = await sharp(finalFilePath).metadata();

    // Izračunaj kompresiju
    const compressionRatio = ((originalSize - finalSize) / originalSize * 100).toFixed(2);

    console.log('✅ Image optimization completed:', {
      originalSize: originalSize,
      finalSize: finalSize,
      compressionRatio: `${compressionRatio}%`,
      finalDimensions: {
        width: finalMetadata.width,
        height: finalMetadata.height
      }
    });

    // Obriši temp fajl sa retry logikom za Windows
    await cleanupTempFile(tempFilePath);

    // Vrati optimizovane informacije
    res.json({
      success: true,
      path: `/uploads/images/${finalFileName}`,
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
    
    // Obriši temp fajl ako postoji
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      await cleanupTempFile(req.file.path);
    }

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
    console.log('❌ Multer error:', error);
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
    console.log('❌ Upload error:', error);
    return res.status(400).json({ 
      success: false, 
      message: error.message,
      error: 'GENERAL_ERROR'
    });
  }
  
  next();
});

module.exports = router; 