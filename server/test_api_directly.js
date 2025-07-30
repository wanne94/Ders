const axios = require('axios');

async function testAPI() {
  try {
    console.log('🚀 Testing API directly...');
    
    const response = await axios.get('http://localhost:5003/api/lectures/public');
    console.log('✅ API responded with', response.data.length, 'lectures');
    
    // Find Ramazan lecture
    const ramazanLecture = response.data.find(l => l.title && l.title.includes('Ramazan'));
    if (ramazanLecture) {
      console.log('\n🔍 Ramazan lecture from API:');
      console.log('Title:', ramazanLecture.title);
      console.log('isWeeklyLecture:', ramazanLecture.isWeeklyLecture);
      console.log('weekNumber:', ramazanLecture.weekNumber);
      console.log('totalWeeks:', ramazanLecture.totalWeeks);
      console.log('weeklySeriesId:', ramazanLecture.weeklySeriesId);
      console.log('Has isWeeklyLecture field:', 'isWeeklyLecture' in ramazanLecture);
      
      // Check all fields
      const allFields = Object.keys(ramazanLecture);
      console.log('\nAll fields in response:', allFields);
      
      // Check for any weekly-related fields
      const weeklyFields = allFields.filter(f => f.toLowerCase().includes('week') || f.toLowerCase().includes('weekly'));
      console.log('Weekly-related fields found:', weeklyFields);
    } else {
      console.log('❌ No Ramazan lecture found');
    }
    
    // Count weekly lectures
    const weeklyLectures = response.data.filter(l => l.isWeeklyLecture === true);
    console.log('\n📊 Weekly lectures found:', weeklyLectures.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();