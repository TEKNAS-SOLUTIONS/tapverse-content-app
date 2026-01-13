-- Migration: Create Analytics Tables
-- Date: 2026-01-13
-- Description: Add tables for tracking content performance and analytics

CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES content_schedules(id) ON DELETE SET NULL,
  
  -- Platform Details
  platform VARCHAR(50) NOT NULL, -- 'linkedin', 'facebook', 'instagram', 'twitter', 'tiktok', 'email', 'blog'
  content_type VARCHAR(50) NOT NULL,
  
  -- Engagement Metrics
  views INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  
  -- Email Metrics
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  
  -- Conversion Metrics
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Time-based Metrics
  engagement_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage
  click_through_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage
  open_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage (for emails)
  
  -- Date Range
  date_from TIMESTAMP WITH TIME ZONE NOT NULL,
  date_to TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_project_id ON content_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_client_id ON content_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date_from ON content_analytics(date_from);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date_to ON content_analytics(date_to);

-- Analytics Summary Table (for quick dashboard queries)
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Summary Period
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Total Metrics
  total_content INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_conversion_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Platform Breakdown (JSONB for flexibility)
  platform_breakdown JSONB DEFAULT '{}',
  
  -- Metadata
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, project_id, period_type, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_client_id ON analytics_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_project_id ON analytics_summary(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_period ON analytics_summary(period_type, period_start, period_end);

