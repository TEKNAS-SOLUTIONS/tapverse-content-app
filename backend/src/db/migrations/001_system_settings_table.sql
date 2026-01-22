-- Migration: Create system_settings table for API keys and configuration
-- Date: 2026-01-17

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  category VARCHAR(100) DEFAULT 'general', -- 'api_keys', 'general', 'integrations', etc.
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default API keys (if they don't exist)
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_secret)
VALUES 
  ('anthropic_api_key', '', 'string', 'api_keys', 'Anthropic Claude API Key', TRUE),
  ('claude_model', 'claude-3-haiku-20240307', 'string', 'api_keys', 'Claude Model to use', FALSE),
  ('dataforseo_login', '', 'string', 'api_keys', 'DataForSEO Login Email', FALSE),
  ('dataforseo_password', '', 'string', 'api_keys', 'DataForSEO Password', TRUE)
ON CONFLICT (setting_key) DO NOTHING;
