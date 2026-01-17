-- Shopify Store Integration Tables
-- Migration 010: Add Shopify store connection and analysis tables

-- Shopify stores table (store connection info)
CREATE TABLE IF NOT EXISTS shopify_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  store_url VARCHAR(255) NOT NULL,
  store_domain VARCHAR(255),
  access_token TEXT NOT NULL,
  store_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, store_url)
);

-- Shopify products snapshot (cached product data)
CREATE TABLE IF NOT EXISTS shopify_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES shopify_stores(id) ON DELETE CASCADE,
  shopify_product_id VARCHAR(255) NOT NULL,
  product_data JSONB NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, shopify_product_id)
);

-- Shopify collections snapshot
CREATE TABLE IF NOT EXISTS shopify_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES shopify_stores(id) ON DELETE CASCADE,
  shopify_collection_id VARCHAR(255) NOT NULL,
  collection_data JSONB NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, shopify_collection_id)
);

-- Shopify store analyses (analysis results)
CREATE TABLE IF NOT EXISTS shopify_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  store_id UUID REFERENCES shopify_stores(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  seo_score INT,
  products_analyzed INT DEFAULT 0,
  collections_analyzed INT DEFAULT 0,
  recommendations_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_stores_client_id ON shopify_stores(client_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_store_id ON shopify_products(store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_collections_store_id ON shopify_collections(store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_analyses_client_id ON shopify_analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_shopify_analyses_store_id ON shopify_analyses(store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_analyses_created_at ON shopify_analyses(created_at DESC);

-- Add shopify_access_token to clients table (optional, for backward compatibility)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS shopify_access_token TEXT;

COMMENT ON TABLE shopify_stores IS 'Shopify store connections for clients';
COMMENT ON TABLE shopify_products IS 'Cached Shopify product data';
COMMENT ON TABLE shopify_collections IS 'Cached Shopify collection data';
COMMENT ON TABLE shopify_analyses IS 'Store analysis results and recommendations';
