import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/config.js';

// Initialize Claude client
const client = new Anthropic({
  apiKey: config.api.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate content using Claude API
 * @param {string} prompt - The prompt to send to Claude
 * @param {object} options - Optional parameters
 * @param {string} options.model - Model to use (default: 'claude-3-5-sonnet-20241022')
 * @param {number} options.maxTokens - Maximum tokens in response (default: 4096)
 * @returns {Promise<string>} Generated content
 */
export async function generateContent(prompt, options = {}) {
  try {
    const {
      model = config.api.claudeModel || 'claude-3-5-sonnet-20241022',
      maxTokens = 4096,
    } = options;

    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content from response
    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected content type from Claude API');
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${error.message}`);
  }
}

/**
 * Generate content with system prompt
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {object} options - Optional parameters
 * @returns {Promise<string>} Generated content
 */
export async function generateContentWithSystem(systemPrompt, userPrompt, options = {}) {
  try {
    const {
      model = config.api.claudeModel || 'claude-3-5-sonnet-20241022',
      maxTokens = 4096,
    } = options;

    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected content type from Claude API');
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${error.message}`);
  }
}

