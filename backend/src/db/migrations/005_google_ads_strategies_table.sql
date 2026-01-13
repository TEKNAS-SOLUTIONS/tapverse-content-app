-- Migration: Create Google Ads Strategies Table
-- Date: 2026-01-13
-- Description: Add table for storing comprehensive Google Ads strategies

CREATE TABLE IF NOT EXISTS google_ads_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Campaign Structure
  campaign_structure JSONB NOT NULL DEFAULT '[]',
  recommended_campaigns JSONB NOT NULL DEFAULT '[]',
  
  -- Keywords
  primary_keywords JSONB NOT NULL DEFAULT '[]',
  keyword_match_types JSONB NOT NULL DEFAULT '[]',
  negative_keywords TEXT[] NOT NULL DEFAULT '{}',
  
  -- Ad Copy
  ad_copy_variations JSONB NOT NULL DEFAULT '[]',
  headline_suggestions JSONB NOT NULL DEFAULT '[]',
  description_suggestions JSONB NOT NULL DEFAULT '[]',
  
  -- Strategy Components
  landing_page_recommendations TEXT,
  bid_strategy_recommendations TEXT,
  budget_allocation JSONB NOT NULL DEFAULT '[]',
  ab_testing_suggestions JSONB NOT NULL DEFAULT '[]',
  
  -- Strategy Overview
  executive_summary TEXT,
  target_audience_analysis TEXT,
  competitor_analysis TEXT,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_google_ads_strategies_client_id ON google_ads_strategies(client_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_strategies_project_id ON google_ads_strategies(project_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_strategies_created_at ON google_ads_strategies(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_google_ads_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_google_ads_strategies_updated_at
  BEFORE UPDATE ON google_ads_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_google_ads_strategies_updated_at();

