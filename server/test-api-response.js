// Script to test the actual API response from lectures endpoint
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Lecture = require('./models/Lecture');
const Daija = require('./models/Daija');

async function testApiResponse() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Simulate the exact same query as the API endpoint
    console.log('\n🔍 Testing API endpoint query...');
    
    const currentDate = new Date();
    const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    console.log('📅 Current date:', currentDate.toISOString());
    console.log('📅 Start of today:', startOfToday.toISOString());
    
    // Execute the same query as the API
    const lectures = await Lecture.find({ 
      status: 'approved',
      date: { $gte: startOfToday }
    })
      .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
      .populate('organization', 'name')
      .populate('daija', 'name title')
      .sort({ date: 1 })
      .lean()
      .exec();

    console.log(`\n📊 API Query Results: Found ${lectures.length} lectures`);
    
    // Show detailed results
    lectures.forEach((lecture, index) => {
      console.log(`\n--- Lecture ${index + 1} ---`);
      console.log(`Title: ${lecture.title}`);
      console.log(`Status: ${lecture.status}`);
      console.log(`Date: ${lecture.date}`);
      console.log(`Raw daija field:`, lecture.daija);
      console.log(`Raw speaker field:`, lecture.speaker);
      
      // Test the transformation logic
      const transformedSpeaker = lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač';
      
      console.log(`Transformed speaker: ${transformedSpeaker}`);
    });

    // Test different date queries to understand the issue
    console.log('\n🔍 Testing different date queries:');
    
    // All approved lectures regardless of date
    const allApproved = await Lecture.find({ status: 'approved' })
      .populate('daija', 'name title')
      .sort({ date: 1 })
      .lean();
    
    console.log(`\n📊 All approved lectures: ${allApproved.length}`);
    allApproved.forEach((lecture, index) => {
      console.log(`  ${index + 1}. "${lecture.title}" - Date: ${lecture.date.toISOString().split('T')[0]} - Speaker: ${lecture.daija ? `${lecture.daija.title} ${lecture.daija.name}` : 'None'}`);
    });

    // Check if the date filter is causing issues
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() - 30); // 30 days ago
    
    const lecturesFromPast = await Lecture.find({ 
      status: 'approved',
      date: { $gte: futureDate }
    })
      .populate('daija', 'name title')
      .sort({ date: 1 })
      .lean();
    
    console.log(`\n📊 Lectures from last 30 days: ${lecturesFromPast.length}`);
    lecturesFromPast.forEach((lecture, index) => {
      console.log(`  ${index + 1}. "${lecture.title}" - Date: ${lecture.date.toISOString().split('T')[0]} - Speaker: ${lecture.daija ? `${lecture.daija.title} ${lecture.daija.name}` : 'None'}`);
    });

  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testApiResponse();