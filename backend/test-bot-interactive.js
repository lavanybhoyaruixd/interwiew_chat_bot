require('dotenv').config();
const readline = require('readline');
const aiService = require('./services/aiService');
const enhancedAiService = require('./services/enhancedAiService');

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 HireMate Bot Interactive Testing\n');
console.log('Available test modes:');
console.log('1. Basic Chat (original bot)');
console.log('2. Enhanced Chat (new features)');
console.log('3. Market Insights');
console.log('4. Trending Topics');
console.log('5. Exit\n');

async function testBasicChat(message) {
  try {
    console.log('🔄 Processing with basic chat...\n');
    
    const systemPrompt = `You are a helpful AI assistant for programming, web development, and technology topics.

Provide concise, structured, and actionable advice.
- Focus on key points
- Use bullet points for lists
- Include concise examples only if necessary
- Aim for brevity while maintaining clarity`;

    const response = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const botResponse = response.choices[0]?.message?.content || 
      'I apologize, but I had trouble processing your request. Please try again.';
    
    console.log('🤖 Basic Bot Response:');
    console.log('─'.repeat(50));
    console.log(botResponse);
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('❌ Error with basic chat:', error.message);
  }
}

async function testEnhancedChat(message) {
  try {
    console.log('🔄 Processing with enhanced chat...\n');
    
    const response = await enhancedAiService.generateContextualChatResponse(
      message,
      'software-developer',
      'mid'
    );
    
    const context = enhancedAiService.getCurrentContext();
    
    console.log('🚀 Enhanced Bot Response:');
    console.log('─'.repeat(50));
    console.log(response);
    console.log('─'.repeat(50));
    console.log(`📅 Context: ${context.date} | Year: ${context.year} | Weekend: ${context.isWeekend}`);
    
  } catch (error) {
    console.error('❌ Error with enhanced chat:', error.message);
  }
}

async function testMarketInsights(jobRole) {
  try {
    console.log(`🔄 Getting market insights for ${jobRole}...\n`);
    
    const insights = await enhancedAiService.getMarketInsights(jobRole);
    const context = enhancedAiService.getCurrentContext();
    
    console.log('📊 Market Insights:');
    console.log('─'.repeat(50));
    console.log(insights);
    console.log('─'.repeat(50));
    console.log(`📅 Current Date: ${context.date}`);
    
  } catch (error) {
    console.error('❌ Error getting market insights:', error.message);
  }
}

async function showTrendingTopics() {
  try {
    console.log('🔄 Getting trending topics...\n');
    
    const topics = await enhancedAiService.getTrendingTechTopics();
    const context = enhancedAiService.getCurrentContext();
    
    console.log('🔥 Trending Tech Topics:');
    console.log('─'.repeat(50));
    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic}`);
    });
    console.log('─'.repeat(50));
    console.log(`📅 Current Date: ${context.date}`);
    
  } catch (error) {
    console.error('❌ Error getting trending topics:', error.message);
  }
}

function askQuestion() {
  rl.question('\n💬 Choose test mode (1-5): ', async (mode) => {
    
    if (mode === '5') {
      console.log('\n👋 Thanks for testing! Goodbye!');
      rl.close();
      return;
    }
    
    if (mode === '4') {
      await showTrendingTopics();
      askQuestion();
      return;
    }
    
    if (mode === '3') {
      rl.question('📝 Enter job role for market insights: ', async (jobRole) => {
        if (!jobRole.trim()) {
          console.log('❌ Please enter a valid job role');
          askQuestion();
          return;
        }
        await testMarketInsights(jobRole.trim());
        askQuestion();
      });
      return;
    }
    
    if (mode === '1' || mode === '2') {
      rl.question('💭 Enter your question: ', async (question) => {
        if (!question.trim()) {
          console.log('❌ Please enter a valid question');
          askQuestion();
          return;
        }
        
        if (mode === '1') {
          await testBasicChat(question.trim());
        } else if (mode === '2') {
          await testEnhancedChat(question.trim());
        }
        
        askQuestion();
      });
      return;
    }
    
    console.log('❌ Invalid option. Please choose 1-5.');
    askQuestion();
  });
}

// Start the interactive session
console.log('🎯 Ready to test your bot! Ask me anything about programming, web development, or career advice.\n');
askQuestion();
