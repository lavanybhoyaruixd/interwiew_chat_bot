const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Test file upload endpoint
app.post('/test-upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    console.log('File upload test received:');
    console.log('- File name:', req.file.originalname);
    console.log('- File size:', req.file.size, 'bytes');
    console.log('- File type:', req.file.mimetype);
    console.log('- Buffer length:', req.file.buffer.length);

    // Test saving file temporarily
    const timestamp = Date.now();
    const filename = `test_${timestamp}_${req.file.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);
    console.log('- File saved to:', filePath);

    // Test PDF parsing (basic check)
    const pdf = require('pdf-parse');
    try {
      const pdfData = await pdf(req.file.buffer);
      console.log('- PDF text length:', pdfData.text.length);
      console.log('- PDF pages:', pdfData.numpages);
      
      // Clean up test file
      fs.unlinkSync(filePath);
      console.log('- Test file cleaned up');

      res.json({
        success: true,
        message: 'File upload test successful!',
        fileInfo: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          textLength: pdfData.text.length,
          pages: pdfData.numpages,
          textPreview: pdfData.text.substring(0, 200) + '...'
        }
      });
    } catch (pdfError) {
      // Clean up test file even if PDF parsing fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      res.json({
        success: true,
        message: 'File upload successful, but PDF parsing failed',
        error: pdfError.message,
        fileInfo: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        }
      });
    }

  } catch (error) {
    console.error('Upload test error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload test failed',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'File upload test server is running',
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir
  });
});

// Start test server
const PORT = 5001; // Different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`\n🚀 File Upload Test Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Test upload: POST http://localhost:${PORT}/test-upload`);
  console.log(`\nTo test file upload, use a tool like Postman or curl:`);
  console.log(`curl -X POST -F "resume=@your-resume.pdf" http://localhost:${PORT}/test-upload`);
  console.log(`\n Press Ctrl+C to stop the server\n`);
});
