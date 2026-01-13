-- Migration: Add competitors to clients and article_ideas table
-- Date: 2026-01-12

-- Add new columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS competitors TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS brand_voice TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS brand_tone VARCHAR(50) DEFAULT 'professional';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS content_guidelines TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sample_content TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscribed_services TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Platform IDs for client-level integration
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_search_console_property VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_analytics_property_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS facebook_ad_account_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram_account_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS linkedin_page_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS linkedin_ad_account_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tiktok_account_id VARCHAR(100);

-- Update projects table to support multiple types and link to client competitors
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_types TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_competitors TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS generated_content_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Article Ideas table for storing generated ideas before article creation
CREATE TABLE IF NOT EXISTS article_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Optional link to project
  
  -- Idea details
  title VARCHAR(500) NOT NULL,
  primary_keyword VARCHAR(255),
  secondary_keywords TEXT[],
  search_intent VARCHAR(50), -- 'informational', 'commercial', 'transactional', 'navigational'
  
  -- Analysis data
  estimated_search_volume VARCHAR(50), -- e.g., '1K-10K', '10K-100K'
  estimated_difficulty VARCHAR(20), -- 'low', 'medium', 'high'
  trending_score INT DEFAULT 0, -- 0-100 based on trend analysis
  competitor_gap_score INT DEFAULT 0, -- 0-100 based on what competitors miss
  
  -- Content planning
  content_type VARCHAR(50), -- 'how-to', 'listicle', 'guide', 'comparison', 'case-study', 'news'
  unique_angle TEXT,
  outline JSONB, -- Array of sections/headers
  target_featured_snippet VARCHAR(50), -- 'paragraph', 'list', 'table', 'none'
  
  -- Source of idea
  idea_source VARCHAR(50), -- 'competitor_analysis', 'trending', 'keyword_gap', 'user_suggested'
  source_details JSONB, -- Details about where idea came from
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'selected', 'generating', 'generated', 'rejected'
  generated_content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for article_ideas updated_at
CREATE TRIGGER update_article_ideas_updated_at BEFORE UPDATE ON article_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_article_ideas_client ON article_ideas(client_id);
CREATE INDEX IF NOT EXISTS idx_article_ideas_status ON article_ideas(status);
CREATE INDEX IF NOT EXISTS idx_article_ideas_trending ON article_ideas(trending_score DESC);

-- Add Google Analytics and Search Console API settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_secret)
VALUES 
  ('google_oauth_client_id', '', 'string', 'api_keys', 'Google OAuth Client ID for GSC and GA4 access', FALSE),
  ('google_oauth_client_secret', '', 'string', 'api_keys', 'Google OAuth Client Secret', TRUE),
  ('google_oauth_refresh_token', '', 'string', 'api_keys', 'Google OAuth Refresh Token', TRUE),
  ('semrush_api_key', '', 'string', 'api_keys', 'SEMrush API Key for keyword research', TRUE),
  ('ahrefs_api_key', '', 'string', 'api_keys', 'Ahrefs API Key for competitor analysis', TRUE)
ON CONFLICT (setting_key) DO NOTHING;

