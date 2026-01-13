-- Migration: Create Facebook Ads Strategies Table
-- Date: 2026-01-13
-- Description: Add table for storing comprehensive Facebook/Instagram Ads strategies

CREATE TABLE IF NOT EXISTS facebook_ads_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Campaign Structure
  campaign_structure JSONB NOT NULL DEFAULT '[]',
  campaign_objectives JSONB NOT NULL DEFAULT '[]',
  
  -- Audience Targeting
  audience_targeting JSONB NOT NULL DEFAULT '[]',
  custom_audiences JSONB NOT NULL DEFAULT '[]',
  lookalike_audiences JSONB NOT NULL DEFAULT '[]',
  demographic_targeting JSONB NOT NULL DEFAULT '[]',
  
  -- Ad Creative
  ad_creative_concepts JSONB NOT NULL DEFAULT '[]',
  image_suggestions JSONB NOT NULL DEFAULT '[]',
  video_suggestions JSONB NOT NULL DEFAULT '[]',
  copy_variations JSONB NOT NULL DEFAULT '[]',
  
  -- Strategy Components
  placement_recommendations TEXT,
  budget_strategy TEXT,
  bidding_strategy TEXT,
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
CREATE INDEX IF NOT EXISTS idx_facebook_ads_strategies_client_id ON facebook_ads_strategies(client_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_strategies_project_id ON facebook_ads_strategies(project_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_strategies_created_at ON facebook_ads_strategies(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_facebook_ads_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_facebook_ads_strategies_updated_at
  BEFORE UPDATE ON facebook_ads_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_facebook_ads_strategies_updated_at();

