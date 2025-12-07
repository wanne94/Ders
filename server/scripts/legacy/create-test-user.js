// Script to create a test user directly on the backend

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ders';

async function createTestUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: 'testclan' },
        { email: 'testclan@example.com' }
      ]
    });

    if (existingUser) {
      console.log('❌ User already exists with this username or email');
      console.log('Existing user:', {
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role
      });
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Create new user
    const newUser = new User({
      username: 'testclan',
      email: 'testclan@example.com',
      password: hashedPassword,
      role: 'user', // Regular member, not admin
      isEmailVerified: true // Set to true so they can login immediately
    });

    // Save user
    await newUser.save();

    console.log('✅ Test user created successfully!');
    console.log('User details:');
    console.log('- Username:', newUser.username);
    console.log('- Email:', newUser.email);
    console.log('- Role:', newUser.role);
    console.log('- ID:', newUser._id);
    console.log('\nYou can now login with:');
    console.log('- Username: testclan');
    console.log('- Password: Test123!');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestUser();