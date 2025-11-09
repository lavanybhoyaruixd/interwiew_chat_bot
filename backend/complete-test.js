const express = require('express');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

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

// In-memory user storage (for testing)
const users = new Map();
const JWT_SECRET = 'test_secret_key';

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = users.get(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Routes

// 1. REGISTER USER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    for (const [id, user] of users.entries()) {
      if (user.email === email) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = Date.now().toString();
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      credits: 100,
      resumeData: null,
      createdAt: new Date()
    };

    users.set(userId, user);

    // Generate token
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// 2. LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    let foundUser = null;
    for (const [id, user] of users.entries()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign({ id: foundUser.id }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        credits: foundUser.credits,
        hasResume: !!foundUser.resumeData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// 3. UPLOAD RESUME (Protected Route)
app.post('/api/interview/upload-resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided'
      });
    }

    console.log(`📄 Processing resume upload for user: ${req.user.email}`);
    console.log('- File name:', req.file.originalname);
    console.log('- File size:', req.file.size, 'bytes');
    console.log('- File type:', req.file.mimetype);

    // Test PDF parsing
    const pdf = require('pdf-parse');
    let resumeData = {
      filename: req.file.originalname,
      fileSize: req.file.size,
      uploadedAt: new Date(),
      skills: [],
      experience: '',
      currentRole: '',
      textLength: 0
    };

    try {
      const pdfData = await pdf(req.file.buffer);
      console.log('- PDF text extracted:', pdfData.text.length, 'characters');
      
      resumeData.textLength = pdfData.text.length;
      resumeData.extractedText = pdfData.text.substring(0, 1000); // Store first 1000 chars
      
      // Simple skill extraction (you can enhance this with AI)
      const commonSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css'];
      const text = pdfData.text.toLowerCase();
      resumeData.skills = commonSkills.filter(skill => text.includes(skill));
      
      // Simple role extraction
      if (text.includes('developer') || text.includes('engineer')) {
        resumeData.currentRole = 'Software Developer';
      } else if (text.includes('manager')) {
        resumeData.currentRole = 'Manager';
      } else {
        resumeData.currentRole = 'Professional';
      }

    } catch (pdfError) {
      console.log('- PDF parsing error:', pdfError.message);
      resumeData.error = 'Could not extract text from PDF';
    }

    // Save resume data to user
    req.user.resumeData = resumeData;
    users.set(req.user.id, req.user);

    console.log(`✅ Resume processed successfully for: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      resumeData: {
        filename: resumeData.filename,
        fileSize: resumeData.fileSize,
        skills: resumeData.skills,
        currentRole: resumeData.currentRole,
        textLength: resumeData.textLength,
        uploadedAt: resumeData.uploadedAt
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message
    });
  }
});

// 4. GET USER PROFILE (Protected Route)
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      credits: req.user.credits,
      hasResume: !!req.user.resumeData,
      resumeData: req.user.resumeData ? {
        filename: req.user.resumeData.filename,
        skills: req.user.resumeData.skills,
        currentRole: req.user.resumeData.currentRole,
        uploadedAt: req.user.resumeData.uploadedAt
      } : null
    }
  });
});

// 5. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Complete test server is running',
    timestamp: new Date().toISOString(),
    stats: {
      totalUsers: users.size,
      uploadsDir: uploadsDir
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
const PORT = 5002; // Using port 5002 to avoid conflicts
app.listen(PORT, () => {
  console.log(`\n🚀 Complete Test Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`🔗 Health check: GET http://localhost:${PORT}/health`);
  console.log(`👤 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📤 Upload Resume: POST http://localhost:${PORT}/api/interview/upload-resume`);
  console.log(`👨‍💼 Get Profile: GET http://localhost:${PORT}/api/auth/me`);
  console.log(`\n🔍 Test Steps:`);
  console.log(`1. Register a user with POST to /api/auth/register`);
  console.log(`2. Login with POST to /api/auth/login`);
  console.log(`3. Use the token to upload resume with POST to /api/interview/upload-resume`);
  console.log(`\n🛑 Press Ctrl+C to stop the server\n`);
});
