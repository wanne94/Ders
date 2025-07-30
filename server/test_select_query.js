const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.development' });

const Lecture = require('./models/Lecture');

async function testSelectQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Test 1: Without select
    console.log('=== TEST 1: Without select ===');
    const withoutSelect = await Lecture.findOne({ title: /TEST SEDMIČNO/ }).lean();
    console.log('isWeeklyLecture:', withoutSelect?.isWeeklyLecture);
    console.log('Has field:', withoutSelect ? 'isWeeklyLecture' in withoutSelect : false);
    
    // Test 2: With exact select from API
    console.log('\n=== TEST 2: With API select ===');
    const withSelect = await Lecture.findOne({ title: /TEST SEDMIČNO/ })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
      .lean();
    console.log('isWeeklyLecture:', withSelect?.isWeeklyLecture);
    console.log('Has field:', withSelect ? 'isWeeklyLecture' in withSelect : false);
    
    // Test 3: With populate (as in API)
    console.log('\n=== TEST 3: With populate ===');
    const withPopulate = await Lecture.findOne({ title: /TEST SEDMIČNO/ })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
      .populate({
        path: 'organizationId',
        select: 'name',
        strictPopulate: false
      })
      .populate({
        path: 'daija',
        select: 'name title image',
        strictPopulate: false
      })
      .lean();
    console.log('isWeeklyLecture:', withPopulate?.isWeeklyLecture);
    console.log('Has field:', withPopulate ? 'isWeeklyLecture' in withPopulate : false);
    
    // Test 4: Check if field exists in schema
    console.log('\n=== TEST 4: Schema check ===');
    const schemaFields = Object.keys(Lecture.schema.paths);
    console.log('isWeeklyLecture in schema:', schemaFields.includes('isWeeklyLecture'));
    console.log('weekNumber in schema:', schemaFields.includes('weekNumber'));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

testSelectQuery();