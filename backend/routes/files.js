const express = require('express');
const { authenticate } = require('../middleware/auth');
const fileCleanup = require('../utils/fileCleanup');
const resumeService = require('../services/resumeService');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/files/cleanup/status
// @desc    Get file cleanup status
// @access  Private (Admin)
router.get('/cleanup/status', authenticate, async (req, res) => {
  try {
    // Check if user is admin (add your admin check logic)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const status = fileCleanup.getStatus();
    
    res.json({
      success: true,
      cleanup: status
    });
  } catch (error) {
    logger.error('Get cleanup status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cleanup status'
    });
  }
});

// @route   POST /api/files/cleanup/run
// @desc    Manually trigger file cleanup
// @access  Private (Admin)
router.post('/cleanup/run', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    await fileCleanup.runCleanup();
    
    res.json({
      success: true,
      message: 'File cleanup completed successfully'
    });
  } catch (error) {
    logger.error('Manual cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run cleanup'
    });
  }
});

// @route   GET /api/files/stats
// @desc    Get file storage statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, '../uploads');
    let stats = {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: null,
      newestFile: null,
      avgFileSize: 0
    };

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      stats.totalFiles = files.length;
      
      let totalSize = 0;
      let oldestTime = Infinity;
      let newestTime = 0;
      
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const fileStats = fs.statSync(filePath);
        
        totalSize += fileStats.size;
        
        if (fileStats.ctime.getTime() < oldestTime) {
          oldestTime = fileStats.ctime.getTime();
          stats.oldestFile = {
            name: file,
            created: fileStats.ctime,
            size: fileStats.size
          };
        }
        
        if (fileStats.ctime.getTime() > newestTime) {
          newestTime = fileStats.ctime.getTime();
          stats.newestFile = {
            name: file,
            created: fileStats.ctime,
            size: fileStats.size
          };
        }
      }
      
      stats.totalSize = totalSize;
      stats.avgFileSize = files.length > 0 ? totalSize / files.length : 0;
    }
    
    res.json({
      success: true,
      stats: {
        ...stats,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        avgFileSizeMB: (stats.avgFileSize / 1024 / 1024).toFixed(2)
      }
    });
  } catch (error) {
    logger.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file statistics'
    });
  }
});

// @route   DELETE /api/files/user/:userId
// @desc    Delete all files for a specific user
// @access  Private (Admin)
router.delete('/user/:userId', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId } = req.params;
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        message: 'No files found for user',
        deletedCount: 0
      });
    }

    const files = fs.readdirSync(uploadDir);
    let deletedCount = 0;
    
    for (const file of files) {
      if (file.startsWith(`${userId}_`)) {
        const filePath = path.join(uploadDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
        logger.debug(`Deleted user file: ${file}`);
      }
    }
    
    res.json({
      success: true,
      message: `Deleted ${deletedCount} files for user ${userId}`,
      deletedCount
    });
  } catch (error) {
    logger.error('Delete user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user files'
    });
  }
});

// @route   GET /api/files/health
// @desc    Check file system health
// @access  Private (Admin)
router.get('/health', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, '../uploads');
    const health = {
      uploadDirExists: fs.existsSync(uploadDir),
      uploadDirWritable: false,
      cleanupSchedulerRunning: fileCleanup.getStatus().isRunning,
      diskSpace: null,
      issues: []
    };

    // Check if upload directory is writable
    if (health.uploadDirExists) {
      try {
        const testFile = path.join(uploadDir, 'health_check.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        health.uploadDirWritable = true;
      } catch (error) {
        health.uploadDirWritable = false;
        health.issues.push('Upload directory is not writable');
      }
    } else {
      health.issues.push('Upload directory does not exist');
    }

    // Check disk space (simplified)
    try {
      const stats = fs.statSync(uploadDir);
      health.diskSpace = 'Available'; // Simplified check
    } catch (error) {
      health.issues.push('Cannot check disk space');
    }

    // Check cleanup scheduler
    if (!health.cleanupSchedulerRunning) {
      health.issues.push('File cleanup scheduler is not running');
    }

    const isHealthy = health.issues.length === 0;
    
    res.status(isHealthy ? 200 : 500).json({
      success: isHealthy,
      health: {
        ...health,
        status: isHealthy ? 'healthy' : 'issues_found',
        checkedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('File health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check file system health'
    });
  }
});

module.exports = router;
