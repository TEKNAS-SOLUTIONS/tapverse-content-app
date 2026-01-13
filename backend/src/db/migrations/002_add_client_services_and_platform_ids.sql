-- Migration 002: Add client services, platform IDs, and update project types
-- This migration adds multi-service support and platform integration fields

-- ============================================
-- 1. ADD SUBSCRIBED SERVICES TO CLIENTS
-- ============================================
-- Services available:
-- 'seo_content' - SEO blog posts, articles
-- 'social_media' - LinkedIn, Twitter, Instagram, TikTok posts
-- 'google_ads' - Google Ads copy generation
-- 'facebook_ads' - Facebook/Instagram Ads
-- 'ai_video' - HeyGen AI avatar videos
-- 'voiceover' - ElevenLabs voiceover
-- 'ai_content' - General AI content generation (Claude)
-- 'email_marketing' - Email campaigns

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS subscribed_services TEXT[] DEFAULT '{}';

-- ============================================
-- 2. ADD BRAND VOICE/STYLE FIELDS TO CLIENTS
-- ============================================
-- These help AI generate consistent content

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS brand_voice TEXT; -- Detailed brand voice guidelines

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS brand_tone VARCHAR(50) DEFAULT 'professional'; -- 'formal', 'casual', 'friendly', 'professional', 'authoritative', 'playful'

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS content_guidelines TEXT; -- Any specific dos and don'ts

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS sample_content TEXT; -- Example content for AI to learn from

-- ============================================
-- 3. ADD PLATFORM IDS TO CLIENTS
-- ============================================
-- These are the client's account IDs within Tapverse's master accounts

-- Google Ads (under Tapverse's MCC)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(50);

-- Facebook/Meta (under Tapverse's Business Manager)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS facebook_ad_account_id VARCHAR(50);

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(50);

-- Instagram (linked to Facebook Business Manager)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS instagram_account_id VARCHAR(50);

-- LinkedIn
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS linkedin_page_id VARCHAR(50);

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS linkedin_ad_account_id VARCHAR(50);

-- Twitter/X
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100);

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS twitter_account_id VARCHAR(50);

-- TikTok
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS tiktok_account_id VARCHAR(50);

-- ============================================
-- 4. UPDATE PROJECTS TABLE - MULTIPLE TYPES
-- ============================================
-- Change project_type (single) to project_types (array)

-- First, migrate existing data
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_types TEXT[] DEFAULT '{}';

-- Copy existing project_type to project_types array (if not empty)
UPDATE projects 
SET project_types = ARRAY[project_type] 
WHERE project_type IS NOT NULL 
  AND project_type != '' 
  AND (project_types IS NULL OR project_types = '{}');

-- Note: We keep project_type for backward compatibility, 
-- but new code should use project_types

-- ============================================
-- 5. ADD CONTENT GENERATION TRACKING
-- ============================================
-- Track what content types have been generated for each project

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS generated_content_types TEXT[] DEFAULT '{}';

-- ============================================
-- 6. CREATE INDEXES FOR NEW COLUMNS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_subscribed_services ON clients USING GIN(subscribed_services);
CREATE INDEX IF NOT EXISTS idx_projects_project_types ON projects USING GIN(project_types);
CREATE INDEX IF NOT EXISTS idx_clients_google_ads_id ON clients(google_ads_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_facebook_ad_account ON clients(facebook_ad_account_id);

-- ============================================
-- 7. ADD HELPFUL COMMENTS
-- ============================================

COMMENT ON COLUMN clients.subscribed_services IS 'Array of services client has access to: seo_content, social_media, google_ads, facebook_ads, ai_video, voiceover, ai_content, email_marketing';
COMMENT ON COLUMN clients.brand_tone IS 'Brand tone: formal, casual, friendly, professional, authoritative, playful';
COMMENT ON COLUMN clients.google_ads_customer_id IS 'Client Google Ads Customer ID under Tapverse MCC (format: XXX-XXX-XXXX)';
COMMENT ON COLUMN clients.facebook_ad_account_id IS 'Client Facebook Ad Account ID under Tapverse Business Manager';
COMMENT ON COLUMN projects.project_types IS 'Array of project types: seo, social, google_ads, facebook_ads, video, ai_content';

