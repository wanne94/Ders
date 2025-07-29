const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

const Lecture = require('./models/Lecture');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/ders-ba';

async function updateAllTestLectures() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all test lectures that contain "sedmicno" in title
    const testLectures = await Lecture.find({ 
      title: { $regex: /sedmicno/i } 
    });

    console.log(`\n📋 Found ${testLectures.length} test lectures`);

    for (const lecture of testLectures) {
      console.log('\n=== UPDATING LECTURE ===');
      console.log('Title:', lecture.title);
      console.log('ID:', lecture._id);
      console.log('Current isWeeklyLecture:', lecture.isWeeklyLecture);
      
      // Update to make it weekly
      lecture.isWeeklyLecture = true;
      lecture.weekNumber = 1;
      lecture.totalWeeks = 4;
      lecture.weeklySeriesId = `WL_TEST_${lecture._id}_${Date.now()}`;
      
      await lecture.save();
      
      console.log('\n✅ UPDATED');
      console.log('New isWeeklyLecture:', lecture.isWeeklyLecture);
      console.log('Week:', lecture.weekNumber + '/' + lecture.totalWeeks);
      console.log('Series ID:', lecture.weeklySeriesId);
    }

    console.log('\n🎉 All test lectures updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📤 Disconnected from MongoDB');
  }
}

updateAllTestLectures();