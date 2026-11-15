const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 120 },
  daija: { type: mongoose.Schema.Types.ObjectId, ref: 'Daija' },
  organization: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  time: { type: String, trim: true },
  image: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

// Index za sortiranje po datumu
lectureSchema.index({ date: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
