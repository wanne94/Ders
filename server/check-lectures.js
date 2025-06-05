const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/predavanja', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkLectures() {
  try {
    console.log('🔍 Checking lectures in database...\n');
    
    // Get all lectures
    const allLectures = await Lecture.find().sort({ date: 1 });
    console.log(`📊 Total lectures: ${allLectures.length}\n`);
    
    // Group by status
    const statusGroups = {};
    allLectures.forEach(lecture => {
      const status = lecture.status || 'undefined';
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(lecture);
    });
    
    console.log('📈 Lectures by status:');
    Object.keys(statusGroups).forEach(status => {
      console.log(`  ${status}: ${statusGroups[status].length}`);
    });
    console.log('');
    
    // Check dates
    const currentDate = new Date();
    const futureLectures = allLectures.filter(lecture => new Date(lecture.date) >= currentDate);
    const pastLectures = allLectures.filter(lecture => new Date(lecture.date) < currentDate);
    
    console.log('📅 Lectures by date:');
    console.log(`  Future lectures: ${futureLectures.length}`);
    console.log(`  Past lectures: ${pastLectures.length}`);
    console.log('');
    
    // Check approved future lectures (what public endpoint should return)
    const approvedFutureLectures = allLectures.filter(lecture =>
      lecture.status === 'approved' && new Date(lecture.date) >= currentDate
    );
    
    console.log(`🎯 Approved future lectures (public endpoint): ${approvedFutureLectures.length}\n`);
    
    // Show sample lectures
    console.log('📋 Sample lectures:');
    allLectures.slice(0, 5).forEach(lecture => {
      const date = new Date(lecture.date);
      const isPast = date < currentDate;
      console.log(`  - ${lecture.title}`);
      console.log(`    Status: ${lecture.status}`);
      console.log(`    Date: ${date.toLocaleDateString()} ${lecture.time} ${isPast ? '(PAST)' : '(FUTURE)'}`);
      console.log('');
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
}

checkLectures(); 