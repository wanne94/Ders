const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import the Lecture model
const Lecture = require('../server/models/Lecture');

async function testDirectQuery() {
  try {
    console.log('🔍 Testing direct database query...\n');
    
    // 1. Test with findOne
    console.log('1️⃣ Testing findOne with lean()...');
    const singleLecture = await Lecture.findOne({ 
      title: { $regex: /Ramazan.*Mjesec.*Posta/i } 
    }).lean();
    
    if (singleLecture) {
      console.log('✅ Found lecture:', {
        title: singleLecture.title,
        isWeeklyLecture: singleLecture.isWeeklyLecture,
        weekNumber: singleLecture.weekNumber,
        totalWeeks: singleLecture.totalWeeks,
        hasFields: {
          isWeeklyLecture: 'isWeeklyLecture' in singleLecture,
          weekNumber: 'weekNumber' in singleLecture,
          totalWeeks: 'totalWeeks' in singleLecture
        }
      });
      console.log('All fields:', Object.keys(singleLecture));
    } else {
      console.log('❌ No lecture found');
    }
    
    // 2. Test with find and specific select
    console.log('\n2️⃣ Testing find with specific select...');
    const selectLectures = await Lecture.find({ 
      title: { $regex: /Ramazan.*Mjesec.*Posta/i } 
    }).select('title isWeeklyLecture weekNumber totalWeeks').lean();
    
    console.log(`Found ${selectLectures.length} lectures with select`);
    selectLectures.forEach((lecture, i) => {
      console.log(`Lecture ${i + 1}:`, lecture);
    });
    
    // 3. Test without lean()
    console.log('\n3️⃣ Testing without lean()...');
    const nonLeanLecture = await Lecture.findOne({ 
      title: { $regex: /Ramazan.*Mjesec.*Posta/i } 
    });
    
    if (nonLeanLecture) {
      const obj = nonLeanLecture.toObject();
      console.log('Document as object:', {
        title: obj.title,
        isWeeklyLecture: obj.isWeeklyLecture,
        weekNumber: obj.weekNumber,
        totalWeeks: obj.totalWeeks
      });
    }
    
    // 4. Test raw MongoDB query
    console.log('\n4️⃣ Testing raw MongoDB query...');
    const collection = mongoose.connection.db.collection('lectures');
    const rawLecture = await collection.findOne({ 
      title: { $regex: /Ramazan.*Mjesec.*Posta/i } 
    });
    
    if (rawLecture) {
      console.log('Raw document:', {
        title: rawLecture.title,
        isWeeklyLecture: rawLecture.isWeeklyLecture,
        weekNumber: rawLecture.weekNumber,
        totalWeeks: rawLecture.totalWeeks
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testDirectQuery();