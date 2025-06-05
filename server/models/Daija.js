const mongoose = require('mongoose');

const daijaSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    enum: ['prof', 'mr', 'dr']
  },
  dateOfBirth: {
    type: Date
  },
  biography: {
    type: String,
    required: false
  },
  shortDescription: {
    type: String
  },
  education: [{
    type: String
  }],
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 🚀 PERFORMANCE INDEXES for Daija model
daijaSchema.index({ status: 1 }); // For filtering by status
daijaSchema.index({ firstName: 1 }); // For sorting by name
daijaSchema.index({ status: 1, firstName: 1 }); // Compound for active daije sorted by name

// Text search index for searching daije
daijaSchema.index({ 
  firstName: 'text', 
  biography: 'text',
  shortDescription: 'text'
});

module.exports = mongoose.model('Daija', daijaSchema); 