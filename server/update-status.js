require('dotenv').config();
const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');
const Daija = require('./models/Daija');
const Organization = require('./models/Organization');

async function updateStatuses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/predavanje');
    console.log('✅ Connected to MongoDB');
    
    console.log('🔄 Updating lecture statuses from active to approved...');
    const lectureResult = await Lecture.updateMany(
      { status: 'active' }, 
      { status: 'approved' }
    );
    console.log(`✅ Updated ${lectureResult.modifiedCount} lectures`);
    
    console.log('🔄 Updating daija statuses from active to approved...');
    const daijaResult = await Daija.updateMany(
      { status: 'active' }, 
      { status: 'approved' }
    );
    console.log(`✅ Updated ${daijaResult.modifiedCount} daije`);
    
    console.log('🔄 Updating organization statuses from active to approved...');
    const orgResult = await Organization.updateMany(
      { status: 'active' }, 
      { status: 'approved' }
    );
    console.log(`✅ Updated ${orgResult.modifiedCount} organizations`);
    
    // Verify the changes
    const approvedLectures = await Lecture.countDocuments({ status: 'approved' });
    const approvedDaije = await Daija.countDocuments({ status: 'approved' });
    const approvedOrgs = await Organization.countDocuments({ status: 'approved' });
    
    console.log('\n📊 Final counts:');
    console.log(`Approved lectures: ${approvedLectures}`);
    console.log(`Approved daije: ${approvedDaije}`);
    console.log(`Approved organizations: ${approvedOrgs}`);
    
    console.log('\n🎉 Status update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating statuses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}
 