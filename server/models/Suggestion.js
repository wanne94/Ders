const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  // Reference information
  targetType: {
    type: String,
    enum: ['organization', 'daija', 'general'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Changed to false to allow general suggestions without specific targets
  },
  targetName: {
    type: String,
    required: true // To easily display what the suggestion is for
  },
  
  // Suggestion details
  suggestedChanges: {
    type: Object, // Will contain the changed fields
    required: true
  },
  reason: {
    type: String,
    maxLength: 1000 // Increased from 500 to allow longer general suggestions
  },
  
  // User information (optional - can be submitted by non-logged users)
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  submitterName: {
    type: String,
    maxLength: 100
  },
  submitterEmail: {
    type: String,
    maxLength: 100
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'archived'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNote: {
    type: String,
    maxLength: 500
  }
}, {
  timestamps: true
});

// Add index for efficient querying
suggestionSchema.index({ targetType: 1, targetId: 1 });
suggestionSchema.index({ status: 1 });

module.exports = mongoose.model('Suggestion', suggestionSchema); 