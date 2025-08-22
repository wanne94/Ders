const jwt = require('jsonwebtoken');
const redis = require('redis');

class SessionManager {
  constructor() {
    // Initialize Redis client if available
    this.redisClient = null;
    this.sessions = new Map(); // Fallback to in-memory storage
    this.initRedis();
  }

  async initRedis() {
    try {
      this.redisClient = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      });
      
      this.redisClient.on('error', (err) => {
        console.log('Redis connection error:', err);
        this.redisClient = null;
      });
      
      await this.redisClient.connect();
      console.log('Redis connected for session management');
    } catch (error) {
      console.log('Redis not available, using in-memory session storage');
      this.redisClient = null;
    }
  }

  /**
   * Create a new session
   */
  async createSession(userId, userData, options = {}) {
    const sessionId = this.generateSessionId();
    const {
      expiresIn = '7d',
      deviceInfo = {},
      ipAddress = null
    } = options;

    const session = {
      sessionId,
      userId,
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.parseExpiration(expiresIn),
      deviceInfo,
      ipAddress,
      isActive: true
    };

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        sessionId,
        userId,
        ...userData 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        sessionId,
        userId,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn }
    );

    // Store session
    await this.storeSession(sessionId, session, expiresIn);

    return {
      sessionId,
      accessToken,
      refreshToken,
      expiresAt: session.expiresAt
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const session = await this.getSession(decoded.sessionId);
      
      if (!session || !session.isActive) {
        throw new Error('Session not found or inactive');
      }

      // Update last activity
      session.lastActivity = Date.now();
      await this.updateSession(decoded.sessionId, session);

      // Generate new access token
      const accessToken = jwt.sign(
        {
          sessionId: decoded.sessionId,
          userId: session.userId,
          ...session.userData
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return { accessToken, session };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Validate session
   */
  async validateSession(sessionId) {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, reason: 'Session inactive' };
    }

    if (Date.now() > session.expiresAt) {
      await this.invalidateSession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Check for suspicious activity
    const suspiciousActivity = await this.checkSuspiciousActivity(session);
    if (suspiciousActivity) {
      await this.invalidateSession(sessionId);
      return { valid: false, reason: 'Suspicious activity detected' };
    }

    // Update last activity
    session.lastActivity = Date.now();
    await this.updateSession(sessionId, session);

    return { valid: true, session };
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId) {
    const session = await this.getSession(sessionId);
    if (session) {
      session.isActive = false;
      session.invalidatedAt = Date.now();
      await this.updateSession(sessionId, session);
    }
  }

  /**
   * Get all user sessions
   */
  async getUserSessions(userId) {
    const sessions = [];
    
    if (this.redisClient) {
      const keys = await this.redisClient.keys(`session:*`);
      for (const key of keys) {
        const session = JSON.parse(await this.redisClient.get(key));
        if (session && session.userId === userId) {
          sessions.push(session);
        }
      }
    } else {
      for (const [, session] of this.sessions) {
        if (session.userId === userId) {
          sessions.push(session);
        }
      }
    }

    return sessions.filter(s => s.isActive);
  }

  /**
   * Invalidate all user sessions
   */
  async invalidateUserSessions(userId, exceptSessionId = null) {
    const sessions = await this.getUserSessions(userId);
    
    for (const session of sessions) {
      if (session.sessionId !== exceptSessionId) {
        await this.invalidateSession(session.sessionId);
      }
    }
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions() {
    const now = Date.now();
    
    if (this.redisClient) {
      const keys = await this.redisClient.keys(`session:*`);
      for (const key of keys) {
        const session = JSON.parse(await this.redisClient.get(key));
        if (session && session.expiresAt < now) {
          await this.redisClient.del(key);
        }
      }
    } else {
      for (const [sessionId, session] of this.sessions) {
        if (session.expiresAt < now) {
          this.sessions.delete(sessionId);
        }
      }
    }
  }

  /**
   * Check for suspicious activity
   */
  async checkSuspiciousActivity(session) {
    // Check for rapid IP changes
    // Check for unusual activity patterns
    // Check for concurrent sessions limit
    
    const userSessions = await this.getUserSessions(session.userId);
    if (userSessions.length > 5) {
      // Too many concurrent sessions
      return true;
    }

    // Add more security checks as needed
    return false;
  }

  /**
   * Store session
   */
  async storeSession(sessionId, session, ttl) {
    const key = `session:${sessionId}`;
    
    if (this.redisClient) {
      await this.redisClient.setex(
        key,
        this.parseExpiration(ttl) / 1000,
        JSON.stringify(session)
      );
    } else {
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Get session
   */
  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    
    if (this.redisClient) {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      return this.sessions.get(sessionId) || null;
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId, session) {
    await this.storeSession(sessionId, session, '7d');
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Parse expiration time
   */
  parseExpiration(expiration) {
    const units = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000
    };

    const match = expiration.match(/^(\d+)([smhd])$/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }

    return parseInt(expiration) || 86400000; // Default 1 day
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Clean expired sessions periodically
setInterval(() => {
  sessionManager.cleanExpiredSessions();
}, 3600000); // Every hour

module.exports = sessionManager;