const mongoose = require('mongoose');
require('dotenv').config();

const Lecture = require('./models/Lecture');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/ders-ba';

async function updateTestLecture() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find test lecture
    const testLecture = await Lecture.findOne({ 
      title: { $regex: /test.*sedmicno/i } 
    });

    if (testLecture) {
      console.log('\n=== FOUND TEST LECTURE ===');
      console.log('Title:', testLecture.title);
      console.log('ID:', testLecture._id);
      console.log('Current isWeeklyLecture:', testLecture.isWeeklyLecture);
      
      // Update to make it weekly
      testLecture.isWeeklyLecture = true;
      testLecture.weekNumber = 1;
      testLecture.totalWeeks = 4;
      testLecture.weeklySeriesId = `WL_TEST_${Date.now()}`;
      
      await testLecture.save();
      
      console.log('\n=== UPDATED ===');
      console.log('New isWeeklyLecture:', testLecture.isWeeklyLecture);
      console.log('Week:', testLecture.weekNumber + '/' + testLecture.totalWeeks);
      console.log('Series ID:', testLecture.weeklySeriesId);
      
    } else {
      console.log('Test lecture not found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

updateTestLecture();