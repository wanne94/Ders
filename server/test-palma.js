// Test script to check Palma's lecture count
const mongoose = require('mongoose');
require('dotenv').config();

const Lecture = require('./models/Lecture');
const Daija = require('./models/Daija');

async function testPalma() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Palma
    const palma = await Daija.findOne({ name: { $regex: 'Palma', $options: 'i' } });
    if (!palma) {
      console.log('❌ Palma not found');
      return;
    }
    
    console.log('🔍 Found Palma:', palma.name, 'ID:', palma._id);
    console.log('📊 Status:', palma.status);
    
    // Count lectures for Palma
    const lectureCount = await Lecture.countDocuments({ 
      daija: palma._id, 
      status: 'approved' 
    });
    
    console.log('📊 Approved lecture count for Palma:', lectureCount);
    
    // Find all lectures for Palma
    const lectures = await Lecture.find({ daija: palma._id });
    console.log('📚 All lectures for Palma:');
    lectures.forEach(lecture => {
      console.log('  -', lecture.title, '(status:', lecture.status + ')');
    });
    
    // Test the actual API simulation
    console.log('\n🧪 Testing API logic:');
    const daijeWithLectureCount = {
      ...palma.toObject(),
      lectureCount: lectureCount
    };
    
    console.log('📊 Final object with lectureCount:', {
      name: daijeWithLectureCount.name,
      lectureCount: daijeWithLectureCount.lectureCount
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testPalma();