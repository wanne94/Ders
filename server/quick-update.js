require('dotenv').config();
const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');

mongoose.connect('mongodb://localhost:27017/predavanje').then(async () => {
  const result = await Lecture.updateMany({ status: 'active' }, { status: 'approved' });
  console.log('Updated', result.modifiedCount, 'lectures');
  const count = await Lecture.countDocuments({ status: 'approved' });
  console.log('Total approved:', count);
  process.exit();
}); 