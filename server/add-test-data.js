const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/predavanja';

// Import models
const Lecture = require('./models/Lecture');
const User = require('./models/User');
const Organization = require('./models/Organization');

async function addTestData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check current data
    const currentLectures = await Lecture.countDocuments();
    console.log(`📊 Current lectures: ${currentLectures}`);
    
    if (currentLectures >= 50) {
      console.log('✅ Sufficient data already exists. No need to add test data.');
      return;
    }
    
    // Get or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('🔧 Creating test user...');
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        securityQuestionIndex: 0,
        securityAnswer: 'test'
      });
      await testUser.save();
      console.log('✅ Test user created');
    }
    
    // Get or create test organization
    let testOrg = await Organization.findOne({ name: 'Test Organization' });
    if (!testOrg) {
      console.log('🔧 Creating test organization...');
      testOrg = new Organization({
        name: 'Test Organization',
        description: 'Test organization for performance testing',
        city: 'Test City',
        status: 'approved'
      });
      await testOrg.save();
      console.log('✅ Test organization created');
    }
    
    // Generate test lectures
    console.log('🔧 Generating test lectures...');
    const testLectures = [];
    const statuses = ['approved', 'pending', 'rejected'];
    const cities = ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar'];
    
    for (let i = 0; i < 100; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 365)); // Random future date within a year
      
      const lecture = {
        title: `Test Predavanje ${i + 1}`,
        speaker: `Test Predavač ${i + 1}`,
        organization: testOrg.name,
        organizationId: testOrg._id,
        address: `Test Adresa ${i + 1}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        date: futureDate,
        time: `${Math.floor(Math.random() * 12) + 8}:00`, // Random time between 8:00 and 19:00
        shortDescription: `Kratki opis test predavanja ${i + 1}`,
        description: `Detaljan opis test predavanja ${i + 1}. Ovo je test podatak kreiran za optimizaciju performansi baze podataka.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdBy: testUser._id
      };
      
      testLectures.push(lecture);
    }
    
    // Insert test lectures in batches
    console.log('📊 Inserting test lectures...');
    const batchSize = 20;
    for (let i = 0; i < testLectures.length; i += batchSize) {
      const batch = testLectures.slice(i, i + batchSize);
      await Lecture.insertMany(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testLectures.length / batchSize)}`);
    }
    
    // Verify data
    const finalCount = await Lecture.countDocuments();
    const approvedCount = await Lecture.countDocuments({ status: 'approved' });
    const futureApprovedCount = await Lecture.countDocuments({ 
      status: 'approved', 
      date: { $gte: new Date() } 
    });
    
    console.log('\n📊 FINAL DATA STATISTICS:');
    console.log('='.repeat(50));
    console.log(`Total lectures: ${finalCount}`);
    console.log(`Approved lectures: ${approvedCount}`);
    console.log(`Future approved lectures: ${futureApprovedCount}`);
    
    console.log('\n🎉 Test data added successfully!');
    console.log('💡 Now MongoDB should use indexes for better performance.');
    console.log('🔧 Please run the performance test again.');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addTestData(); 