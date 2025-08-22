const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 
      'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'BULK_ACTION',
      'STATUS_CHANGE', 'SETTINGS_CHANGE', 'PASSWORD_CHANGE'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['lecture', 'daija', 'organization', 'user', 'suggestion', 'settings', 'system']
  },
  entityId: {
    type: String
  },
  entityName: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

// Static methods
auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - we don't want audit failures to break operations
    return null;
  }
};

auditLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const { limit = 100, skip = 0, startDate, endDate } = options;
  
  const query = { userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username email');
};

auditLogSchema.statics.getEntityHistory = async function(entityType, entityId, options = {}) {
  const { limit = 50 } = options;
  
  return this.find({ entityType, entityId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

auditLogSchema.statics.getRecentActivity = async function(options = {}) {
  const { limit = 100, entityType, action } = options;
  
  const query = {};
  if (entityType) query.entityType = entityType;
  if (action) query.action = action;
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);