const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 120 },
  image: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

// Index za sortiranje po datumu
lectureSchema.index({ date: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
