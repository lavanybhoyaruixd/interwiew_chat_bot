const fetch = require('node-fetch');

async function testChatAPI() {
  try {
    console.log('Testing Chat API endpoints...\n');

    // Test 1: /api/chat/message
    console.log('1. Testing POST /api/chat/message');
    const messageResponse = await fetch('http://localhost:5000/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'What are some common interview questions?'
      })
    });
    
    if (messageResponse.ok) {
      const messageData = await messageResponse.json();
      console.log('✓ Message endpoint working');
      console.log('Response:', messageData.response?.substring(0, 100) + '...\n');
    } else {
      console.error('✗ Message endpoint failed:', messageResponse.status, messageResponse.statusText);
      const errorData = await messageResponse.text();
      console.error('Error details:', errorData, '\n');
    }

    // Test 2: /api/chat/ask
    console.log('2. Testing POST /api/chat/ask');
    const askResponse = await fetch('http://localhost:5000/api/chat/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: 'Tell me about yourself - how should I answer this?'
      })
    });
    
    if (askResponse.ok) {
      const askData = await askResponse.json();
      console.log('✓ Ask endpoint working');
      console.log('Response:', askData.response?.substring(0, 100) + '...\n');
    } else {
      console.error('✗ Ask endpoint failed:', askResponse.status, askResponse.statusText);
      const errorData = await askResponse.text();
      console.error('Error details:', errorData, '\n');
    }

    // Test 3: /api/chat/help
    console.log('3. Testing POST /api/chat/help');
    const helpResponse = await fetch('http://localhost:5000/api/chat/help', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: 'How do I prepare for a JavaScript coding interview?',
        language: 'JavaScript',
        difficulty: 'intermediate'
      })
    });
    
    if (helpResponse.ok) {
      const helpData = await helpResponse.json();
      console.log('✓ Help endpoint working');
      console.log('Response:', helpData.help?.substring(0, 100) + '...\n');
    } else {
      console.error('✗ Help endpoint failed:', helpResponse.status, helpResponse.statusText);
      const errorData = await helpResponse.text();
      console.error('Error details:', errorData, '\n');
    }

    console.log('Chat API test completed!');

  } catch (error) {
    console.error('Error testing chat API:', error.message);
    console.error('Full error:', error);
  }
}

// Check if node-fetch is installed
try {
  require.resolve('node-fetch');
  testChatAPI();
} catch(e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch@2', { cwd: __dirname });
  console.log('node-fetch installed. Please run the script again.');
}
