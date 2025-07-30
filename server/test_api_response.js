const axios = require('axios');

async function testAPI() {
  try {
    console.log('Fetching lectures from API...');
    const response = await axios.get('http://localhost:5003/api/lectures/public?status=all');
    
    console.log('Total lectures:', response.data.length);
    
    // Find test lectures
    const testLectures = response.data.filter(l => 
      l.title && l.title.toLowerCase().includes('test')
    );
    
    console.log('\nTest lectures found:', testLectures.length);
    
    testLectures.forEach((lecture, i) => {
      console.log(`\nTest lecture ${i + 1}:`, {
        title: lecture.title,
        isWeeklyLecture: lecture.isWeeklyLecture,
        weekNumber: lecture.weekNumber,
        totalWeeks: lecture.totalWeeks,
        hasWeeklyField: 'isWeeklyLecture' in lecture
      });
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();