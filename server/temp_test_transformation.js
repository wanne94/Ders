// Test script to debug the transformation issue
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

async function testTransformation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Lecture = require('./models/Lecture');
    
    // Find the test lecture with lean()
    const lectureWithLean = await Lecture.findOne({ 
      title: /Ramazan.*Sedmica/i 
    }).lean();
    
    console.log('\n🔍 Lecture with lean():');
    console.log('Title:', lectureWithLean?.title);
    console.log('isWeeklyLecture:', lectureWithLean?.isWeeklyLecture);
    console.log('weekNumber:', lectureWithLean?.weekNumber);
    console.log('totalWeeks:', lectureWithLean?.totalWeeks);
    console.log('weeklySeriesId:', lectureWithLean?.weeklySeriesId);
    
    // Test the transformation
    if (lectureWithLean) {
      const transformed = {
        ...lectureWithLean,
        daijaId: lectureWithLean.daija ? lectureWithLean.daija._id : null,
        speaker: lectureWithLean.daija && lectureWithLean.daija.title && lectureWithLean.daija.name 
          ? `${lectureWithLean.daija.title} ${lectureWithLean.daija.name}`.trim()
          : lectureWithLean.speaker || 'Nepoznat predavač',
        // Explicitly include weekly lecture fields
        isWeeklyLecture: lectureWithLean.isWeeklyLecture,
        weekNumber: lectureWithLean.weekNumber,
        totalWeeks: lectureWithLean.totalWeeks,
        weeklySeriesId: lectureWithLean.weeklySeriesId
      };
      
      console.log('\n📋 After transformation:');
      console.log('isWeeklyLecture:', transformed.isWeeklyLecture);
      console.log('weekNumber:', transformed.weekNumber);
      console.log('totalWeeks:', transformed.totalWeeks);
      console.log('weeklySeriesId:', transformed.weeklySeriesId);
      
      // Check if fields exist in transformed object
      console.log('\n🔍 Field existence check:');
      console.log('Has isWeeklyLecture:', 'isWeeklyLecture' in transformed);
      console.log('Has weekNumber:', 'weekNumber' in transformed);
      console.log('Has totalWeeks:', 'totalWeeks' in transformed);
      console.log('Has weeklySeriesId:', 'weeklySeriesId' in transformed);
      
      // Check object keys
      const keys = Object.keys(transformed);
      console.log('\n📋 All keys in transformed object:');
      console.log(keys.filter(key => key.includes('week') || key.includes('Week')));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testTransformation();