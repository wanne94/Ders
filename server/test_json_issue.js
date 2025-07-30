// Test to see where fields are being lost
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  const data = [{
    title: 'Test Lecture',
    isWeeklyLecture: true,
    weekNumber: 1,
    totalWeeks: 4,
    weeklySeriesId: 'TEST123',
    date: new Date(),
    speaker: 'Test Speaker'
  }];
  
  console.log('Before res.json:', JSON.stringify(data[0]));
  console.log('Has isWeeklyLecture:', 'isWeeklyLecture' in data[0]);
  
  res.json(data);
});

app.listen(5004, () => {
  console.log('Test server running on port 5004');
});