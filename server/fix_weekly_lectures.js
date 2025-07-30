const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.development' });

const Lecture = require('./models/Lecture');

async function fixWeeklyLectures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all test lectures
    const testLectures = await Lecture.find({ 
      title: { $regex: /TEST/i } 
    });
    
    console.log(`Found ${testLectures.length} test lectures\n`);
    
    for (const lecture of testLectures) {
      console.log(`Updating: ${lecture.title}`);
      console.log(`  Current isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      
      // Update to make it weekly
      const result = await Lecture.updateOne(
        { _id: lecture._id },
        { 
          $set: {
            isWeeklyLecture: true,
            weekNumber: 1,
            totalWeeks: 4,
            weeklySeriesId: `WL_TEST_${Date.now()}_${lecture._id}`
          }
        }
      );
      
      console.log(`  Updated: ${result.modifiedCount} document(s)\n`);
    }
    
    // Verify the update
    console.log('\n=== VERIFICATION ===');
    const updatedLectures = await Lecture.find({ 
      title: { $regex: /TEST/i } 
    }).select('title isWeeklyLecture weekNumber totalWeeks');
    
    updatedLectures.forEach(lecture => {
      console.log(`${lecture.title}:`);
      console.log(`  isWeeklyLecture: ${lecture.isWeeklyLecture}`);
      console.log(`  weekNumber: ${lecture.weekNumber}`);
      console.log(`  totalWeeks: ${lecture.totalWeeks}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

fixWeeklyLectures();