const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.development' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ders:ders@194.163.176.171:27017/Predavanja?authSource=admin';

async function fixOrganization() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get Organization model
    const Organization = require('./models/Organization');
    
    // Find all organizations with "Savjet" in name
    const organizations = await Organization.find({ 
      name: { $regex: /Savjet/i }
    });
    
    console.log(`\n📊 Found ${organizations.length} organizations with "Savjet" in name:`);
    
    for (const org of organizations) {
      console.log(`\n📋 Organization:`);
      console.log(`  ID: ${org._id}`);
      console.log(`  Name: ${org.name}`);
      console.log(`  Status: ${org.status}`);
      console.log(`  Type: ${org.type}`);
      
      if (org.status !== 'approved') {
        console.log(`\n🔄 Updating status to 'approved'...`);
        org.status = 'approved';
        await org.save();
        console.log(`✅ Organization "${org.name}" has been approved!`);
      } else {
        console.log(`ℹ️ Organization is already approved`);
      }
    }
    
    // Also check for exact name
    const ugSavjet = await Organization.findOne({ 
      name: 'U.G. Savjet'
    });
    
    if (ugSavjet && ugSavjet.status !== 'approved') {
      console.log(`\n🔄 Found exact match "U.G. Savjet" - updating status...`);
      ugSavjet.status = 'approved';
      await ugSavjet.save();
      console.log(`✅ "U.G. Savjet" has been approved!`);
    }
    
    console.log('\n✅ All organizations processed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
console.log('🚀 Starting organization fix...\n');
fixOrganization();