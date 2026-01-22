import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/config.js';
import { query } from '../core/database.js';
import { get, set } from '../core/cache.js';
import { logger } from '../core/logger.js';
import { ExternalAPIError } from '../core/errors.js';

/**
 * Get API key from database or environment
 */
async function getAPIKey() {
  try {
    const result = await query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'anthropic_api_key' AND setting_value != ''"
    );
    if (result.rows.length > 0 && result.rows[0].setting_value) {
      return result.rows[0].setting_value;
    }
  } catch (error) {
    logger.error({ err: error }, 'Error fetching API key from database');
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
 * Generate content using Claude API with retry logic and caching
 * @param {string} prompt - The prompt to send to Claude
 * @param {object} options - Optional parameters
 * @param {string} options.model - Model to use (default: 'claude-3-5-sonnet-20241022')
 * @param {number} options.maxTokens - Maximum tokens in response (default: 4096)
 * @param {boolean} options.useCache - Whether to use cache (default: true)
 * @returns {Promise<string>} Generated content
 */
export async function generateContent(prompt, options = {}) {
  const {
    model = config.api.claudeModel || 'claude-3-haiku-20240307',
    maxTokens = 4096,
    useCache = true,
  } = options;

  // Create cache key
  const cacheKey = `claude:${model}:${Buffer.from(prompt).toString('base64').substring(0, 50)}`;

  // Try cache first
  if (useCache) {
    const cached = await get(cacheKey);
    if (cached) {
      logger.debug({ cacheKey }, 'Claude API cache hit');
      return cached;
    }
  }

  // Retry logic
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
        const result = content.text;
        
        // Cache the result (1 hour TTL)
        if (useCache) {
          await set(cacheKey, result, 3600);
        }
        
        return result;
      }

      throw new Error('Unexpected content type from Claude API');
    } catch (error) {
      lastError = error;
      logger.warn({ err: error, attempt, maxRetries }, 'Claude API error, retrying');
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  logger.error({ err: lastError }, 'Claude API failed after retries');
  throw new ExternalAPIError('Claude', lastError.message, lastError, true);
}

/**
 * Generate content with system prompt (with retry logic and caching)
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {object} options - Optional parameters
 * @returns {Promise<string>} Generated content
 */
export async function generateContentWithSystem(systemPrompt, userPrompt, options = {}) {
  const {
    model = config.api.claudeModel || 'claude-3-haiku-20240307',
    maxTokens = 4096,
    useCache = true,
  } = options;

  // Create cache key
  const cacheKey = `claude:${model}:system:${Buffer.from(systemPrompt + userPrompt).toString('base64').substring(0, 50)}`;

  // Try cache first
  if (useCache) {
    const cached = await get(cacheKey);
    if (cached) {
      logger.debug({ cacheKey }, 'Claude API cache hit (with system)');
      return cached;
    }
  }

  // Retry logic
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
        const result = content.text;
        
        // Cache the result (1 hour TTL)
        if (useCache) {
          await set(cacheKey, result, 3600);
        }
        
        return result;
      }

      throw new Error('Unexpected content type from Claude API');
    } catch (error) {
      lastError = error;
      logger.warn({ err: error, attempt, maxRetries }, 'Claude API error, retrying');
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  logger.error({ err: lastError }, 'Claude API failed after retries');
  throw new ExternalAPIError('Claude', lastError.message, lastError, true);
}

