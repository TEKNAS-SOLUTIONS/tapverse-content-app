-- Migration: Create SEO Strategies Table
-- Date: 2026-01-13
-- Description: Add table for storing comprehensive SEO strategies

CREATE TABLE IF NOT EXISTS seo_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Keywords
  primary_keywords TEXT[] NOT NULL DEFAULT '{}',
  secondary_keywords TEXT[] NOT NULL DEFAULT '{}',
  
  -- Strategy Components
  content_pillars JSONB NOT NULL DEFAULT '[]',
  content_calendar JSONB NOT NULL DEFAULT '[]',
  technical_seo_recommendations TEXT,
  link_building_opportunities JSONB NOT NULL DEFAULT '[]',
  content_gap_analysis JSONB NOT NULL DEFAULT '[]',
  competitor_gaps JSONB NOT NULL DEFAULT '[]',
  
  -- Strategy Overview
  executive_summary TEXT,
  target_audience_analysis TEXT,
  competitor_analysis_summary TEXT,
  keyword_research_summary TEXT,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_seo_strategies_client_id ON seo_strategies(client_id);
CREATE INDEX IF NOT EXISTS idx_seo_strategies_project_id ON seo_strategies(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_strategies_created_at ON seo_strategies(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_seo_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seo_strategies_updated_at
  BEFORE UPDATE ON seo_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_strategies_updated_at();

-- Update system_settings to use Claude Sonnet as default
UPDATE system_settings 
SET setting_value = 'claude-3-5-sonnet-20241022'
WHERE setting_key = 'claude_model';

