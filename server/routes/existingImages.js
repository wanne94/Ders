const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Get all existing images
router.get('/', async (req, res) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    // Add option to fetch only lecture images
    const lecturesOnly = req.query.lecturesOnly === 'true';
    
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
              
              // Keep relative URL for consistency with production mode
              let imageUrl = lecture.image;
              if (imageUrl.startsWith('https://ders.ba')) {
                // Convert full URL to relative path
                imageUrl = imageUrl.replace('https://ders.ba', '');
              }
              
              images.push({
                name: imageName,
                url: imageUrl, // Return relative path, frontend will handle URL generation
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
    
    // Production mode
    if (lecturesOnly) {
      // Fetch only lecture images from production API
      try {
        const response = await axios.get('https://ders.ba/api/lectures', {
          timeout: 10000,
          params: { limit: 100 }
        });
        
        if (response.data) {
          const imageSet = new Set();
          const images = [];
          
          const lectures = Array.isArray(response.data) ? response.data : 
                          (response.data.lectures || []);
          
          lectures.forEach(lecture => {
            if (lecture.image && !imageSet.has(lecture.image)) {
              imageSet.add(lecture.image);
              
              let imageName = lecture.image;
              if (imageName.includes('/')) {
                imageName = imageName.split('/').pop();
              }
              
              let imageUrl = lecture.image;
              if (imageUrl.startsWith('https://ders.ba')) {
                imageUrl = imageUrl.replace('https://ders.ba', '');
              }
              
              images.push({
                name: imageName,
                url: imageUrl,
                uploadedAt: lecture.createdAt || lecture.date || new Date()
              });
            }
          });
          
          const sortedImages = images
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          
          return res.json({ 
            success: true, 
            images: sortedImages.slice(0, 50),
            source: 'production-lectures',
            total: sortedImages.length
          });
        }
      } catch (error) {
        console.error('Error fetching lectures:', error.message);
      }
    }
    
    // Default: read from local uploads directory (all images)
    const uploadsDir = path.join(__dirname, '../uploads/images');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, images: [] });
    }
    
    const files = fs.readdirSync(uploadsDir);
    
    // Filter only image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // Default images to exclude when lecturesOnly is true
    const defaultImages = ['predavanjeslika.jpg', 'daijaslika.jpg', 'udruzenjeslika.jpg', 
                          'logo.jpg', 'favicon.png', 'icon.png', 'adaptive-icon.png', 
                          'splash.png', 'splash-icon.png', 'maxresdefault.jpg'];
    
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        // Exclude non-image files
        if (!imageExtensions.includes(ext)) return false;
        
        // If lecturesOnly, exclude default images
        if (lecturesOnly && defaultImages.includes(file.toLowerCase())) {
          return false;
        }
        
        return true;
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