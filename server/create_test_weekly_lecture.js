const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.development' });

const Lecture = require('./models/Lecture');

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestWeeklyLecture() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test weekly lecture
    const testLecture = new Lecture({
      type: 'Predavanje',
      title: 'TEST SEDMIČNO PREDAVANJE - Uvod u Islam',
      address: 'Test Adresa 123',
      city: 'Sarajevo',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '18:00',
      duration: 60,
      shortDescription: 'Ovo je test sedmično predavanje za provjeru badge-a',
      status: 'approved',
      isWeeklyLecture: true,
      weekNumber: 1,
      totalWeeks: 4,
      weeklySeriesId: `WL_TEST_${Date.now()}`
    });

    await testLecture.save();
    
    console.log('\n✅ Created test weekly lecture:');
    console.log('Title:', testLecture.title);
    console.log('ID:', testLecture._id);
    console.log('isWeeklyLecture:', testLecture.isWeeklyLecture);
    console.log('Week:', testLecture.weekNumber + '/' + testLecture.totalWeeks);
    console.log('Series ID:', testLecture.weeklySeriesId);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

createTestWeeklyLecture();