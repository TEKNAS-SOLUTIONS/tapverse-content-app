-- Migration: Content Status Tracking Enhancement
-- Adds comprehensive status tracking for content workflow

-- Update content table to support full status workflow
ALTER TABLE content 
  DROP CONSTRAINT IF EXISTS content_status_check;

ALTER TABLE content
  ADD CONSTRAINT content_status_check 
  CHECK (status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'rejected', 'edited'));

-- Add status change tracking fields
ALTER TABLE content
  ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS status_changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS published_url TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_status_changed_at ON content(status_changed_at);

-- Update existing content to have proper status
UPDATE content 
SET status = 'draft' 
WHERE status NOT IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'rejected', 'edited');
