const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Lecture = require('./models/Lecture');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja';

async function checkWeeklyLectures() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all lectures with isWeeklyLecture = true
    const weeklyLectures = await Lecture.find({ isWeeklyLecture: true });
    console.log(`\n✅ Found ${weeklyLectures.length} weekly lectures in database:\n`);
    
    weeklyLectures.forEach((lecture, i) => {
      console.log(`${i + 1}. ${lecture.title}`);
      console.log(`   ID: ${lecture._id}`);
      console.log(`   isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      console.log(`   weekNumber: ${lecture.weekNumber}`);
      console.log(`   totalWeeks: ${lecture.totalWeeks}`);
      console.log(`   Status: ${lecture.status}`);
      console.log(`   Date: ${lecture.date}`);
      console.log('   ---');
    });
    
    // Also check all test lectures
    console.log('\n📋 Checking ALL test lectures:');
    const testLectures = await Lecture.find({ title: { $regex: /test/i } });
    console.log(`Found ${testLectures.length} test lectures total\n`);
    
    testLectures.forEach((lecture, i) => {
      console.log(`${i + 1}. ${lecture.title}`);
      console.log(`   isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkWeeklyLectures();