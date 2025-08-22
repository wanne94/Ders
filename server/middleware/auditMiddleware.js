const AuditLog = require('../models/AuditLog');

const auditMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to capture response
    res.json = function(data) {
      // Log the action
      logAuditEntry(req, res, action, entityType, data);
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

const logAuditEntry = async (req, res, action, entityType, responseData) => {
  try {
    const auditData = {
      userId: req.user?._id || req.user?.id,
      username: req.user?.username || 'anonymous',
      action,
      entityType,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      success: res.statusCode < 400
    };
    
    // Extract entity details from request/response
    if (req.params.id) {
      auditData.entityId = req.params.id;
    }
    
    // Add details based on action
    switch (action) {
      case 'CREATE':
        auditData.details = req.body;
        if (responseData && responseData._id) {
          auditData.entityId = responseData._id;
        }
        break;
        
      case 'UPDATE':
        auditData.changes = {
          before: responseData?.original,
          after: req.body
        };
        break;
        
      case 'DELETE':
        auditData.details = { deleted: true };
        break;
        
      case 'BULK_ACTION':
        auditData.details = {
          itemCount: req.body?.ids?.length || 0,
          action: req.body?.action
        };
        break;
        
      case 'LOGIN':
        auditData.details = {
          email: req.body?.email,
          timestamp: new Date()
        };
        break;
        
      case 'EXPORT':
        auditData.details = {
          format: req.query?.format || 'csv',
          recordCount: responseData?.count
        };
        break;
        
      case 'IMPORT':
        auditData.details = {
          recordCount: req.body?.data?.length || 0,
          source: req.body?.source
        };
        break;
    }
    
    // Add entity name if available
    if (responseData) {
      auditData.entityName = responseData.title || 
                            responseData.name || 
                            responseData.username ||
                            `${entityType} #${auditData.entityId}`;
    }
    
    // Log to database
    await AuditLog.log(auditData);
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't break the request flow
  }
};

// Manual audit logging function for custom scenarios
const logAudit = async (userId, username, action, entityType, details = {}) => {
  try {
    await AuditLog.log({
      userId,
      username,
      action,
      entityType,
      ...details
    });
  } catch (error) {
    console.error('Manual audit logging error:', error);
  }
};

module.exports = {
  auditMiddleware,
  logAudit
};