-- Create reports table to store LLM-generated security reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  key_findings JSONB,
  vulnerability_analysis JSONB,
  risk_assessment TEXT NOT NULL,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_reports_team ON reports(team);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Enable RLS and set policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public read access (adjust as needed for your deployment)
CREATE POLICY IF NOT EXISTS "Allow public read access on reports"
  ON reports FOR SELECT
  USING (true);

-- Allow inserts (for service role/webhooks)
CREATE POLICY IF NOT EXISTS "Allow service role to insert reports"
  ON reports FOR INSERT
  WITH CHECK (true);
