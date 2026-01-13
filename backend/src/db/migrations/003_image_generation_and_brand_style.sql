-- Migration: Add brand_style to clients and new API keys for image/video generation

-- Add brand_style column to clients for image generation consistency
ALTER TABLE clients ADD COLUMN IF NOT EXISTS brand_style JSONB;

-- Add new API key settings for all services
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_secret)
VALUES
  -- AI Content APIs
  ('openai_api_key', '', 'string', 'api_keys', 'OpenAI API Key (for DALL-E 3 and GPT)', TRUE),
  
  -- Image Generation APIs
  ('leonardo_api_key', '', 'string', 'api_keys', 'Leonardo.ai API Key (for marketing creatives)', TRUE),
  ('stability_api_key', '', 'string', 'api_keys', 'Stability AI API Key (for Stable Diffusion)', TRUE),
  ('ideogram_api_key', '', 'string', 'api_keys', 'Ideogram API Key (for text-in-image)', TRUE),
  
  -- Video Generation APIs  
  ('heygen_api_key', '', 'string', 'api_keys', 'HeyGen API Key (for AI avatar videos)', TRUE),
  ('elevenlabs_api_key', '', 'string', 'api_keys', 'ElevenLabs API Key (for voice/audio)', TRUE),
  
  -- Social Media APIs
  ('facebook_access_token', '', 'string', 'api_keys', 'Facebook/Meta Marketing API Access Token', TRUE),
  ('facebook_app_id', '', 'string', 'api_keys', 'Facebook App ID', FALSE),
  ('facebook_app_secret', '', 'string', 'api_keys', 'Facebook App Secret', TRUE),
  
  ('instagram_access_token', '', 'string', 'api_keys', 'Instagram Graph API Access Token', TRUE),
  
  ('linkedin_access_token', '', 'string', 'api_keys', 'LinkedIn Marketing API Access Token', TRUE),
  ('linkedin_client_id', '', 'string', 'api_keys', 'LinkedIn Client ID', FALSE),
  ('linkedin_client_secret', '', 'string', 'api_keys', 'LinkedIn Client Secret', TRUE),
  
  ('twitter_api_key', '', 'string', 'api_keys', 'Twitter/X API Key', TRUE),
  ('twitter_api_secret', '', 'string', 'api_keys', 'Twitter/X API Secret', TRUE),
  ('twitter_access_token', '', 'string', 'api_keys', 'Twitter/X Access Token', TRUE),
  ('twitter_access_secret', '', 'string', 'api_keys', 'Twitter/X Access Token Secret', TRUE),
  
  ('tiktok_access_token', '', 'string', 'api_keys', 'TikTok Marketing API Access Token', TRUE),
  
  -- Advertising APIs
  ('google_ads_developer_token', '', 'string', 'api_keys', 'Google Ads Developer Token', TRUE),
  ('google_ads_client_id', '', 'string', 'api_keys', 'Google Ads OAuth Client ID', FALSE),
  ('google_ads_client_secret', '', 'string', 'api_keys', 'Google Ads OAuth Client Secret', TRUE),
  ('google_ads_refresh_token', '', 'string', 'api_keys', 'Google Ads OAuth Refresh Token', TRUE)
  
ON CONFLICT (setting_key) DO NOTHING;

-- Create table for storing generated images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  generation_id VARCHAR(255), -- External provider ID
  provider VARCHAR(50) NOT NULL, -- leonardo, dalle, stability
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_id VARCHAR(255),
  preset_style VARCHAR(100),
  width INT,
  height INT,
  image_url TEXT,
  image_base64 TEXT,
  platform VARCHAR(50), -- instagram, facebook, linkedin, etc
  content_type VARCHAR(50), -- post, story, ad, cover
  metadata JSONB, -- Additional generation params
  status VARCHAR(50) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_generated_images_updated_at BEFORE UPDATE ON generated_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_generated_images_client_id ON generated_images(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_project_id ON generated_images(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_provider ON generated_images(provider);

-- Create table for storing generated videos
CREATE TABLE IF NOT EXISTS generated_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  video_id VARCHAR(255), -- External provider ID (HeyGen)
  provider VARCHAR(50) NOT NULL DEFAULT 'heygen',
  script TEXT,
  script_data JSONB, -- Full script JSON
  avatar_id VARCHAR(255),
  voice_id VARCHAR(255),
  duration_seconds INT,
  video_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'processing',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_generated_videos_updated_at BEFORE UPDATE ON generated_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_generated_videos_client_id ON generated_videos(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_project_id ON generated_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);

-- Create table for voice clones
CREATE TABLE IF NOT EXISTS voice_clones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  voice_id VARCHAR(255) NOT NULL, -- ElevenLabs voice ID
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(50) NOT NULL DEFAULT 'elevenlabs',
  sample_urls TEXT[], -- Original audio samples
  labels JSONB, -- accent, gender, age, etc
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voice_clones_client_id ON voice_clones(client_id);

-- Create table for custom avatars
CREATE TABLE IF NOT EXISTS custom_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  avatar_id VARCHAR(255) NOT NULL, -- HeyGen avatar ID
  name VARCHAR(255) NOT NULL,
  avatar_type VARCHAR(50) DEFAULT 'photo', -- photo, video, custom
  provider VARCHAR(50) NOT NULL DEFAULT 'heygen',
  preview_url TEXT,
  status VARCHAR(50) DEFAULT 'ready', -- training, ready, failed
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_avatars_client_id ON custom_avatars(client_id);

