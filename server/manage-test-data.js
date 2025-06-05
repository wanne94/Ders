const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/predavanja';

// Import models
const Lecture = require('./models/Lecture');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Daija = require('./models/Daija');

// Test data generators
const generateTestOrganizations = () => {
  const organizations = [];
  const cities = ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina', 'Prijedor', 'Trebinje', 'Cazin', 'Gradačac'];
  const orgTypes = ['Islamska zajednica', 'Medresa', 'Kulturno društvo', 'Obrazovna institucija', 'Vjerska organizacija'];
  
  for (let i = 1; i <= 30; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const orgType = orgTypes[Math.floor(Math.random() * orgTypes.length)];
    
    organizations.push({
      name: `${orgType} ${city} ${i}`,
      description: `Opis ${orgType.toLowerCase()} u ${city}. Organizacija osnovana za promoviranje islamskih vrijednosti i obrazovanja.`,
      address: `Ulica ${i}, ${city}`,
      city: city,
      facebook: `https://facebook.com/org${i}`,
      instagram: `https://instagram.com/org${i}`,
      telegram: `@org${i}`,
      viber: `+387 6${String(i).padStart(2, '0')} ${String(Math.floor(Math.random() * 900000) + 100000)}`,
      status: Math.random() > 0.2 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'rejected'
    });
  }
  
  return organizations;
};

const generateTestDaije = () => {
  const daije = [];
  const firstNames = [
    'Ahmed', 'Muhamed', 'Ibrahim', 'Ismail', 'Yusuf', 'Omar', 'Ali', 'Hassan', 'Mustafa', 'Abdulah',
    'Enes', 'Emir', 'Amir', 'Kemal', 'Senad', 'Adnan', 'Faruk', 'Haris', 'Tarik', 'Nedim',
    'Safet', 'Mirsad', 'Elvir', 'Almir', 'Jasmin', 'Dženan', 'Rijad', 'Nihad', 'Samir', 'Eldin'
  ];
  
  const titles = ['prof', 'mr', 'dr'];
  const educationOptions = [
    'Fakultet islamskih nauka, Sarajevo',
    'Al-Azhar Univerzitet, Kairo',
    'Medina Univerzitet, Saudijska Arabija',
    'Gazi Husrev-begova medresa, Sarajevo',
    'Fakultet humanističkih nauka, Tuzla',
    'Islamski pedagoški fakultet, Zenica',
    'Univerzitet u Istanbulu, Turska'
  ];
  
  for (let i = 1; i <= 30; i++) {
    const firstName = firstNames[i - 1];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const birthYear = 1950 + Math.floor(Math.random() * 50);
    const education = [];
    
    // Add 1-3 education entries
    const numEducation = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numEducation; j++) {
      const edu = educationOptions[Math.floor(Math.random() * educationOptions.length)];
      if (!education.includes(edu)) {
        education.push(edu);
      }
    }
    
    daije.push({
      firstName: `${firstName} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}. ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
      title: title,
      dateOfBirth: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      biography: `${title} ${firstName} je poznati islamski učenjak i predavač. Završio je studije na prestižnim islamskim univerzitetima i ima dugogodišnje iskustvo u radu sa mladima. Specijalizovan je za oblast islamske etike i duhovnosti.`,
      shortDescription: `Islamski učenjak specijalizovan za ${Math.random() > 0.5 ? 'Kur\'an i hadis' : 'islamsku etiku i duhovnost'}`,
      education: education,
      status: Math.random() > 0.2 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'rejected'
    });
  }
  
  return daije;
};

const generateTestLectures = (organizations, daije, testUser) => {
  const lectures = [];
  const topics = [
    'Značaj namaza u životu muslimana',
    'Islamska etika u modernom društvu',
    'Kur\'anske vrijednosti i porodica',
    'Duhovnost u islamu',
    'Islamsko obrazovanje mladih',
    'Hadisi Poslanika s.a.v.s.',
    'Islamska historija Bosne',
    'Ramazan i post',
    'Hađ - putovanje života',
    'Islamska umjetnost i kultura',
    'Tolerancija u islamu',
    'Islamska ekonomija',
    'Žena u islamu',
    'Islamska psihologija',
    'Kur\'anska egzegeza'
  ];
  
  const cities = ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina', 'Prijedor', 'Trebinje', 'Cazin', 'Gradačac'];
  
  for (let i = 1; i <= 30; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const organization = organizations[Math.floor(Math.random() * organizations.length)];
    const daija = daije[Math.floor(Math.random() * daije.length)];
    
    // Generate future date (next 6 months)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 180) + 1);
    
    const hour = Math.floor(Math.random() * 6) + 17; // 17:00 - 22:00
    const minute = Math.random() > 0.5 ? '00' : '30';
    
    lectures.push({
      title: `${topic} ${i}`,
      speaker: daija.firstName,
      daija: daija._id,
      organization: organization.name,
      organizationId: organization._id,
      address: `${organization.address}, ${organization.city}`,
      city: city,
      date: futureDate,
      time: `${hour}:${minute}`,
      shortDescription: `Kratko predavanje o temi: ${topic.toLowerCase()}`,
      description: `Detaljno predavanje o temi "${topic}". Predavač će objasniti ključne aspekte ove teme kroz prizmu islamskih učenja i savremenih izazova. Predavanje je namijenjeno svim uzrastima i pruža priliku za dublje razumijevanje islamskih vrijednosti.`,
      status: Math.random() > 0.3 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'rejected',
      createdBy: testUser._id
    });
  }
  
  return lectures;
};

async function populateTestData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Create or get test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('🔧 Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        securityQuestionIndex: 0,
        securityAnswer: 'test',
        role: 'admin'
      });
      await testUser.save();
      console.log('✅ Test user created');
    }
    
    // 1. Populate Organizations
    console.log('\n📊 POPULATING ORGANIZATIONS:');
    console.log('='.repeat(50));
    
    const organizationsData = generateTestOrganizations();
    const savedOrganizations = await Organization.insertMany(organizationsData);
    console.log(`✅ Created ${savedOrganizations.length} test organizations`);
    
    // 2. Populate Daije
    console.log('\n📊 POPULATING DAIJE:');
    console.log('='.repeat(50));
    
    const daijeData = generateTestDaije();
    const savedDaije = await Daija.insertMany(daijeData);
    console.log(`✅ Created ${savedDaije.length} test daije`);
    
    // 3. Populate Lectures
    console.log('\n📊 POPULATING LECTURES:');
    console.log('='.repeat(50));
    
    const lecturesData = generateTestLectures(savedOrganizations, savedDaije, testUser);
    const savedLectures = await Lecture.insertMany(lecturesData);
    console.log(`✅ Created ${savedLectures.length} test lectures`);
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Organizations: ${savedOrganizations.length}`);
    console.log(`Daije: ${savedDaije.length}`);
    console.log(`Lectures: ${savedLectures.length}`);
    console.log(`Total records: ${savedOrganizations.length + savedDaije.length + savedLectures.length}`);
    
    // Status breakdown
    const orgStats = await Organization.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const daijaStats = await Daija.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const lectureStats = await Lecture.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 STATUS BREAKDOWN:');
    console.log('='.repeat(50));
    console.log('Organizations:');
    orgStats.forEach(stat => console.log(`  ${stat._id}: ${stat.count}`));
    console.log('Daije:');
    daijaStats.forEach(stat => console.log(`  ${stat._id}: ${stat.count}`));
    console.log('Lectures:');
    lectureStats.forEach(stat => console.log(`  ${stat._id}: ${stat.count}`));
    
    console.log('\n🎉 Test data populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
  }
}

async function deleteTestData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🗑️ DELETING TEST DATA:');
    console.log('='.repeat(50));
    
    // Count before deletion
    const beforeCounts = {
      organizations: await Organization.countDocuments(),
      daije: await Daija.countDocuments(),
      lectures: await Lecture.countDocuments(),
      users: await User.countDocuments()
    };
    
    console.log('Before deletion:');
    console.log(`  Organizations: ${beforeCounts.organizations}`);
    console.log(`  Daije: ${beforeCounts.daije}`);
    console.log(`  Lectures: ${beforeCounts.lectures}`);
    console.log(`  Users: ${beforeCounts.users}`);
    
    // Delete test data (improved patterns to catch all test data)
    const lectureResult = await Lecture.deleteMany({
      $or: [
        { title: { $regex: /^Test Predavanje/ } },
        { title: { $regex: /Značaj namaza|Islamska etika|Kur'anske vrijednosti|Duhovnost u islamu|Islamsko obrazovanje|Hadisi Poslanika|Islamska historija|Ramazan i post|Hađ - putovanje|Islamska umjetnost|Tolerancija u islamu|Islamska ekonomija|Žena u islamu|Islamska psihologija|Kur'anska egzegeza/ } },
        { description: { $regex: /Detaljno predavanje o temi/ } }
      ]
    });
    
    const orgResult = await Organization.deleteMany({
      $or: [
        { name: { $regex: /Test Organization/ } },
        { name: { $regex: /Islamska zajednica.*[0-9]|Medresa.*[0-9]|Kulturno društvo.*[0-9]|Obrazovna institucija.*[0-9]|Vjerska organizacija.*[0-9]/ } },
        { description: { $regex: /Organizacija osnovana za promoviranje islamskih vrijednosti i obrazovanja/ } }
      ]
    });
    
    const daijaResult = await Daija.deleteMany({
      $or: [
        { firstName: { $regex: /Ahmed.*[A-Z]\.|Muhamed.*[A-Z]\.|Ibrahim.*[A-Z]\.|Ismail.*[A-Z]\.|Yusuf.*[A-Z]\.|Omar.*[A-Z]\.|Ali.*[A-Z]\.|Hassan.*[A-Z]\.|Mustafa.*[A-Z]\.|Abdulah.*[A-Z]\./ } },
        { firstName: { $regex: /Enes.*[A-Z]\.|Emir.*[A-Z]\.|Amir.*[A-Z]\.|Kemal.*[A-Z]\.|Senad.*[A-Z]\.|Adnan.*[A-Z]\.|Faruk.*[A-Z]\.|Haris.*[A-Z]\.|Tarik.*[A-Z]\.|Nedim.*[A-Z]\./ } },
        { firstName: { $regex: /Safet.*[A-Z]\.|Mirsad.*[A-Z]\.|Elvir.*[A-Z]\.|Almir.*[A-Z]\.|Jasmin.*[A-Z]\.|Dženan.*[A-Z]\.|Rijad.*[A-Z]\.|Nihad.*[A-Z]\.|Samir.*[A-Z]\.|Eldin.*[A-Z]\./ } },
        { biography: { $regex: /je poznati islamski učenjak i predavač/ } }
      ]
    });
    
    // Optionally delete test user
    const userResult = await User.deleteMany({ email: 'test@example.com' });
    
    console.log('\nDeletion results:');
    console.log(`  Lectures deleted: ${lectureResult.deletedCount}`);
    console.log(`  Organizations deleted: ${orgResult.deletedCount}`);
    console.log(`  Daije deleted: ${daijaResult.deletedCount}`);
    console.log(`  Test users deleted: ${userResult.deletedCount}`);
    
    // Count after deletion
    const afterCounts = {
      organizations: await Organization.countDocuments(),
      daije: await Daija.countDocuments(),
      lectures: await Lecture.countDocuments(),
      users: await User.countDocuments()
    };
    
    console.log('\nAfter deletion:');
    console.log(`  Organizations: ${afterCounts.organizations}`);
    console.log(`  Daije: ${afterCounts.daije}`);
    console.log(`  Lectures: ${afterCounts.lectures}`);
    console.log(`  Users: ${afterCounts.users}`);
    
    console.log('\n🎉 Test data deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting test data:', error);
  }
}

async function showStats() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    console.log('\n📊 CURRENT DATABASE STATISTICS:');
    console.log('='.repeat(50));
    
    const counts = {
      organizations: await Organization.countDocuments(),
      daije: await Daija.countDocuments(),
      lectures: await Lecture.countDocuments(),
      users: await User.countDocuments()
    };
    
    console.log(`Organizations: ${counts.organizations}`);
    console.log(`Daije: ${counts.daije}`);
    console.log(`Lectures: ${counts.lectures}`);
    console.log(`Users: ${counts.users}`);
    console.log(`Total records: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
    
    // Status breakdown only if collections have data
    if (counts.organizations > 0) {
      const orgStats = await Organization.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📈 ORGANIZATION STATUS BREAKDOWN:');
      console.log('-'.repeat(30));
      if (orgStats.length > 0) {
        orgStats.forEach(stat => console.log(`  ${stat._id}: ${stat.count}`));
      } else {
        console.log('  No organizations found');
      }
    }
    
    if (counts.daije > 0) {
      const daijaStats = await Daija.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📈 DAIJE STATUS BREAKDOWN:');
      console.log('-'.repeat(30));
      if (daijaStats.length > 0) {
        daijaStats.forEach(stat => console.log(`  ${stat._id}: ${stat.count}`));
      } else {
        console.log('  No daije found');
      }
    }
    
    if (counts.lectures > 0) {
      const lectureStats = await Lecture.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📈 LECTURE STATUS BREAKDOWN:');
      console.log('-'.repeat(30));
      if (lectureStats.length > 0) {
        lectureStats.forEach(stat => console.log(`  ${stat._id}: ${stat.count}`));
      } else {
        console.log('  No lectures found');
      }
    }
    
    if (Object.values(counts).every(count => count === 0)) {
      console.log('\n💡 Database is empty. Use "populate" command to add test data.');
    }
    
  } catch (error) {
    console.error('❌ Error showing stats:', error);
  }
}

// Main function to handle command line arguments
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'populate':
        await populateTestData();
        break;
      case 'delete':
        await deleteTestData();
        break;
      case 'stats':
        await showStats();
        break;
      default:
        console.log('🔧 MANAGE TEST DATA SCRIPT');
        console.log('='.repeat(50));
        console.log('Usage:');
        console.log('  node manage-test-data.js populate  - Add 30 test entries for each collection');
        console.log('  node manage-test-data.js delete    - Delete all test data');
        console.log('  node manage-test-data.js stats     - Show current database statistics');
        console.log('');
        console.log('Examples:');
        console.log('  node manage-test-data.js populate');
        console.log('  node manage-test-data.js delete');
        console.log('  node manage-test-data.js stats');
    }
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main(); 