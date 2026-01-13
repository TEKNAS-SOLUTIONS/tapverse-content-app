import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
});

const models = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620', 
  'claude-3-5-sonnet',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307'
];

console.log('Testing Claude models with your API key...\n');

for (const model of models) {
  try {
    const result = await client.messages.create({
      model: model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    console.log('✅ WORKING MODEL:', model);
    console.log('   Response preview:', result.content[0].text.substring(0, 50));
    console.log('\n✅ Recommended: Use', model, 'as default\n');
    process.exit(0);
  } catch (e) {
    const msg = e.error?.message || e.message?.split('message:')[1]?.split('}')[0] || e.status || 'unknown';
    console.log('❌', model, '-', msg);
  }
}

console.log('\n⚠️  No working models found. Check your API key.');

