-- Tapverse Content Automation System Database Schema
-- Phase 1: Core MVP tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3.1.1 Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tapverse_client_id VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(255),
  industry VARCHAR(100),
  target_audience TEXT,
  unique_selling_points TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3.1.2 Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(50), -- 'seo', 'social', 'ads', 'video'
  keywords TEXT[], -- Array of keywords
  competitors TEXT[], -- Array of competitor URLs
  target_audience TEXT,
  unique_angle TEXT,
  content_preferences VARCHAR(50), -- 'professional', 'casual', 'technical', 'creative'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'processing', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.1.3 Content Table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'blog', 'linkedin', 'twitter', 'instagram', 'email', 'google_ads', 'facebook_ads'
  title VARCHAR(255),
  content TEXT,
  meta_description VARCHAR(160),
  keywords TEXT[],
  platform VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'ready', 'published'
  seo_score INT,
  engagement_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.1.5 Ads Table (Phase 1)
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ad_type VARCHAR(50) NOT NULL, -- 'google_search', 'google_display', 'facebook', 'instagram'
  platform VARCHAR(50),
  headline VARCHAR(255),
  body_text TEXT,
  cta_text VARCHAR(100),
  target_keywords TEXT[],
  estimated_cpc DECIMAL(10, 2),
  estimated_ctr DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.1.6 API Usage Tracking Table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  api_name VARCHAR(100) NOT NULL, -- 'claude', 'heyGen', 'elevenLabs', etc.
  request_count INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  month DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, api_name, month)
);

-- 3.2 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_clients_tapverse_id ON clients(tapverse_client_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_content_project_id ON content(project_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_ads_project_id ON ads(project_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_client_month ON api_usage(client_id, month);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- System Settings Table (for API keys and configuration)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'boolean', 'number', 'json'
  category VARCHAR(50) NOT NULL, -- 'api_keys', 'general', 'notifications'
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE, -- If true, value is encrypted/masked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default API key settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_secret)
VALUES 
  ('anthropic_api_key', '', 'string', 'api_keys', 'Anthropic Claude API Key for content generation', TRUE),
  ('claude_model', 'claude-3-haiku-20240307', 'string', 'api_keys', 'Claude model to use (e.g., claude-3-haiku-20240307)', FALSE),
  ('heygen_api_key', '', 'string', 'api_keys', 'HeyGen API Key for AI avatar video creation', TRUE),
  ('elevenlabs_api_key', '', 'string', 'api_keys', 'ElevenLabs API Key for voiceover generation', TRUE),
  ('google_ads_client_id', '', 'string', 'api_keys', 'Google Ads Client ID', TRUE),
  ('google_ads_client_secret', '', 'string', 'api_keys', 'Google Ads Client Secret', TRUE),
  ('google_ads_developer_token', '', 'string', 'api_keys', 'Google Ads Developer Token', TRUE),
  ('facebook_access_token', '', 'string', 'api_keys', 'Facebook Marketing API Access Token', TRUE),
  ('linkedin_client_id', '', 'string', 'api_keys', 'LinkedIn API Client ID', TRUE),
  ('linkedin_client_secret', '', 'string', 'api_keys', 'LinkedIn API Client Secret', TRUE),
  ('twitter_api_key', '', 'string', 'api_keys', 'Twitter API Key', TRUE),
  ('twitter_api_secret', '', 'string', 'api_keys', 'Twitter API Secret', TRUE),
  ('twitter_access_token', '', 'string', 'api_keys', 'Twitter Access Token', TRUE),
  ('twitter_access_secret', '', 'string', 'api_keys', 'Twitter Access Token Secret', TRUE),
  ('instagram_access_token', '', 'string', 'api_keys', 'Instagram API Access Token', TRUE),
  ('tiktok_client_key', '', 'string', 'api_keys', 'TikTok Client Key', TRUE),
  ('tiktok_client_secret', '', 'string', 'api_keys', 'TikTok Client Secret', TRUE)
ON CONFLICT (setting_key) DO NOTHING;

