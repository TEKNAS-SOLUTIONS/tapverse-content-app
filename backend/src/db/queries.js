import { query, getClient } from './index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Client Database Operations
 */

export async function createClient(clientData) {
  const id = uuidv4();
  const {
    tapverse_client_id,
    company_name,
    website_url,
    industry,
    target_audience,
    unique_selling_points,
    // Competitors at client level
    competitors = [],
    // Brand & Content
    subscribed_services = [],
    brand_voice,
    brand_tone = 'professional',
    content_guidelines,
    sample_content,
    // Platform IDs
    google_ads_customer_id,
    google_search_console_property,
    google_analytics_property_id,
    facebook_ad_account_id,
    facebook_page_id,
    instagram_account_id,
    linkedin_page_id,
    linkedin_ad_account_id,
    twitter_handle,
    tiktok_account_id,
    // Business Types
    business_types = ['general'],
    primary_business_type = 'general',
    location,
    shopify_url,
  } = clientData;

  const result = await query(
    `INSERT INTO clients (
      id, tapverse_client_id, company_name, website_url, 
      industry, target_audience, unique_selling_points, competitors,
      subscribed_services, brand_voice, brand_tone, content_guidelines, sample_content,
      google_ads_customer_id, google_search_console_property, google_analytics_property_id,
      facebook_ad_account_id, facebook_page_id, instagram_account_id, 
      linkedin_page_id, linkedin_ad_account_id, twitter_handle, tiktok_account_id,
      business_types, primary_business_type, location, shopify_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
    RETURNING *`,
    [
      id, tapverse_client_id, company_name, website_url, 
      industry, target_audience, unique_selling_points, competitors,
      subscribed_services, brand_voice, brand_tone, content_guidelines, sample_content,
      google_ads_customer_id, google_search_console_property, google_analytics_property_id,
      facebook_ad_account_id, facebook_page_id, instagram_account_id,
      linkedin_page_id, linkedin_ad_account_id, twitter_handle, tiktok_account_id,
      business_types, primary_business_type, location, shopify_url
    ]
  );

  return result.rows[0];
}

export async function getClientById(id) {
  const result = await query('SELECT * FROM clients WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getClientByTapverseId(tapverse_client_id) {
  const result = await query('SELECT * FROM clients WHERE tapverse_client_id = $1', [tapverse_client_id]);
  return result.rows[0];
}

export async function getAllClients() {
  const result = await query('SELECT * FROM clients WHERE is_active = TRUE ORDER BY created_at DESC');
  return result.rows;
}

export async function updateClient(id, clientData) {
  const {
    company_name,
    website_url,
    industry,
    target_audience,
    unique_selling_points,
    is_active,
    // Competitors at client level
    competitors,
    // Brand & Content
    subscribed_services,
    brand_voice,
    brand_tone,
    content_guidelines,
    sample_content,
    // Platform IDs
    google_ads_customer_id,
    google_search_console_property,
    google_analytics_property_id,
    facebook_ad_account_id,
    facebook_page_id,
    instagram_account_id,
    linkedin_page_id,
    linkedin_ad_account_id,
    twitter_handle,
    tiktok_account_id,
    // Business Types
    business_types,
    primary_business_type,
    location,
    shopify_url,
  } = clientData;

  const result = await query(
    `UPDATE clients 
    SET company_name = COALESCE($1, company_name),
        website_url = COALESCE($2, website_url),
        industry = COALESCE($3, industry),
        target_audience = COALESCE($4, target_audience),
        unique_selling_points = COALESCE($5, unique_selling_points),
        is_active = COALESCE($6, is_active),
        competitors = COALESCE($7, competitors),
        subscribed_services = COALESCE($8, subscribed_services),
        brand_voice = COALESCE($9, brand_voice),
        brand_tone = COALESCE($10, brand_tone),
        content_guidelines = COALESCE($11, content_guidelines),
        sample_content = COALESCE($12, sample_content),
        google_ads_customer_id = COALESCE($13, google_ads_customer_id),
        google_search_console_property = COALESCE($14, google_search_console_property),
        google_analytics_property_id = COALESCE($15, google_analytics_property_id),
        facebook_ad_account_id = COALESCE($16, facebook_ad_account_id),
        facebook_page_id = COALESCE($17, facebook_page_id),
        instagram_account_id = COALESCE($18, instagram_account_id),
        linkedin_page_id = COALESCE($19, linkedin_page_id),
        linkedin_ad_account_id = COALESCE($20, linkedin_ad_account_id),
        twitter_handle = COALESCE($21, twitter_handle),
        tiktok_account_id = COALESCE($22, tiktok_account_id),
        business_types = COALESCE($23, business_types),
        primary_business_type = COALESCE($24, primary_business_type),
        location = COALESCE($25, location),
        shopify_url = COALESCE($26, shopify_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $27
    RETURNING *`,
    [
      company_name, website_url, industry, target_audience, unique_selling_points, is_active,
      competitors, subscribed_services, brand_voice, brand_tone, content_guidelines, sample_content,
      google_ads_customer_id, google_search_console_property, google_analytics_property_id,
      facebook_ad_account_id, facebook_page_id, instagram_account_id,
      linkedin_page_id, linkedin_ad_account_id, twitter_handle, tiktok_account_id,
      business_types, primary_business_type, location, shopify_url,
      id
    ]
  );

  return result.rows[0];
}

export async function deleteClient(id) {
  const result = await query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

/**
 * Project Database Operations
 */

export async function createProject(projectData) {
  const id = uuidv4();
  const {
    client_id,
    project_name,
    project_type, // Keep for backward compatibility
    project_types = [], // New: array of types
    keywords,
    competitors,
    target_audience,
    unique_angle,
    content_preferences,
    status = 'draft',
  } = projectData;

  // If project_types is empty but project_type exists, use it
  const finalProjectTypes = project_types.length > 0 
    ? project_types 
    : (project_type ? [project_type] : []);

  const result = await query(
    `INSERT INTO projects (
      id, client_id, project_name, project_type, project_types, keywords, 
      competitors, target_audience, unique_angle, 
      content_preferences, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      id, client_id, project_name, 
      project_type || (finalProjectTypes[0] || null), // First type for backward compat
      finalProjectTypes,
      keywords, competitors, target_audience, unique_angle, 
      content_preferences, status
    ]
  );

  return result.rows[0];
}

export async function getProjectById(id) {
  const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getProjectsByClientId(client_id) {
  const result = await query('SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC', [client_id]);
  return result.rows;
}

export async function getAllProjects() {
  const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
  return result.rows;
}

export async function updateProject(id, projectData) {
  const {
    project_name,
    project_type,
    project_types,
    keywords,
    competitors,
    target_audience,
    unique_angle,
    content_preferences,
    status,
    generated_content_types,
  } = projectData;

  const result = await query(
    `UPDATE projects 
    SET project_name = COALESCE($1, project_name),
        project_type = COALESCE($2, project_type),
        project_types = COALESCE($3, project_types),
        keywords = COALESCE($4, keywords),
        competitors = COALESCE($5, competitors),
        target_audience = COALESCE($6, target_audience),
        unique_angle = COALESCE($7, unique_angle),
        content_preferences = COALESCE($8, content_preferences),
        status = COALESCE($9, status),
        generated_content_types = COALESCE($10, generated_content_types),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *`,
    [
      project_name, project_type, project_types, keywords, competitors, 
      target_audience, unique_angle, content_preferences, status, 
      generated_content_types, id
    ]
  );

  return result.rows[0];
}

export async function deleteProject(id) {
  const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

/**
 * Content Database Operations
 */

export async function createContent(contentData) {
  const id = uuidv4();
  const {
    project_id,
    content_type,
    title,
    content,
    meta_description,
    keywords = [],
    platform,
    status = 'draft',
    seo_score,
    engagement_score,
  } = contentData;

  const result = await query(
    `INSERT INTO content (
      id, project_id, content_type, title, content, 
      meta_description, keywords, platform, status,
      seo_score, engagement_score
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      id, project_id, content_type, title, content,
      meta_description, keywords, platform, status,
      seo_score, engagement_score
    ]
  );

  return result.rows[0];
}

export async function getContentByProjectId(projectId) {
  const result = await query(
    'SELECT * FROM content WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId]
  );
  return result.rows;
}

export async function getContentByType(projectId, contentType) {
  const result = await query(
    'SELECT * FROM content WHERE project_id = $1 AND content_type = $2 ORDER BY created_at DESC',
    [projectId, contentType]
  );
  return result.rows;
}

export async function updateContent(id, contentData) {
  const { title, content, meta_description, status, seo_score, engagement_score } = contentData;

  const result = await query(
    `UPDATE content 
    SET title = COALESCE($1, title),
        content = COALESCE($2, content),
        meta_description = COALESCE($3, meta_description),
        status = COALESCE($4, status),
        seo_score = COALESCE($5, seo_score),
        engagement_score = COALESCE($6, engagement_score),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *`,
    [title, content, meta_description, status, seo_score, engagement_score, id]
  );

  return result.rows[0];
}

/**
 * Ads Database Operations
 */

export async function createAd(adData) {
  const id = uuidv4();
  const {
    project_id,
    ad_type,
    platform,
    headline,
    body_text,
    cta_text,
    target_keywords = [],
    estimated_cpc,
    estimated_ctr,
    status = 'draft',
  } = adData;

  const result = await query(
    `INSERT INTO ads (
      id, project_id, ad_type, platform, headline, body_text,
      cta_text, target_keywords, estimated_cpc, estimated_ctr, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      id, project_id, ad_type, platform, headline, body_text,
      cta_text, target_keywords, estimated_cpc, estimated_ctr, status
    ]
  );

  return result.rows[0];
}

export async function getAdsByProjectId(projectId) {
  const result = await query(
    'SELECT * FROM ads WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId]
  );
  return result.rows;
}

export async function getAdsByType(projectId, adType) {
  const result = await query(
    'SELECT * FROM ads WHERE project_id = $1 AND ad_type = $2 ORDER BY created_at DESC',
    [projectId, adType]
  );
  return result.rows;
}

/**
 * System Settings Database Operations
 */

export async function getSetting(key) {
  const result = await query(
    'SELECT * FROM system_settings WHERE setting_key = $1',
    [key]
  );
  return result.rows[0];
}

export async function getAllSettings() {
  const result = await query(
    'SELECT setting_key, setting_value, setting_type, category, description, is_secret FROM system_settings ORDER BY category, setting_key'
  );
  return result.rows;
}

export async function updateSetting(key, value) {
  const result = await query(
    `UPDATE system_settings 
     SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE setting_key = $2 
     RETURNING *`,
    [value, key]
  );
  
  // If no rows updated, insert new setting
  if (result.rows.length === 0) {
    const insertResult = await query(
      `INSERT INTO system_settings (setting_key, setting_value, category) 
       VALUES ($1, $2, 'custom') 
       RETURNING *`,
      [key, value]
    );
    return insertResult.rows[0];
  }
  
  return result.rows[0];
}

/**
 * API Usage Tracking
 */

export async function trackApiUsage(clientId, apiName, tokensUsed, cost) {
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
  
  const result = await query(
    `INSERT INTO api_usage (client_id, api_name, request_count, tokens_used, cost, month)
     VALUES ($1, $2, 1, $3, $4, $5)
     ON CONFLICT (client_id, api_name, month) 
     DO UPDATE SET 
       request_count = api_usage.request_count + 1,
       tokens_used = api_usage.tokens_used + $3,
       cost = api_usage.cost + $4
     RETURNING *`,
    [clientId, apiName, tokensUsed, cost, currentMonth]
  );

  return result.rows[0];
}

export async function getApiUsageByClient(clientId, startMonth, endMonth) {
  const result = await query(
    `SELECT * FROM api_usage 
     WHERE client_id = $1 AND month >= $2 AND month <= $3
     ORDER BY month DESC, api_name`,
    [clientId, startMonth, endMonth]
  );
  return result.rows;
}

/**
 * Article Ideas Database Operations
 */

export async function createArticleIdea(ideaData) {
  const id = uuidv4();
  const {
    client_id,
    project_id,
    title,
    primary_keyword,
    secondary_keywords = [],
    search_intent,
    estimated_search_volume,
    estimated_difficulty,
    trending_score = 0,
    competitor_gap_score = 0,
    content_type,
    unique_angle,
    outline,
    target_featured_snippet,
    idea_source,
    source_details,
    status = 'pending',
  } = ideaData;

  const result = await query(
    `INSERT INTO article_ideas (
      id, client_id, project_id, title, primary_keyword, secondary_keywords,
      search_intent, estimated_search_volume, estimated_difficulty,
      trending_score, competitor_gap_score, content_type, unique_angle,
      outline, target_featured_snippet, idea_source, source_details, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *`,
    [
      id, client_id, project_id, title, primary_keyword, secondary_keywords,
      search_intent, estimated_search_volume, estimated_difficulty,
      trending_score, competitor_gap_score, content_type, unique_angle,
      JSON.stringify(outline), target_featured_snippet, idea_source, 
      JSON.stringify(source_details), status
    ]
  );

  return result.rows[0];
}

export async function getArticleIdeasByClient(clientId) {
  const result = await query(
    `SELECT * FROM article_ideas 
     WHERE client_id = $1 
     ORDER BY trending_score DESC, competitor_gap_score DESC, created_at DESC`,
    [clientId]
  );
  return result.rows;
}

export async function getArticleIdeasByProject(projectId) {
  const result = await query(
    `SELECT * FROM article_ideas 
     WHERE project_id = $1 
     ORDER BY trending_score DESC, competitor_gap_score DESC, created_at DESC`,
    [projectId]
  );
  return result.rows;
}

export async function getArticleIdeaById(id) {
  const result = await query('SELECT * FROM article_ideas WHERE id = $1', [id]);
  return result.rows[0];
}

export async function updateArticleIdea(id, ideaData) {
  const { status, generated_content_id, project_id } = ideaData;

  const result = await query(
    `UPDATE article_ideas 
     SET status = COALESCE($1, status),
         generated_content_id = COALESCE($2, generated_content_id),
         project_id = COALESCE($3, project_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [status, generated_content_id, project_id, id]
  );

  return result.rows[0];
}

export async function deleteArticleIdea(id) {
  const result = await query('DELETE FROM article_ideas WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

export async function bulkCreateArticleIdeas(clientId, projectId, ideas) {
  const results = [];
  for (const idea of ideas) {
    const result = await createArticleIdea({
      client_id: clientId,
      project_id: projectId,
      ...idea,
    });
    results.push(result);
  }
  return results;
}
