require('dotenv').config();
const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');
const User = require('./models/User');

async function testAddLecture() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/predavanje');
    console.log('Connected to MongoDB');
    
    // Find a user to use as creator
    const user = await User.findOne();
    if (!user) {
      console.log('No users found, creating test user...');
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'admin'
      });
      await testUser.save();
      console.log('Test user created');
    }
    
    const creator = user || (await User.findOne());
    
    // Create test lecture
    const testLecture = new Lecture({
      title: 'Test predavanje - On je Allah',
      speaker: 'Test predavač',
      organization: 'Test organizacija',
      address: 'Test adresa 123',
      city: 'Test grad',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '19:00',
      shortDescription: 'Test kratki opis',
      description: 'Test duži opis predavanja',
      image: '/uploads/images/test.jpg',
      status: 'approved',
      createdBy: creator._id
    });
    
    console.log('Creating lecture with data:', {
      title: testLecture.title,
      status: testLecture.status,
      date: testLecture.date,
      createdBy: testLecture.createdBy
    });
    
    const savedLecture = await testLecture.save();
    console.log('✅ Lecture saved successfully:', {
      id: savedLecture._id,
      title: savedLecture.title,
      status: savedLecture.status,
      date: savedLecture.date
    });
    
    // Check if it's in database
    const foundLecture = await Lecture.findById(savedLecture._id);
    console.log('✅ Lecture found in database:', !!foundLecture);
    
    // Check all lectures
    const allLectures = await Lecture.find();
    console.log(`📊 Total lectures in database: ${allLectures.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAddLecture(); 