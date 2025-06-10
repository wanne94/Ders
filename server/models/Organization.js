const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: false,
    default: 'Udruženje'
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  facebook: {
    type: String
  },
  instagram: {
    type: String
  },
  telegram: {
    type: String
  },
  viber: {
    type: String
  },
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
  }
}, {
  timestamps: true
});

// 🚀 PERFORMANCE INDEXES for Organization model
organizationSchema.index({ status: 1 }); // For filtering by status
organizationSchema.index({ name: 1 }); // For sorting by name
organizationSchema.index({ status: 1, name: 1 }); // Compound for active organizations sorted by name
organizationSchema.index({ city: 1 }); // For filtering by city
organizationSchema.index({ type: 1 }); // For filtering by type

// Text search index for searching organizations
organizationSchema.index({ 
  name: 'text', 
  description: 'text',
  city: 'text'
});

module.exports = mongoose.model('Organization', organizationSchema); 