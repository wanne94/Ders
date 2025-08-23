const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get all existing images
router.get('/', async (req, res) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // In development, return placeholder images for testing
      const placeholderImages = [
        { name: 'placeholder1.jpg', url: 'https://picsum.photos/400/300?random=1', uploadedAt: new Date() },
        { name: 'placeholder2.jpg', url: 'https://picsum.photos/400/300?random=2', uploadedAt: new Date() },
        { name: 'placeholder3.jpg', url: 'https://picsum.photos/400/300?random=3', uploadedAt: new Date() },
        { name: 'placeholder4.jpg', url: 'https://picsum.photos/400/300?random=4', uploadedAt: new Date() },
        { name: 'placeholder5.jpg', url: 'https://picsum.photos/400/300?random=5', uploadedAt: new Date() },
        { name: 'placeholder6.jpg', url: 'https://picsum.photos/400/300?random=6', uploadedAt: new Date() },
        { name: 'placeholder7.jpg', url: 'https://picsum.photos/400/300?random=7', uploadedAt: new Date() },
        { name: 'placeholder8.jpg', url: 'https://picsum.photos/400/300?random=8', uploadedAt: new Date() },
        { name: 'placeholder9.jpg', url: 'https://picsum.photos/400/300?random=9', uploadedAt: new Date() },
      ];
      
      return res.json({ 
        success: true, 
        images: placeholderImages,
        source: 'development-placeholders'
      });
    }
    
    // Production - read from local uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/images');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, images: [] });
    }
    
    const files = fs.readdirSync(uploadsDir);
    
    // Filter only image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          url: `/uploads/images/${file}`,
          size: stats.size,
          uploadedAt: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // Sort by newest first
    
    res.json({ 
      success: true, 
      images: images,
      source: 'local'
    });
    
  } catch (error) {
    console.error('Error fetching existing images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching images',
      error: error.message 
    });
  }
});

module.exports = router;