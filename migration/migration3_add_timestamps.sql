-- Migration 3: Add created_at column to submissions and teams tables (if missing)

-- Add created_at to submissions table if it doesn't exist
ALTER TABLE submissions 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to use submitted_at as created_at if created_at was NULL
UPDATE submissions 
SET created_at = submitted_at 
WHERE created_at IS NULL;

-- Add created_at index for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Ensure qa_pairs has created_at (should already exist from migration2)
ALTER TABLE qa_pairs 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure teams has created_at (should already exist from migration1)
-- But adding this for completeness
ALTER TABLE teams 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update all policies to allow updates by service role
DO $$
BEGIN
  -- Drop existing update policy if it exists
  DROP POLICY IF EXISTS "Allow service role to update submissions" ON submissions;
  
  -- Create new update policy for submissions
  CREATE POLICY "Allow service role to update submissions"
    ON submissions FOR UPDATE
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure all tracking columns are properly indexed
CREATE INDEX IF NOT EXISTS idx_qa_pairs_created_at ON qa_pairs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);
