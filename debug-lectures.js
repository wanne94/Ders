const mongoose = require('./server/node_modules/mongoose');
require('dotenv').config({ path: './server/.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/predavanje');

// Define Lecture model (minimal version)
const LectureSchema = new mongoose.Schema({
  title: String,
  status: String,
  date: String,
  speaker: String,
  organization: String,
  createdAt: Date
});

const Lecture = mongoose.model('Lecture', LectureSchema, 'lectures');

async function debugLectures() {
  console.log('🔍 DEBUG: Analiziram predavanja u bazi podataka...\n');
  
  try {
    // Get all lectures
    const allLectures = await Lecture.find({}).select('title status date speaker organization createdAt').lean();
    console.log(`📊 UKUPNO PREDAVANJA U BAZI: ${allLectures.length}\n`);
    
    // Group by status
    const statusGroups = {};
    allLectures.forEach(lecture => {
      const status = lecture.status || 'undefined';
      statusGroups[status] = (statusGroups[status] || 0) + 1;
    });
    
    console.log('📈 PREDAVANJA PO STATUSU:');
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
    console.log('');
    
    // Get approved lectures only
    const approvedLectures = await Lecture.find({ status: 'approved' }).select('title date speaker organization createdAt').lean();
    console.log(`✅ ODOBRENA PREDAVANJA: ${approvedLectures.length}\n`);
    
    if (approvedLectures.length === 0) {
      console.log('❌ PROBLEM: Nema odobrenih predavanja u bazi!');
      return;
    }
    
    // Analyze by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureLectures = [];
    const pastLectures = [];
    const invalidDateLectures = [];
    
    approvedLectures.forEach(lecture => {
      if (!lecture.date) {
        invalidDateLectures.push(lecture);
        return;
      }
      
      const lectureDate = new Date(lecture.date);
      if (isNaN(lectureDate.getTime())) {
        invalidDateLectures.push(lecture);
        return;
      }
      
      lectureDate.setHours(0, 0, 0, 0);
      
      if (lectureDate >= today) {
        futureLectures.push(lecture);
      } else {
        pastLectures.push(lecture);
      }
    });
    
    console.log('📅 ODOBRENA PREDAVANJA PO DATUMU:');
    console.log(`  - Buduća predavanja: ${futureLectures.length}`);
    console.log(`  - Prošla predavanja: ${pastLectures.length}`);
    console.log(`  - Neispravni datumi: ${invalidDateLectures.length}\n`);
    
    if (pastLectures.length > 0) {
      console.log('🕰️ PROŠLA ODOBRENA PREDAVANJA (poslednja 5):');
      pastLectures
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .forEach(lecture => {
          console.log(`  - "${lecture.title}" | ${lecture.date} | ${lecture.speaker || 'N/A'}`);
        });
      console.log('');
    } else {
      console.log('❌ PROBLEM: Nema prošlih odobrenih predavanja u bazi!\n');
    }
    
    if (futureLectures.length > 0) {
      console.log('🔮 BUDUĆA ODOBRENA PREDAVANJA (prvo 5):');
      futureLectures
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
        .forEach(lecture => {
          console.log(`  - "${lecture.title}" | ${lecture.date} | ${lecture.speaker || 'N/A'}`);
        });
      console.log('');
    }
    
    if (invalidDateLectures.length > 0) {
      console.log('⚠️ PREDAVANJA SA NEISPRAVNIM DATUMIMA:');
      invalidDateLectures.forEach(lecture => {
        console.log(`  - "${lecture.title}" | Date: ${lecture.date} | ID: ${lecture._id}`);
      });
      console.log('');
    }
    
    // Test the same query that backend uses
    console.log('🧪 TESTIRANJE BACKEND QUERY...');
    const backendQuery = await Lecture.find({ status: 'approved' })
      .select('title speaker date status')
      .lean();
    
    console.log(`🎯 BACKEND QUERY REZULTAT: ${backendQuery.length} predavanja`);
    
    if (backendQuery.length > 0) {
      console.log('✅ Backend query radi ispravno i vraća odobrena predavanja');
      console.log('\n📋 SVA ODOBRENA PREDAVANJA:');
      backendQuery.forEach((lecture, index) => {
        console.log(`  ${index + 1}. "${lecture.title}" | ${lecture.date} | Status: ${lecture.status} | ID: ${lecture._id}`);
      });
    } else {
      console.log('❌ PROBLEM: Backend query ne vraća nijedano predavanje!');
    }
    
    // Test exact backend endpoint logic without populate
    console.log('\n🎭 TESTIRANJE BACKEND QUERY BEZ POPULATE...');
    const queryWithoutPopulate = await Lecture.find({ status: 'approved' })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
      .lean();
    
    console.log(`🎯 QUERY BEZ POPULATE REZULTAT: ${queryWithoutPopulate.length} predavanja`);
    
    if (queryWithoutPopulate.length > 0) {
      console.log('\n📋 REZULTAT QUERY BEZ POPULATE (prvo 3):');
      queryWithoutPopulate.slice(0, 3).forEach((lecture, index) => {
        console.log(`  ${index + 1}. "${lecture.title}" | ${lecture.date} | Daija ID: ${lecture.daija || 'null'} | Org ID: ${lecture.organizationId || 'null'}`);
      });
    }
    
    // Test with safe populate
    console.log('\n🎭 TESTIRANJE SA SIGURNIM POPULATE...');
    try {
      const safeQuery = await Lecture.find({ status: 'approved' })
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
        .populate({
          path: 'organizationId',
          select: 'name',
          strictPopulate: false
        })
        .populate({
          path: 'daija',
          select: 'name title image',
          strictPopulate: false
        })
        .lean();
      
      console.log(`🎯 SIGURNI POPULATE REZULTAT: ${safeQuery.length} predavanja`);
      
      if (safeQuery.length > 0) {
        console.log('\n📋 REZULTAT SIGURNOG POPULATE (prvo 3):');
        safeQuery.slice(0, 3).forEach((lecture, index) => {
          console.log(`  ${index + 1}. "${lecture.title}" | ${lecture.date} | Has populated daija: ${!!lecture.daija} | Has populated org: ${!!lecture.organizationId}`);
        });
      }
    } catch (populateError) {
      console.log('❌ Populate error:', populateError.message);
    }
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('\n🏁 Debug završen');
  }
}

debugLectures();