const AIService = require('./services/aiService');
const logger = require('./utils/logger');

async function testGroqConnection() {
  try {
    const aiService = new AIService();
    
    console.log('Testing Groq API connection...');
    console.log('Using API Key:', process.env.GROQ_API_KEY ? '*** (key present)' : 'No API key found');
    
    // Test with a simple prompt
    const response = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test. Please respond with "Test successful" if you can read this.'
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    
    console.log('\nAPI Response:', response.choices[0].message.content);
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error testing Groq API:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    process.exit(0);
  }
}

testGroqConnection();
