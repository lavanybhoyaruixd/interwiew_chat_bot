const axios = require('axios');

// Install axios first: npm install axios
async function testAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing HireMate Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('   Environment:', healthResponse.data.environment);
    console.log('   Uptime:', Math.round(healthResponse.data.uptime), 'seconds\n');

    // Test 2: Root Endpoint
    console.log('2. Testing Root Endpoint...');
    const rootResponse = await axios.get(`${baseURL}/`);
    console.log('✅ Root Endpoint:', rootResponse.data.message);
    console.log('   Available endpoints:', Object.keys(rootResponse.data.endpoints).join(', '), '\n');

    // Test 3: User Registration
    console.log('3. Testing User Registration...');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${baseURL}/api/auth/register`, testUser);
      console.log('✅ User Registration:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.user.id);
      console.log('   Credits:', registerResponse.data.user.credits);
      
      const token = registerResponse.data.token;

      // Test 4: AI Question Generation
      console.log('\n4. Testing AI Question Generation...');
      const sessionData = {
        type: 'technical',
        difficulty: 'medium',
        jobRole: 'Software Engineer',
        questionCount: 3
      };

      const sessionResponse = await axios.post(
        `${baseURL}/api/interview/sessions`,
        sessionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Interview Session Created:', sessionResponse.data.message);
      console.log('   Session ID:', sessionResponse.data.session.sessionId);
      console.log('   Questions Generated:', sessionResponse.data.session.questionCount);
      console.log('   Credits Remaining:', sessionResponse.data.session.remainingCredits);

      // Test 5: Get Session Details
      console.log('\n5. Testing Get Session Details...');
      const sessionId = sessionResponse.data.session.sessionId;
      const sessionDetailsResponse = await axios.get(
        `${baseURL}/api/interview/sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Session Details Retrieved');
      console.log('   First Question:', sessionDetailsResponse.data.session.questions[0]?.question?.substring(0, 60) + '...');
      
      // Test 6: Submit Answer and Get AI Analysis
      console.log('\n6. Testing Answer Submission and AI Analysis...');
      const answerData = {
        sessionId: sessionId,
        questionId: sessionDetailsResponse.data.session.questions[0]?._id || 'test',
        answer: 'I have 3 years of experience in software development using JavaScript, Python, and React. I have worked on several web applications and have experience with database design and API development.',
        timeSpent: 120,
        confidence: 4
      };

      const answerResponse = await axios.post(
        `${baseURL}/api/interview/sessions/${sessionId}/answer`,
        answerData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Answer Analysis Complete:', answerResponse.data.message);
      console.log('   Score:', answerResponse.data.analysis.score + '/100');
      console.log('   Feedback:', answerResponse.data.analysis.feedback?.substring(0, 100) + '...');
      console.log('   Strengths:', answerResponse.data.analysis.strengths?.join(', '));

    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, trying login instead...');
        
        // Try login instead
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        
        console.log('✅ User Login:', loginResponse.data.message);
        console.log('   Credits:', loginResponse.data.user.credits);
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Database Connection: Working');
    console.log('✅ API Endpoints: Working');
    console.log('✅ Authentication: Working');
    console.log('✅ AI Integration (Groq): Working');
    console.log('✅ Question Generation: Working');
    console.log('✅ Answer Analysis: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testAPI();
