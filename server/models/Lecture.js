const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({

  type: {
    type: String,
    required: false,
    default: 'Predavanje'
  },
  title: {
    type: String,
    required: true
  },
  daija: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Daija',
    required: false
  },
  organization: {
    type: String,
    required: false
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: false
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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 🚀 PERFORMANCE INDEXES - Critical for fast queries
// 1. Compound index for most common query: status + date (for public lectures)
lectureSchema.index({ status: 1, date: 1 });

// 2. Single field indexes for frequent queries
lectureSchema.index({ status: 1 }); // For pending/rejected/active filtering
lectureSchema.index({ date: 1 }); // For date-based sorting and filtering
lectureSchema.index({ createdBy: 1 }); // For user's own lectures
lectureSchema.index({ type: 1 }); // For filtering by type

// 3. Reference field indexes for populate operations
lectureSchema.index({ daija: 1 }); // For daija-specific lectures
lectureSchema.index({ organizationId: 1 }); // For organization-specific lectures

// 4. Compound index for admin queries (status + createdAt for sorting)
lectureSchema.index({ status: 1, createdAt: -1 });

// 5. Text search index for title and description (optional but useful)
lectureSchema.index({ 
  title: 'text', 
  description: 'text',
  shortDescription: 'text'
});

module.exports = mongoose.model('Lecture', lectureSchema); 