const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class SessionFileService {
  constructor() {
    this.sessionFiles = new Map(); // Track files by sessionId
    this.userSessions = new Map(); // Track sessions by userId
    this.cleanupTimers = new Map(); // Track cleanup timers
    this.gracePeriod = parseInt(process.env.FILE_GRACE_PERIOD) || 30 * 60 * 1000; // 30 minutes default
  }

  // Save file for a session
  async saveSessionFile(file, userId, sessionId = null) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
      const filename = `session_${userId}_${timestamp}_${randomSuffix}_${sanitizedName}`;
      const filePath = path.join(__dirname, '../uploads', filename);

      // Ensure upload directory exists
      const uploadDir = path.dirname(filePath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
      }

      // Save file with restricted permissions
      await this.writeFileSecurely(file.buffer, filePath);

      // Track the file
      const fileInfo = {
        filePath,
        filename,
        originalName: file.originalname,
        size: file.size,
        userId,
        sessionId,
        createdAt: new Date(),
        lastAccessed: new Date()
      };

      // Store file info
      const fileKey = sessionId || `user_${userId}_${timestamp}`;
      this.sessionFiles.set(fileKey, fileInfo);

      // Track user sessions
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set());
      }
      this.userSessions.get(userId).add(fileKey);

      logger.info(`Session file saved: ${filename} for user: ${userId}, session: ${sessionId}`);
      return fileInfo;

    } catch (error) {
      logger.error('Error saving session file:', error);
      throw error;
    }
  }

  // Write file securely
  async writeFileSecurely(buffer, filePath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, { mode: 0o644 }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(filePath);
        }
      });
    });
  }

  // Start interview session - extend file lifetime
  startInterviewSession(sessionId, userId) {
    const fileKey = this.findUserFileKey(userId);
    if (fileKey && this.sessionFiles.has(fileKey)) {
      const fileInfo = this.sessionFiles.get(fileKey);
      
      // Update session info
      fileInfo.sessionId = sessionId;
      fileInfo.sessionStarted = new Date();
      
      // Cancel any existing cleanup timer
      if (this.cleanupTimers.has(fileKey)) {
        clearTimeout(this.cleanupTimers.get(fileKey));
        this.cleanupTimers.delete(fileKey);
      }

      // Update tracking
      this.sessionFiles.set(sessionId, fileInfo);
      if (fileKey !== sessionId) {
        this.sessionFiles.delete(fileKey);
      }

      logger.info(`Interview session started: ${sessionId}, file protected`);
      return fileInfo;
    }
    return null;
  }

  // End interview session - schedule file deletion
  endInterviewSession(sessionId, immediate = false) {
    if (this.sessionFiles.has(sessionId)) {
      const fileInfo = this.sessionFiles.get(sessionId);
      fileInfo.sessionEnded = new Date();

      const delay = immediate ? 5000 : this.gracePeriod; // 5 seconds or grace period

      // Schedule file deletion
      const timer = setTimeout(async () => {
        await this.deleteSessionFile(sessionId);
      }, delay);

      this.cleanupTimers.set(sessionId, timer);

      logger.info(`Interview session ended: ${sessionId}, file will be deleted in ${delay / 1000} seconds`);
      return true;
    }
    return false;
  }

  // Delete session file
  async deleteSessionFile(sessionKey) {
    try {
      if (this.sessionFiles.has(sessionKey)) {
        const fileInfo = this.sessionFiles.get(sessionKey);
        
        // Delete physical file
        if (fs.existsSync(fileInfo.filePath)) {
          fs.unlinkSync(fileInfo.filePath);
          logger.debug(`Deleted session file: ${fileInfo.filename}`);
        }

        // Clean up tracking
        this.sessionFiles.delete(sessionKey);
        
        // Clean up timers
        if (this.cleanupTimers.has(sessionKey)) {
          clearTimeout(this.cleanupTimers.get(sessionKey));
          this.cleanupTimers.delete(sessionKey);
        }

        // Clean up user sessions
        if (fileInfo.userId && this.userSessions.has(fileInfo.userId)) {
          this.userSessions.get(fileInfo.userId).delete(sessionKey);
          if (this.userSessions.get(fileInfo.userId).size === 0) {
            this.userSessions.delete(fileInfo.userId);
          }
        }

        logger.info(`Session file deleted: ${fileInfo.filename}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting session file:', error);
      return false;
    }
  }

  // Delete all files for a user (when user logs out)
  async deleteUserFiles(userId) {
    try {
      if (this.userSessions.has(userId)) {
        const userFileKeys = Array.from(this.userSessions.get(userId));
        let deletedCount = 0;

        for (const fileKey of userFileKeys) {
          const deleted = await this.deleteSessionFile(fileKey);
          if (deleted) deletedCount++;
        }

        logger.info(`Deleted ${deletedCount} files for user: ${userId}`);
        return deletedCount;
      }
      return 0;
    } catch (error) {
      logger.error('Error deleting user files:', error);
      return 0;
    }
  }

  // Get file info for session
  getSessionFile(sessionKey) {
    return this.sessionFiles.get(sessionKey) || null;
  }

  // Find user's current file key
  findUserFileKey(userId) {
    if (this.userSessions.has(userId)) {
      const fileKeys = Array.from(this.userSessions.get(userId));
      return fileKeys[fileKeys.length - 1]; // Return most recent
    }
    return null;
  }

  // Update file access time
  updateFileAccess(sessionKey) {
    if (this.sessionFiles.has(sessionKey)) {
      this.sessionFiles.get(sessionKey).lastAccessed = new Date();
      return true;
    }
    return false;
  }

  // Clean up expired files (fallback)
  async cleanupExpiredFiles() {
    try {
      const now = Date.now();
      const maxAge = 2 * 60 * 60 * 1000; // 2 hours max
      let cleanedCount = 0;

      for (const [sessionKey, fileInfo] of this.sessionFiles.entries()) {
        const fileAge = now - fileInfo.createdAt.getTime();
        const lastAccessAge = now - fileInfo.lastAccessed.getTime();

        // Delete if too old or not accessed recently
        if (fileAge > maxAge || lastAccessAge > this.gracePeriod) {
          await this.deleteSessionFile(sessionKey);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired session files`);
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired files:', error);
      return 0;
    }
  }

  // Get service statistics
  getStats() {
    return {
      totalFiles: this.sessionFiles.size,
      totalUsers: this.userSessions.size,
      activeTimers: this.cleanupTimers.size,
      gracePeriodMinutes: this.gracePeriod / 60 / 1000,
      files: Array.from(this.sessionFiles.values()).map(file => ({
        sessionId: file.sessionId,
        userId: file.userId,
        filename: file.originalName,
        size: file.size,
        createdAt: file.createdAt,
        sessionStarted: file.sessionStarted,
        sessionEnded: file.sessionEnded
      }))
    };
  }

  // Force cleanup all files (emergency)
  async forceCleanupAll() {
    try {
      const sessionKeys = Array.from(this.sessionFiles.keys());
      let deletedCount = 0;

      for (const sessionKey of sessionKeys) {
        const deleted = await this.deleteSessionFile(sessionKey);
        if (deleted) deletedCount++;
      }

      // Clear all timers
      for (const timer of this.cleanupTimers.values()) {
        clearTimeout(timer);
      }
      this.cleanupTimers.clear();

      logger.info(`Force cleaned up ${deletedCount} session files`);
      return deletedCount;
    } catch (error) {
      logger.error('Error in force cleanup:', error);
      return 0;
    }
  }
}

module.exports = new SessionFileService();
