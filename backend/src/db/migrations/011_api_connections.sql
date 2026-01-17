-- API Connections Management
-- Tapverse manages all API connections centrally
-- Clients are assigned available connections

-- Table: api_connections
-- Stores all API connections (Google Ads, Facebook Ads, Google Search Console, etc.)
CREATE TABLE IF NOT EXISTS api_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_name VARCHAR(255) NOT NULL,
  connection_type VARCHAR(100) NOT NULL, -- 'google_ads', 'facebook_ads', 'google_search_console', 'google_analytics', etc.
  provider VARCHAR(100) NOT NULL, -- 'google', 'facebook', 'microsoft', etc.
  
  -- OAuth/API credentials (encrypted or stored securely)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  
  -- Connection metadata
  account_id VARCHAR(255), -- Google Ads Customer ID, Facebook Ad Account ID, etc.
  account_name VARCHAR(255), -- Display name
  account_email VARCHAR(255), -- Account email if available
  
  -- Additional connection data (JSON)
  connection_data JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255), -- Admin user who created this connection
  
  UNIQUE(connection_type, account_id) -- One connection per account_id per type
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_connections_type ON api_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_api_connections_provider ON api_connections(provider);
CREATE INDEX IF NOT EXISTS idx_api_connections_active ON api_connections(is_active);

-- Table: client_connections
-- Maps which connections are available to which clients
CREATE TABLE IF NOT EXISTS client_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES api_connections(id) ON DELETE CASCADE,
  
  -- Client-specific settings for this connection
  is_default BOOLEAN DEFAULT false, -- Default connection for this client
  settings JSONB DEFAULT '{}', -- Client-specific settings
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, connection_id) -- One mapping per client-connection pair
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_connections_client ON client_connections(client_id);
CREATE INDEX IF NOT EXISTS idx_client_connections_connection ON client_connections(connection_id);

-- Table: oauth_states
-- Temporary storage for OAuth state tokens (security)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token VARCHAR(255) NOT NULL UNIQUE,
  connection_type VARCHAR(100) NOT NULL,
  redirect_uri TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clean up expired OAuth states (run periodically)
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_api_connections_updated_at BEFORE UPDATE ON api_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_connections_updated_at BEFORE UPDATE ON client_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
