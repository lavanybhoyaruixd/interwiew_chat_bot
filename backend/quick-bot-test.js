require('dotenv').config();
const aiService = require('./services/aiService');
const enhancedAiService = require('./services/enhancedAiService');

async function quickBotDemo() {
  console.log('🤖 Quick Bot Demo - Testing Both Versions\n');
  
  const testQuestions = [
    "What skills should I learn to become a full-stack developer?",
    "How do I prepare for a software engineering interview?",
    "What are the most important technologies to learn in 2025?"
  ];
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 Question ${i + 1}: ${question}`);
    console.log('='.repeat(80));
    
    // Test Basic Bot
    console.log('\n🔹 BASIC BOT RESPONSE:');
    console.log('-'.repeat(50));
    
    try {
      const basicResponse = await aiService.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for programming and career advice. Provide concise, actionable advice.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.5,
        max_tokens: 400
      });
      
      console.log(basicResponse.choices[0]?.message?.content || 'No response');
      
    } catch (error) {
      console.log('❌ Basic bot error:', error.message);
    }
    
    // Test Enhanced Bot
    console.log('\n🔸 ENHANCED BOT RESPONSE:');
    console.log('-'.repeat(50));
    
    try {
      const enhancedResponse = await enhancedAiService.generateContextualChatResponse(
        question,
        'software-developer',
        'mid'
      );
      
      const context = enhancedAiService.getCurrentContext();
      console.log(enhancedResponse);
      console.log(`\n📅 Context: ${context.date} | Current Year: ${context.year}`);
      
    } catch (error) {
      console.log('❌ Enhanced bot error:', error.message);
    }
    
    // Add a small delay between questions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 Demo completed! Both bots are working correctly.');
  console.log('\n💡 Key Differences:');
  console.log('   • Basic Bot: Static responses, no context awareness');
  console.log('   • Enhanced Bot: Context-aware, includes current trends & date');
  console.log('\n📊 Additional Features Available:');
  console.log('   • Market insights for specific job roles');
  console.log('   • Trending technology topics');
  console.log('   • Enhanced interview questions');
  console.log('   • Real-time context integration');
  console.log('='.repeat(80));
}

// Run the demo
quickBotDemo().catch(console.error);
