-- Add business_types column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_types TEXT[] DEFAULT ARRAY['general'];

-- Add primary_business_type column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS primary_business_type VARCHAR(50) DEFAULT 'general';

-- Add location column for local businesses
ALTER TABLE clients ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add shopify_url column for Shopify stores
ALTER TABLE clients ADD COLUMN IF NOT EXISTS shopify_url VARCHAR(500);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_business_types ON clients USING GIN(business_types);
CREATE INDEX IF NOT EXISTS idx_clients_primary_business_type ON clients(primary_business_type);

-- Update existing records to have default business type
UPDATE clients SET business_types = ARRAY['general'] WHERE business_types IS NULL;
UPDATE clients SET primary_business_type = 'general' WHERE primary_business_type IS NULL;

