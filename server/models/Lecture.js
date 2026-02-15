const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  image: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

// Index za sortiranje po datumu
lectureSchema.index({ date: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
