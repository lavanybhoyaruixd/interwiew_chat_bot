const express = require('express');
const cors = require('cors');
require('dotenv').config();

const aiService = require('./services/aiService');
const User = require('./models/User');
const connectDB = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test endpoint for Groq AI
app.post('/test-ai', async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('🤖 Testing Groq AI with message:', message);
    
    // Test AI question generation
    const questions = await aiService.generateQuestions(
      { skills: ['JavaScript', 'React'], experience: '2 years', currentRole: 'Developer' },
      'Software Engineer',
      'medium',
      2
    );
    
    console.log('✅ Questions generated:', questions.length);
    
    // Test AI answer analysis
    const analysis = await aiService.analyzeAnswer(
      'Tell me about your experience with JavaScript',
      message || 'I have 2 years of experience with JavaScript and React',
      'Software Engineer'
    );
    
    console.log('✅ Answer analyzed - Score:', analysis.score);
    
    res.json({
      success: true,
      message: 'AI test completed successfully!',
      questions: questions,
      analysis: {
        score: analysis.score,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        improvements: analysis.improvements
      }
    });
    
  } catch (error) {
    console.error('❌ AI Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);
    
    res.json({
      success: true,
      message: 'Database test completed!',
      user: {
        id: testUser._id,
        email: testUser.email,
        credits: testUser.credits
      }
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001; // Use different port to avoid conflicts

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Database: http://localhost:${PORT}/test-db`);
  console.log(`   AI (POST): http://localhost:${PORT}/test-ai`);
  console.log(`\n📋 Test with curl or browser:`);
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log(`   curl -X POST http://localhost:${PORT}/test-ai -H "Content-Type: application/json" -d "{\\"message\\": \\"I love programming\\"}"`);
});
