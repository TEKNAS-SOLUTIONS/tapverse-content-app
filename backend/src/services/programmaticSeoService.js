import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';
import axios from 'axios';

/**
 * Programmatic SEO Service
 * 
 * Generates content for Service + Location combinations
 * Example: "Plumber in Melbourne CBD", "Electrician in South Yarra"
 */

/**
 * Get Google Places Autocomplete API key from database
 */
async function getGooglePlacesApiKey() {
  try {
    const result = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'google_places_api_key' AND setting_value != ''"
    );
    if (result.rows.length > 0 && result.rows[0].setting_value) {
      return result.rows[0].setting_value;
    }
  } catch (error) {
    console.error('Error fetching Google Places API key:', error);
  }
  return process.env.GOOGLE_PLACES_API_KEY;
}

/**
 * Get location suggestions from Google Places Autocomplete API
 * @param {string} input - Location search query
 * @param {string} types - Types filter (default: '(cities)')
 * @returns {Promise<Array>} Array of location suggestions
 */
export async function getLocationSuggestions(input, types = '(cities)') {
  try {
    const apiKey = await getGooglePlacesApiKey();
    if (!apiKey) {
      console.warn('Google Places API key not found, returning empty suggestions');
      return [];
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input,
        key: apiKey,
        types: types,
        language: 'en',
      },
      timeout: 5000,
    });

    if (response.data.status === 'OK' && response.data.predictions) {
      return response.data.predictions.map(prediction => ({
        id: prediction.place_id,
        description: prediction.description,
        structured_formatting: prediction.structured_formatting,
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Places Autocomplete API error:', error.message);
    return [];
  }
}

/**
 * Generate programmatic SEO content for a Service + Location combination
 * @param {object} params - Generation parameters
 * @returns {Promise<object>} Generated content
 */
export async function generateProgrammaticContent(params) {
  const {
    clientId,
    projectId,
    service,
    location,
    clientData = {},
    projectData = {},
    contentTemplate = '[SERVICE] in [LOCATION]',
  } = params;

  const systemPrompt = `You are an expert SEO content writer specializing in local business content. 
Create unique, SEO-optimized content for service-based businesses in specific locations.
Each piece of content must be unique and tailored to the location while maintaining quality and SEO value.`;

  const keyword = contentTemplate
    .replace('[SERVICE]', service)
    .replace('[LOCATION]', location);

  const userPrompt = `Generate a comprehensive SEO-optimized page for:

SERVICE: ${service}
LOCATION: ${location}
KEYWORD: ${keyword}
COMPANY: ${clientData.company_name || 'Business'}
INDUSTRY: ${clientData.industry || 'Services'}

Requirements:
- 800-1200 words (optimized for local SEO)
- Include location-specific information naturally
- Focus on local search intent
- Include service area coverage
- Add local landmarks/references if appropriate
- Include call-to-action with location
- Optimize for "near me" searches
- Include schema markup suggestions

Content Structure:
1. SEO Title (60 chars max): Include service and location
2. Meta Description (160 chars max): Include location and service benefits
3. H1: Main heading with service and location
4. Introduction: Engaging intro mentioning location
5. Service Details: What the service offers in this location
6. Service Area: Coverage in and around the location
7. Why Choose Us: Benefits specific to local customers
8. Local Information: Relevant local context
9. Call to Action: Location-specific CTA

Format as JSON:
{
  "title": "SEO title",
  "metaDescription": "Meta description",
  "content": "Full HTML content with proper headings",
  "h1": "Main heading",
  "keywords": ["array", "of", "relevant", "keywords"],
  "schemaMarkup": {
    "type": "LocalBusiness",
    "suggestions": ["schema properties to include"]
  },
  "wordCount": 1000
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      maxTokens: 4096,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Save to database if projectId provided
      if (projectId) {
        await saveProgrammaticContent({
          projectId,
          clientId,
          service,
          location,
          keyword,
          content: parsed,
        });
      }

      return {
        success: true,
        service,
        location,
        keyword,
        ...parsed,
      };
    }

    throw new Error('Failed to parse generated content');
  } catch (error) {
    console.error('Error generating programmatic content:', error);
    throw error;
  }
}

/**
 * Generate content for multiple Service + Location combinations
 * @param {object} params - Batch generation parameters
 * @returns {Promise<Array>} Array of generated content
 */
export async function generateBatchProgrammaticContent(params) {
  const {
    clientId,
    projectId,
    services = [],
    locations = [],
    contentType = 'service_location', // 'service_location', 'service_only', 'location_only'
    clientData = {},
    projectData = {},
  } = params;

  // Validate batch size (max 50)
  const combinations = getCombinations(services, locations, contentType);
  if (combinations.length > 50) {
    throw new Error(`Maximum 50 combinations allowed. You have ${combinations.length}. Please reduce services or locations.`);
  }

  const results = [];
  const errors = [];

  for (const combo of combinations) {
    try {
      const content = await generateProgrammaticContent({
        clientId,
        projectId,
        service: combo.service || '',
        location: combo.location || '',
        clientData,
        projectData,
        contentTemplate: getContentTemplate(contentType),
      });
      results.push(content);
      
      // Rate limiting: small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      errors.push({
        service: combo.service,
        location: combo.location,
        error: error.message,
      });
    }
  }

  return {
    success: true,
    generated: results.length,
    total: combinations.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Get combinations based on content type
 */
function getCombinations(services, locations, contentType) {
  const combinations = [];

  if (contentType === 'service_location') {
    for (const service of services) {
      for (const location of locations) {
        combinations.push({ service, location });
      }
    }
  } else if (contentType === 'service_only') {
    for (const service of services) {
      combinations.push({ service, location: '' });
    }
  } else if (contentType === 'location_only') {
    for (const location of locations) {
      combinations.push({ service: '', location });
    }
  }

  return combinations;
}

/**
 * Get content template based on type
 */
function getContentTemplate(contentType) {
  switch (contentType) {
    case 'service_location':
      return '[SERVICE] in [LOCATION]';
    case 'service_only':
      return '[SERVICE] Services';
    case 'location_only':
      return 'Services in [LOCATION]';
    default:
      return '[SERVICE] in [LOCATION]';
  }
}

/**
 * Save programmatic content to database
 */
async function saveProgrammaticContent(data) {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS programmatic_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        service VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        title TEXT,
        meta_description TEXT,
        content JSONB,
        h1 TEXT,
        keywords_array JSONB,
        schema_markup JSONB,
        word_count INTEGER,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, service, location)
      )
    `);

    const result = await pool.query(`
      INSERT INTO programmatic_content (
        project_id, client_id, service, location, keyword,
        title, meta_description, content, h1, keywords_array, schema_markup, word_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (project_id, service, location) 
      DO UPDATE SET
        title = EXCLUDED.title,
        meta_description = EXCLUDED.meta_description,
        content = EXCLUDED.content,
        h1 = EXCLUDED.h1,
        keywords_array = EXCLUDED.keywords_array,
        schema_markup = EXCLUDED.schema_markup,
        word_count = EXCLUDED.word_count,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      data.projectId,
      data.clientId,
      data.service,
      data.location,
      data.keyword,
      data.content.title,
      data.content.metaDescription,
      JSON.stringify(data.content.content),
      data.content.h1,
      JSON.stringify(data.content.keywords || []),
      JSON.stringify(data.content.schemaMarkup || {}),
      data.content.wordCount || 0,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving programmatic content:', error);
    throw error;
  }
}

/**
 * Get programmatic content by project
 */
export async function getProgrammaticContentByProject(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM programmatic_content WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching programmatic content:', error);
    return [];
  }
}

export default {
  getLocationSuggestions,
  generateProgrammaticContent,
  generateBatchProgrammaticContent,
  getProgrammaticContentByProject,
};
