import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/config.js';
import pool from '../db/index.js';

/**
 * Get API key from database or environment
 */
async function getAPIKey() {
  try {
    const result = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'anthropic_api_key' AND setting_value != ''"
    );
    if (result.rows.length > 0 && result.rows[0].setting_value) {
      return result.rows[0].setting_value;
    }
  } catch (error) {
    console.error('Error fetching API key from database:', error);
  }
  return config.api.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
}

/**
 * Get Claude client with API key from database
 */
async function getClaudeClient() {
  const apiKey = await getAPIKey();
  if (!apiKey) {
    throw new Error('Anthropic API key not found. Please configure it in Admin Setup.');
  }
  return new Anthropic({ apiKey });
}

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
      model = config.api.claudeModel || 'claude-3-haiku-20240307',
      maxTokens = 4096,
    } = options;

    const client = await getClaudeClient();
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
      model = config.api.claudeModel || 'claude-3-haiku-20240307',
      maxTokens = 4096,
    } = options;

    const client = await getClaudeClient();
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

