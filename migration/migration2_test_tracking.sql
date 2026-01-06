-- Add status and result tracking columns to qa_pairs
ALTER TABLE qa_pairs 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS actual_response TEXT,
  ADD COLUMN IF NOT EXISTS test_passed BOOLEAN,
  ADD COLUMN IF NOT EXISTS observations TEXT,
  ADD COLUMN IF NOT EXISTS tested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS test_duration_ms INTEGER,
  ADD COLUMN IF NOT EXISTS picked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Index for finding next test
CREATE INDEX IF NOT EXISTS idx_qa_pairs_status ON qa_pairs(status, created_at);

-- Add update policy for test results
CREATE POLICY "Allow service role to update qa_pairs"
  ON qa_pairs FOR UPDATE
  USING (true)
  WITH CHECK (true);
