// Script to check lectures data in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Lecture = require('./models/Lecture');
const Daija = require('./models/Daija');

async function checkLecturesData() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check total number of lectures
    const totalLectures = await Lecture.countDocuments();
    console.log(`\n📊 Total lectures in database: ${totalLectures}`);

    // Check lectures with daija field populated
    const lecturesWithDaija = await Lecture.countDocuments({ daija: { $exists: true, $ne: null } });
    console.log(`🎤 Lectures with daija field: ${lecturesWithDaija}`);

    // Check lectures without daija field
    const lecturesWithoutDaija = await Lecture.countDocuments({ 
      $or: [
        { daija: { $exists: false } },
        { daija: null }
      ]
    });
    console.log(`❌ Lectures without daija field: ${lecturesWithoutDaija}`);

    // Show sample lectures with daija populated
    if (lecturesWithDaija > 0) {
      console.log('\n🔍 Sample lectures with daija:');
      const samplesWithDaija = await Lecture.find({ daija: { $exists: true, $ne: null } })
        .populate('daija', 'name title')
        .limit(5)
        .select('title daija date status');
      
      samplesWithDaija.forEach((lecture, index) => {
        console.log(`  ${index + 1}. "${lecture.title}" - Speaker: ${lecture.daija?.title} ${lecture.daija?.name} (${lecture.status})`);
      });
    }

    // Show sample lectures without daija
    if (lecturesWithoutDaija > 0) {
      console.log('\n🔍 Sample lectures without daija:');
      const samplesWithoutDaija = await Lecture.find({ 
        $or: [
          { daija: { $exists: false } },
          { daija: null }
        ]
      })
        .limit(5)
        .select('title daija date status');
      
      samplesWithoutDaija.forEach((lecture, index) => {
        console.log(`  ${index + 1}. "${lecture.title}" - Speaker: ${lecture.daija || 'None'} (${lecture.status})`);
      });
    }

    // Check total number of daije (speakers)
    const totalDaije = await Daija.countDocuments();
    console.log(`\n👨‍🏫 Total speakers (daije) in database: ${totalDaije}`);

    // Show approved speakers
    const approvedDaije = await Daija.countDocuments({ status: 'approved' });
    console.log(`✅ Approved speakers: ${approvedDaije}`);

    if (approvedDaije > 0) {
      console.log('\n🔍 Sample approved speakers:');
      const sampleDaije = await Daija.find({ status: 'approved' })
        .limit(5)
        .select('name title status');
      
      sampleDaije.forEach((daija, index) => {
        console.log(`  ${index + 1}. ${daija.title} ${daija.name} (${daija.status})`);
      });
    }

    // Check lectures by status
    console.log('\n📈 Lectures by status:');
    const statusCounts = await Lecture.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });

    // Check if there are any approved lectures with approved speakers
    const approvedLecturesWithSpeakers = await Lecture.find({
      status: 'approved',
      daija: { $exists: true, $ne: null }
    })
    .populate({
      path: 'daija',
      match: { status: 'approved' },
      select: 'name title status'
    })
    .select('title daija date status');

    const validApprovedLectures = approvedLecturesWithSpeakers.filter(lecture => lecture.daija);

    console.log(`\n🎯 Approved lectures with approved speakers: ${validApprovedLectures.length}`);
    
    if (validApprovedLectures.length > 0) {
      console.log('\n🔍 Sample approved lectures with approved speakers:');
      validApprovedLectures.slice(0, 5).forEach((lecture, index) => {
        console.log(`  ${index + 1}. "${lecture.title}" - Speaker: ${lecture.daija.title} ${lecture.daija.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkLecturesData();