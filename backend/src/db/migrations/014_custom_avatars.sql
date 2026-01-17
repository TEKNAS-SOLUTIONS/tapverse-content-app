-- Migration: Custom Avatars - HeyGen Instant Avatars
-- Allows users to create and manage their own custom avatars

-- Ensure users table exists (for foreign key references)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom avatars table
CREATE TABLE IF NOT EXISTS custom_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  heygen_avatar_id VARCHAR(255), -- HeyGen Instant Avatar ID
  heygen_job_id VARCHAR(255), -- HeyGen job ID for creation process
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  video_url TEXT, -- URL to uploaded video (stored temporarily)
  transcription TEXT, -- Exact transcription from video
  thumbnail_url TEXT, -- Avatar thumbnail/preview URL
  error_message TEXT, -- Error message if creation failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_avatars_user_id ON custom_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_avatars_status ON custom_avatars(status);
CREATE INDEX IF NOT EXISTS idx_custom_avatars_heygen_avatar_id ON custom_avatars(heygen_avatar_id);
CREATE INDEX IF NOT EXISTS idx_custom_avatars_heygen_job_id ON custom_avatars(heygen_job_id);

-- Add comment
COMMENT ON TABLE custom_avatars IS 'Stores user-created HeyGen Instant Avatars';
COMMENT ON COLUMN custom_avatars.heygen_avatar_id IS 'HeyGen Instant Avatar ID (available after creation completes)';
COMMENT ON COLUMN custom_avatars.heygen_job_id IS 'HeyGen job ID for tracking creation process';
COMMENT ON COLUMN custom_avatars.status IS 'Status: processing (being created), completed (ready to use), failed (creation failed)';
