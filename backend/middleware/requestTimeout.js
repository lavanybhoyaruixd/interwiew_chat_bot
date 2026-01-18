// Simple request timeout middleware to avoid hanging requests
// Usage: app.use(requestTimeout(30000)) // 30s
function requestTimeout(ms = 30000) {
  return function (req, res, next) {
    // Skip if response finishes in time
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timed out'
        });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}

// eslint-disable-next-line no-undef
module.exports = requestTimeout;
