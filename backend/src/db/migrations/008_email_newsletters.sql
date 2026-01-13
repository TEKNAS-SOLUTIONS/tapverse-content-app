-- Migration: Create Email Newsletters Table
-- Date: 2026-01-13
-- Description: Add table for storing email newsletter content

CREATE TABLE IF NOT EXISTS email_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Email Content
  subject_line VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  email_body TEXT NOT NULL, -- HTML formatted
  plain_text_body TEXT, -- Plain text version
  
  -- Email Metadata
  from_name VARCHAR(255),
  from_email VARCHAR(255),
  reply_to_email VARCHAR(255),
  
  -- Content Source
  source_content_id UUID REFERENCES content(id),
  source_type VARCHAR(50), -- 'blog', 'article', 'custom'
  
  -- Email Settings
  cta_text VARCHAR(100),
  cta_url TEXT,
  unsubscribe_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Recipients
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_newsletters_project_id ON email_newsletters(project_id);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_client_id ON email_newsletters(client_id);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_status ON email_newsletters(status);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_scheduled_at ON email_newsletters(scheduled_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_email_newsletters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_newsletters_updated_at
  BEFORE UPDATE ON email_newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_email_newsletters_updated_at();

