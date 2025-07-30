require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');

async function testRawMongoose() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Find with lean()
    console.log('\n📊 Test 1: Finding lectures with lean()...');
    const lecturesLean = await Lecture.find({ 
      title: { $regex: /Ramazan/i } 
    })
    .select('title isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
    .lean();
    
    console.log(`Found ${lecturesLean.length} Ramazan lectures with lean()`);
    if (lecturesLean.length > 0) {
      console.log('First lecture (lean):', JSON.stringify(lecturesLean[0], null, 2));
    }
    
    // Test 2: Find without lean()
    console.log('\n📊 Test 2: Finding lectures without lean()...');
    const lecturesDoc = await Lecture.find({ 
      title: { $regex: /Ramazan/i } 
    })
    .select('title isWeeklyLecture weekNumber totalWeeks weeklySeriesId');
    
    console.log(`Found ${lecturesDoc.length} Ramazan lectures without lean()`);
    if (lecturesDoc.length > 0) {
      const doc = lecturesDoc[0];
      console.log('First lecture (document):', {
        title: doc.title,
        isWeeklyLecture: doc.isWeeklyLecture,
        weekNumber: doc.weekNumber,
        totalWeeks: doc.totalWeeks,
        weeklySeriesId: doc.weeklySeriesId,
        hasWeeklyField: doc.schema.paths.hasOwnProperty('isWeeklyLecture')
      });
      
      // Convert to object
      console.log('First lecture (toObject):', JSON.stringify(doc.toObject(), null, 2));
    }
    
    // Test 3: Direct MongoDB query
    console.log('\n📊 Test 3: Direct MongoDB query...');
    const collection = mongoose.connection.collection('lectures');
    const directResult = await collection.findOne({ 
      title: { $regex: /Ramazan/i } 
    });
    
    if (directResult) {
      console.log('Direct MongoDB result:', {
        title: directResult.title,
        isWeeklyLecture: directResult.isWeeklyLecture,
        weekNumber: directResult.weekNumber,
        totalWeeks: directResult.totalWeeks,
        weeklySeriesId: directResult.weeklySeriesId
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testRawMongoose();