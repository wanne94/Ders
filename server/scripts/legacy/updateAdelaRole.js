const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import User model
const User = require('./models/User');

async function updateAdelaRole() {
  try {
    // Connect to MongoDB - use production directly
    const mongoUri = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI || 'mongodb://localhost:27017/ders';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find user Adela (the last registered user)
    const adela = await User.findOne({
      $or: [
        { username: 'Adela' },
        { firstName: 'Adela' },
        { email: { $regex: /adela/i } }
      ]
    }).sort({ createdAt: -1 });

    if (!adela) {
      console.log('User Adela not found');

      // Get the last registered user instead
      const lastUser = await User.findOne({}).sort({ createdAt: -1 });
      if (lastUser) {
        console.log('Last registered user:', {
          id: lastUser._id,
          username: lastUser.username,
          email: lastUser.email,
          firstName: lastUser.firstName,
          currentRole: lastUser.role
        });

        console.log('Updating last user role to admin...');
        lastUser.role = 'admin';
        await lastUser.save();
        console.log('Successfully updated last user\'s role to admin');
      }
      process.exit(0);
    }

    console.log('Found user Adela:', {
      id: adela._id,
      username: adela.username,
      email: adela.email,
      firstName: adela.firstName,
      currentRole: adela.role
    });

    // Update role to admin
    adela.role = 'admin';
    await adela.save();

    console.log('Successfully updated Adela\'s role to admin');

    // Verify the update
    const updatedUser = await User.findById(adela._id);
    console.log('Verification - New role:', updatedUser.role);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdelaRole();