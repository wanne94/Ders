const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Get all existing images
router.get('/', async (req, res) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // In development, fetch recent images from production server
      try {
        // Fetch recent lectures to get their images
        const response = await axios.get('https://ders.ba/api/lectures', {
          timeout: 10000,
          params: { limit: 100 }
        });
        
        if (response.data) {
          // Extract unique images from lectures
          const imageSet = new Set();
          const images = [];
          
          // Handle both array and object response formats
          const lectures = Array.isArray(response.data) ? response.data : 
                          (response.data.lectures || []);
          
          lectures.forEach(lecture => {
            if (lecture.image && !imageSet.has(lecture.image)) {
              imageSet.add(lecture.image);
              
              // Get image name from path
              let imageName = lecture.image;
              if (imageName.includes('/')) {
                imageName = imageName.split('/').pop();
              }
              
              // Ensure full URL for all images
              let imageUrl = lecture.image;
              if (!imageUrl.startsWith('http')) {
                imageUrl = `https://ders.ba${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
              }
              
              images.push({
                name: imageName,
                url: imageUrl,
                uploadedAt: lecture.createdAt || lecture.date || new Date()
              });
            }
          });
          
          // Sort images by date, newest first (no default images)
          const allImages = images
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          
          console.log(`Fetched ${images.length} unique images from production lectures`);
          
          return res.json({ 
            success: true, 
            images: allImages.slice(0, 50), // Return up to 50 images
            source: 'production-api',
            total: allImages.length
          });
        }
      } catch (fetchError) {
        console.log('Error fetching from production API:', fetchError.message);
      }
      
      // Fallback: Return empty array if can't fetch from production
      const fallbackImages = [];
      
      return res.json({ 
        success: true, 
        images: fallbackImages,
        source: 'fallback-images'
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