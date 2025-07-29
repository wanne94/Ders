const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

const Lecture = require('./models/Lecture');

async function testDatabaseFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test with select statement from the API
    const lecturesWithSelect = await Lecture.find({ status: 'approved' })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
      .limit(1)
      .exec();

    console.log('\n📋 With SELECT statement:');
    if (lecturesWithSelect.length > 0) {
      const lecture = lecturesWithSelect[0].toObject();
      console.log('Title:', lecture.title);
      console.log('All fields:', Object.keys(lecture));
      console.log('isWeeklyLecture:', lecture.isWeeklyLecture);
      console.log('weekNumber:', lecture.weekNumber);
      console.log('totalWeeks:', lecture.totalWeeks);
      console.log('weeklySeriesId:', lecture.weeklySeriesId);
    }

    // Test without select statement
    const lecturesNoSelect = await Lecture.find({ title: /sedmicno/i })
      .limit(1)
      .exec();

    console.log('\n📋 Without SELECT statement:');
    if (lecturesNoSelect.length > 0) {
      const lecture = lecturesNoSelect[0].toObject();
      console.log('Title:', lecture.title);
      console.log('All fields:', Object.keys(lecture));
      console.log('isWeeklyLecture:', lecture.isWeeklyLecture);
      console.log('weekNumber:', lecture.weekNumber);
      console.log('totalWeeks:', lecture.totalWeeks);
      console.log('weeklySeriesId:', lecture.weeklySeriesId);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📤 Disconnected from MongoDB');
  }
}

testDatabaseFields();