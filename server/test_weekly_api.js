// Direct test of API transformation
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.development' });
const Lecture = require('./models/Lecture');
const Organization = require('./models/Organization');
const Daija = require('./models/Daija');

async function testAPITransform() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Exact query from API
    const lectures = await Lecture.find({ status: { $in: ['approved', 'cancelled'] } })
      .select('title speaker daija organization organizationId address city date time shortDescription image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
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
      .lean()
      .exec();
      
    console.log(`\n📋 Total lectures: ${lectures.length}`);
    
    // Find test lecture
    const testLecture = lectures.find(l => l.title && l.title.includes('TEST SEDMIČNO'));
    
    if (testLecture) {
      console.log('\n🎯 Found test lecture BEFORE transform:');
      console.log('Keys:', Object.keys(testLecture));
      console.log('isWeeklyLecture:', testLecture.isWeeklyLecture);
      
      // Apply same transformation as API
      const transformed = {
        ...testLecture,
        daijaId: testLecture.daija ? testLecture.daija._id : null,
        speaker: testLecture.daija && testLecture.daija.title && testLecture.daija.name 
          ? `${testLecture.daija.title} ${testLecture.daija.name}`.trim()
          : testLecture.speaker || 'Nepoznat predavač'
      };
      
      console.log('\n🔄 AFTER transform:');
      console.log('Keys:', Object.keys(transformed));
      console.log('isWeeklyLecture:', transformed.isWeeklyLecture);
      console.log('Has isWeeklyLecture:', 'isWeeklyLecture' in transformed);
      
      // Try explicit assignment
      const explicit = {
        ...testLecture,
        daijaId: testLecture.daija ? testLecture.daija._id : null,
        speaker: testLecture.daija && testLecture.daija.title && testLecture.daija.name 
          ? `${testLecture.daija.title} ${testLecture.daija.name}`.trim()
          : testLecture.speaker || 'Nepoznat predavač',
        isWeeklyLecture: testLecture.isWeeklyLecture,
        weekNumber: testLecture.weekNumber,
        totalWeeks: testLecture.totalWeeks,
        weeklySeriesId: testLecture.weeklySeriesId
      };
      
      console.log('\n🎯 With EXPLICIT assignment:');
      console.log('isWeeklyLecture:', explicit.isWeeklyLecture);
      
      // JSON test
      console.log('\n📤 JSON.stringify result:');
      const json = JSON.stringify(explicit);
      const parsed = JSON.parse(json);
      console.log('isWeeklyLecture after JSON:', parsed.isWeeklyLecture);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testAPITransform();