const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');

async function quickCheck() {
  try {
    await mongoose.connect("mongodb://avdoAdmin:WanNeAvdo1994@localhost:27018/Predavanja?authSource=admin");
    
    // Check what public endpoint should return
    const publicFilter = { status: { $in: ['approved', 'cancelled'] } };
    const publicLectures = await Lecture.find(publicFilter).select('title status isCancelled');
    
    console.log('Total with public filter:', publicLectures.length);
    console.log('Cancelled in public filter:', publicLectures.filter(l => l.status === 'cancelled').length);
    
    // Show all unique statuses
    const statuses = [...new Set(publicLectures.map(l => l.status))];
    console.log('Unique statuses found:', statuses);
    
    // Check specifically for 'cancelled' status
    const cancelledOnly = await Lecture.find({ status: 'cancelled' }).select('title status isCancelled');
    console.log('\nDirect query for status="cancelled":', cancelledOnly.length);
    if (cancelledOnly.length > 0) {
      console.log('Sample:', cancelledOnly[0]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

quickCheck();