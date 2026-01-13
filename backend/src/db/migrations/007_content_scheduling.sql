-- Migration: Create Content Scheduling Tables
-- Date: 2026-01-13
-- Description: Add tables for scheduling content publishing across platforms

CREATE TABLE IF NOT EXISTS content_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Scheduling Details
  platform VARCHAR(50) NOT NULL, -- 'linkedin', 'facebook', 'instagram', 'twitter', 'tiktok', 'email'
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Publishing Details
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'published', 'failed', 'cancelled'
  published_at TIMESTAMP WITH TIME ZONE,
  publish_url TEXT,
  publish_id TEXT, -- Platform-specific post ID
  
  -- Content Details
  content_type VARCHAR(50) NOT NULL, -- 'blog', 'social', 'ad', 'video', 'email'
  content_data JSONB, -- Store platform-specific content (captions, hashtags, etc.)
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_content_schedules_project_id ON content_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_content_schedules_client_id ON content_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_content_schedules_scheduled_at ON content_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_schedules_status ON content_schedules(status);
CREATE INDEX IF NOT EXISTS idx_content_schedules_platform ON content_schedules(platform);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_content_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_schedules_updated_at
  BEFORE UPDATE ON content_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_content_schedules_updated_at();

