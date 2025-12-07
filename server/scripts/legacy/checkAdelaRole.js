const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import User model
const User = require('./models/User');

async function checkAdelaRole() {
  try {
    // Connect to MongoDB - use production directly
    const mongoUri = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI || 'mongodb://localhost:27017/ders';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find user Adela
    const adela = await User.findOne({
      $or: [
        { username: 'Adela' },
        { email: { $regex: /adelaramovic90/i } }
      ]
    });

    if (!adela) {
      console.log('User Adela not found');
      process.exit(1);
    }

    console.log('Current Adela status:', {
      id: adela._id,
      username: adela.username,
      email: adela.email,
      role: adela.role,
      firstName: adela.firstName,
      phone: adela.phone,
      updatedAt: adela.updatedAt
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdelaRole();