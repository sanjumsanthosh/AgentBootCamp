-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  specialist_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prompt_injection', 'authorization_bypass', 'policy_violation', 'data_exfiltration')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create qa_pairs table
CREATE TABLE IF NOT EXISTS qa_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  qa_id TEXT NOT NULL,
  question TEXT NOT NULL,
  expected_secure_response TEXT NOT NULL,
  vulnerable_response_indicators JSONB NOT NULL,
  attack_rationale TEXT NOT NULL,
  feasibility TEXT NOT NULL CHECK (feasibility IN ('high', 'medium', 'low')),
  impact TEXT NOT NULL CHECK (impact IN ('critical', 'high', 'medium', 'low')),
  related_happy_path_index INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_category ON submissions(category);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_pairs_submission ON qa_pairs(submission_id);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_pairs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on submissions"
  ON submissions FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on qa_pairs"
  ON qa_pairs FOR SELECT
  USING (true);

-- Allow inserts (for webhook endpoint using service role key)
CREATE POLICY "Allow service role to insert teams"
  ON teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert qa_pairs"
  ON qa_pairs FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
