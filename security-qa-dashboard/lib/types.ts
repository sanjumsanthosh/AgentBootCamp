export const categories = [
  "prompt_injection",
  "authorization_bypass", 
  "policy_violation",
  "data_exfiltration"
] as const;

export const feasibilityLevels = ["high", "medium", "low"] as const;
export const impactLevels = ["critical", "high", "medium", "low"] as const;

export interface QAPair {
  qa_id: string;
  question: string;
  expected_secure_response: string;
  vulnerable_response_indicators: string[];
  attack_rationale: string;
  feasibility: typeof feasibilityLevels[number];
  impact: typeof impactLevels[number];
  related_happy_path_index: number | null;
  
  // Test execution fields
  status?: 'pending' | 'running' | 'completed' | 'failed';
  actual_response?: string;
  test_passed?: boolean;
  observations?: string;
  tested_at?: string;
  test_duration_ms?: number;
  picked_at?: string;
}

export interface TestResult {
  qa_pair_id: string;
  actual_response: string;
  test_passed: boolean;
  observations?: string;
  test_duration_ms: number;
}

export interface WebhookPayload {
  specialist_name: string;
  category: typeof categories[number];
  team?: string;
  qa_pairs: QAPair[];
}

export interface Submission {
  id: string;
  team_id: string;
  specialist_name: string;
  category: string;
  submitted_at: string;
  qa_pairs: QAPair[];
  teams?: { name: string };
}
