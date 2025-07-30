const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Lecture = require('./models/Lecture');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja';

async function updateTestLectures() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all test lectures
    const testLectures = await Lecture.find({ 
      title: { $regex: /test/i } 
    });

    console.log(`\n=== FOUND ${testLectures.length} TEST LECTURES ===\n`);
    
    for (let i = 0; i < testLectures.length; i++) {
      const lecture = testLectures[i];
      console.log(`${i + 1}. ${lecture.title}`);
      console.log(`   ID: ${lecture._id}`);
      console.log(`   Current isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      console.log(`   Status: ${lecture.status}`);
      
      // Update to make it weekly if it contains "sedmicno" in title
      if (lecture.title.toLowerCase().includes('sedmic') || lecture.title.toLowerCase().includes('sedmič')) {
        lecture.isWeeklyLecture = true;
        lecture.weekNumber = lecture.weekNumber || 1;
        lecture.totalWeeks = lecture.totalWeeks || 4;
        lecture.weeklySeriesId = lecture.weeklySeriesId || `WL_TEST_${Date.now()}_${i}`;
        
        await lecture.save();
        console.log(`   ✅ UPDATED to weekly lecture!`);
        console.log(`   New isWeeklyLecture: ${lecture.isWeeklyLecture}`);
        console.log(`   Week: ${lecture.weekNumber}/${lecture.totalWeeks}`);
      } else {
        console.log(`   ℹ️  Not a weekly lecture (no 'sedmic' in title)`);
      }
      console.log('   ---');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\nAuthentication error. Check your .env file for DB_USER and DB_PASS');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

updateTestLectures();