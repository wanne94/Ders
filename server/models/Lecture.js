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
  // Nova polja za podršku više daija
  daijaIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Daija'
  }],
  customSpeakers: [{
    type: String
  }],
  speaker: {
    type: String,
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
  duration: {
    type: Number,
    required: false,
    default: 60 // Duration in minutes, default 1 hour
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
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'approved'
  },
  rejectionReason: {
    type: String,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Cancellation functionality fields
  cancellationReports: [{
    userId: {
      type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for guest users
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      required: false
    },
    reason: {
      type: String,
      required: false,
      default: 'Nije specificiran razlog'
    },
    howFound: {
      type: String,
      required: false,
      default: 'Nije specificiran način saznavanje'
    },
    additionalInfo: {
      type: String,
      required: false
    },
    proofImage: {
      type: String,
      required: false
    }
  }],
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date,
    required: false
  },
  cancellationReason: {
    type: String,
    required: false,
    default: 'Otkazano na osnovu prijava korisnika'
  },
  // New fields for manual cancellation
  cancelled_at: {
    type: Date,
    required: false
  },
  cancelled_reason: {
    type: String,
    required: false
  },
  // Weekly lecture fields
  isWeeklyLecture: {
    type: Boolean,
    default: false
  },
  weeklySeriesId: {
    type: String,
    required: false,
    index: true
  },
  weekNumber: {
    type: Number,
    required: false,
    min: 1,
    max: 12
  },
  totalWeeks: {
    type: Number,
    required: false,
    min: 2,
    max: 12
  },
  parentLectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: false
  },
  // Part number for series lectures (e.g., "dio 155")
  lecturePart: {
    type: Number,
    required: false,
    min: 1
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

// 6. Cancellation indexes for performance
lectureSchema.index({ isCancelled: 1 }); // For filtering cancelled lectures
lectureSchema.index({ 'cancellationReports.userId': 1 }); // For user cancellation reports

// 7. Weekly lecture indexes
lectureSchema.index({ weeklySeriesId: 1, weekNumber: 1 }); // For finding lectures in a series

module.exports = mongoose.model('Lecture', lectureSchema); 