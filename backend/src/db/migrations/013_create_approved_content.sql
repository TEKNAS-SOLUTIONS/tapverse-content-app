-- Migration: Create approved_content table for CMS integration
-- This table stores content in CMS-ready format for automatic pulling

CREATE TABLE IF NOT EXISTS approved_content (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'seo_blog' or 'programmatic_seo'
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'published'
  
  -- Content Fields
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) UNIQUE,
  
  -- SEO Meta Fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  focus_keyword VARCHAR(255),
  keywords TEXT[], -- Array of keywords
  canonical_url VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url VARCHAR(500),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image_url VARCHAR(500),
  
  -- Programmatic SEO Specific
  suburb VARCHAR(255), -- For programmatic SEO
  service VARCHAR(255), -- For programmatic SEO
  location_data JSONB, -- Google Places API data
  
  -- SEO Blog Specific
  content_idea_id INTEGER, -- Reference to original idea
  keyword_analysis_data JSONB, -- Stored analysis data
  
  -- Publishing Fields
  author_id INTEGER,
  published_at TIMESTAMP,
  scheduled_publish_at TIMESTAMP,
  
  -- CMS Integration
  cms_post_id VARCHAR(255), -- ID in external CMS
  cms_synced_at TIMESTAMP,
  cms_sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by INTEGER
);

-- Indexes for CMS queries
CREATE INDEX IF NOT EXISTS idx_approved_content_status ON approved_content(status);
CREATE INDEX IF NOT EXISTS idx_approved_content_cms_sync ON approved_content(cms_sync_status);
CREATE INDEX IF NOT EXISTS idx_approved_content_type ON approved_content(content_type);
CREATE INDEX IF NOT EXISTS idx_approved_content_project ON approved_content(project_id);
CREATE INDEX IF NOT EXISTS idx_approved_content_client ON approved_content(client_id);

-- Content Drafts Table (for unapproved content)
CREATE TABLE IF NOT EXISTS content_drafts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  title TEXT,
  content TEXT,
  meta_data JSONB, -- Flexible storage for all meta fields
  generated_data JSONB, -- Original generation data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_drafts_project ON content_drafts(project_id);
CREATE INDEX IF NOT EXISTS idx_content_drafts_type ON content_drafts(content_type);
