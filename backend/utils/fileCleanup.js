const cron = require('node-cron');
const resumeService = require('../services/resumeService');
const logger = require('./logger');

class FileCleanupScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Start the cleanup scheduler
  start() {
    if (this.isRunning) {
      logger.warn('File cleanup scheduler is already running');
      return;
    }

    // Run cleanup every hour
    this.hourlyCleanup = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Starting scheduled file cleanup...');
        await resumeService.cleanupOldFiles();
      } catch (error) {
        logger.error('Scheduled cleanup failed:', error);
      }
    }, {
      scheduled: false
    });

    // Run cleanup every day at 2 AM
    this.dailyCleanup = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Starting daily file cleanup...');
        await this.deepCleanup();
      } catch (error) {
        logger.error('Daily cleanup failed:', error);
      }
    }, {
      scheduled: false
    });

    // Start the schedulers
    this.hourlyCleanup.start();
    this.dailyCleanup.start();
    this.isRunning = true;

    logger.info('File cleanup scheduler started');
  }

  // Stop the cleanup scheduler
  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.hourlyCleanup) {
      this.hourlyCleanup.stop();
    }

    if (this.dailyCleanup) {
      this.dailyCleanup.stop();
    }

    this.isRunning = false;
    logger.info('File cleanup scheduler stopped');
  }

  // Perform deep cleanup (more thorough)
  async deepCleanup() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) return;

      const files = fs.readdirSync(uploadDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours for deep cleanup
      let cleanedCount = 0;
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.ctime.getTime() > maxAge) {
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          cleanedCount++;
          logger.debug(`Deep cleaned file: ${file}`);
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Deep cleanup completed: ${cleanedCount} files, ${(totalSize / 1024 / 1024).toFixed(2)}MB freed`);
      }
    } catch (error) {
      logger.error('Deep cleanup error:', error);
    }
  }

  // Manual cleanup trigger
  async runCleanup() {
    try {
      logger.info('Running manual file cleanup...');
      await resumeService.cleanupOldFiles();
      await this.deepCleanup();
      logger.info('Manual cleanup completed');
    } catch (error) {
      logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }

  // Get cleanup status
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextHourlyRun: this.hourlyCleanup ? this.hourlyCleanup.getStatus().next : null,
      nextDailyRun: this.dailyCleanup ? this.dailyCleanup.getStatus().next : null
    };
  }
}

module.exports = new FileCleanupScheduler();
