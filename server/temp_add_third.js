const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');

async function addThirdReport() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://avdoAdmin:WanNeAvdo1994@localhost:27018/Predavanja?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    const lectureId = '688916ca66771f787399a151';
    
    // Find the lecture
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      console.error('❌ Lecture not found');
      return;
    }
    
    console.log('📄 Found lecture:', lecture.title);
    console.log('📊 Current reports:', lecture.cancellationReports.length);
    console.log('❌ Currently cancelled:', lecture.isCancelled);
    
    // Add third report - this should trigger auto-cancellation
    const report3 = {
      userId: 'guest-' + Date.now() + '-3',  // Different guest user ID
      reportedAt: new Date(),
      ipAddress: '172.16.0.100',
      reason: 'Glavni predavač je potvrdio da neće moći doći',
      howFound: 'Direktno od predavača',
      additionalInfo: 'Predavač je javio da zbog zdravstvenih razloga mora otkazati sve nastupe ove sedmice'
    };
    
    lecture.cancellationReports.push(report3);
    
    // Check if we have 3 or more reports - auto-cancel
    if (lecture.cancellationReports.length >= 3) {
      lecture.isCancelled = true;
      lecture.cancelledAt = new Date();
      lecture.cancellationReason = 'Otkazano na osnovu prijava korisnika';
      lecture.status = 'cancelled';
      console.log('🚨 AUTO-CANCELLING LECTURE due to 3+ reports!');
    }
    
    await lecture.save();
    console.log('✅ Third report added successfully');
    console.log('📊 Total reports now:', lecture.cancellationReports.length);
    console.log('❌ Is cancelled:', lecture.isCancelled);
    console.log('📅 Cancelled at:', lecture.cancelledAt);
    console.log('📝 Cancellation reason:', lecture.cancellationReason);
    console.log('🏷️ Status:', lecture.status);
    
  } catch (error) {
    console.error('🔴 Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
addThirdReport();