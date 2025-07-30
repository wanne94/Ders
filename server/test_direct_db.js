const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.development' });

const Lecture = require('./models/Lecture');

async function testDirectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test 1: Direct find
    console.log('\n=== TEST 1: Direct find ===');
    const testLecture = await Lecture.findOne({ 
      title: { $regex: /TEST SEDMIČNO PREDAVANJE/i } 
    });
    
    if (testLecture) {
      console.log('Found lecture:', {
        title: testLecture.title,
        isWeeklyLecture: testLecture.isWeeklyLecture,
        weekNumber: testLecture.weekNumber,
        totalWeeks: testLecture.totalWeeks
      });
    }
    
    // Test 2: With select
    console.log('\n=== TEST 2: With select (as in API) ===');
    const withSelect = await Lecture.findOne({ 
      title: { $regex: /TEST SEDMIČNO PREDAVANJE/i } 
    })
    .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
    .lean();
    
    console.log('With select:', {
      title: withSelect?.title,
      isWeeklyLecture: withSelect?.isWeeklyLecture,
      hasField: withSelect ? 'isWeeklyLecture' in withSelect : false
    });
    
    // Test 3: List all fields
    console.log('\n=== TEST 3: All fields in document ===');
    const allFields = await Lecture.findOne({ 
      title: { $regex: /TEST SEDMIČNO PREDAVANJE/i } 
    }).lean();
    
    console.log('All fields:', Object.keys(allFields || {}));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testDirectDB();