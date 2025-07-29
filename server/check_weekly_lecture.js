const mongoose = require('mongoose');
require('dotenv').config();

const Lecture = require('./models/Lecture');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ders-ba';

async function checkWeeklyLectures() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all lectures with isWeeklyLecture field
    const weeklyLectures = await Lecture.find({ isWeeklyLecture: true })
      .select('title isWeeklyLecture weekNumber totalWeeks date')
      .limit(10);

    console.log('\n=== WEEKLY LECTURES ===');
    console.log(`Found ${weeklyLectures.length} weekly lectures:\n`);
    
    weeklyLectures.forEach(lecture => {
      console.log(`Title: ${lecture.title}`);
      console.log(`ID: ${lecture._id}`);
      console.log(`isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      console.log(`Week: ${lecture.weekNumber}/${lecture.totalWeeks}`);
      console.log(`Date: ${lecture.date}`);
      console.log('---');
    });

    // Also check recently created lectures
    const recentLectures = await Lecture.find({})
      .select('title isWeeklyLecture createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n=== RECENT LECTURES ===');
    recentLectures.forEach(lecture => {
      console.log(`Title: ${lecture.title}`);
      console.log(`isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      console.log(`Created: ${lecture.createdAt}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkWeeklyLectures();