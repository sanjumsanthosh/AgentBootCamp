import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { encode } from '@toon-format/toon';

export const dynamic = 'force-dynamic';

/**
 * GET Data Dump API
 * Returns a comprehensive dump of all test data for analysis in TOON format
 * Includes submissions, QA pairs, teams, and aggregated statistics
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (teamsError) throw teamsError;
    
    // Fetch all submissions with related data
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        *,
        teams:team_id(id, name),
        qa_pairs(*)
      `)
      .order('submitted_at', { ascending: false });
    
    if (submissionsError) throw submissionsError;
    
    // Fetch all QA pairs for global statistics
    const { data: allQaPairs, error: qaPairsError } = await supabase
      .from('qa_pairs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (qaPairsError) throw qaPairsError;
    
    // Calculate comprehensive statistics
    const stats = {
      overview: {
        total_teams: teams?.length || 0,
        total_submissions: submissions?.length || 0,
        total_qa_pairs: allQaPairs?.length || 0,
      },
      test_status: {
        pending: allQaPairs?.filter(q => q.status === 'pending').length || 0,
        running: allQaPairs?.filter(q => q.status === 'running').length || 0,
        completed: allQaPairs?.filter(q => q.status === 'completed').length || 0,
        failed: allQaPairs?.filter(q => q.status === 'failed').length || 0,
      },
      test_results: {
        passed: allQaPairs?.filter(q => q.test_passed === true).length || 0,
        failed: allQaPairs?.filter(q => q.test_passed === false).length || 0,
        not_tested: allQaPairs?.filter(q => q.test_passed === null).length || 0,
      },
      by_category: {
        prompt_injection: allQaPairs?.filter(q => {
          const sub = submissions?.find(s => s.id === q.submission_id);
          return sub?.category === 'prompt_injection';
        }).length || 0,
        authorization_bypass: allQaPairs?.filter(q => {
          const sub = submissions?.find(s => s.id === q.submission_id);
          return sub?.category === 'authorization_bypass';
        }).length || 0,
        policy_violation: allQaPairs?.filter(q => {
          const sub = submissions?.find(s => s.id === q.submission_id);
          return sub?.category === 'policy_violation';
        }).length || 0,
        data_exfiltration: allQaPairs?.filter(q => {
          const sub = submissions?.find(s => s.id === q.submission_id);
          return sub?.category === 'data_exfiltration';
        }).length || 0,
      },
      by_feasibility: {
        high: allQaPairs?.filter(q => q.feasibility === 'high').length || 0,
        medium: allQaPairs?.filter(q => q.feasibility === 'medium').length || 0,
        low: allQaPairs?.filter(q => q.feasibility === 'low').length || 0,
      },
      by_impact: {
        critical: allQaPairs?.filter(q => q.impact === 'critical').length || 0,
        high: allQaPairs?.filter(q => q.impact === 'high').length || 0,
        medium: allQaPairs?.filter(q => q.impact === 'medium').length || 0,
        low: allQaPairs?.filter(q => q.impact === 'low').length || 0,
      },
      performance: {
        avg_test_duration_ms: allQaPairs?.filter(q => q.test_duration_ms)
          .reduce((sum, q) => sum + (q.test_duration_ms || 0), 0) / 
          (allQaPairs?.filter(q => q.test_duration_ms).length || 1),
        min_test_duration_ms: Math.min(...(allQaPairs?.filter(q => q.test_duration_ms)
          .map(q => q.test_duration_ms || 0) || [0])),
        max_test_duration_ms: Math.max(...(allQaPairs?.filter(q => q.test_duration_ms)
          .map(q => q.test_duration_ms || 0) || [0])),
      }
    };
    
    // Calculate team-specific statistics
    const teamStats = teams?.map(team => {
      const teamSubmissions = submissions?.filter(s => s.team_id === team.id) || [];
      const teamQaPairs = allQaPairs?.filter(q => {
        const sub = submissions?.find(s => s.id === q.submission_id);
        return sub?.team_id === team.id;
      }) || [];
      
      return {
        team_id: team.id,
        team_name: team.name,
        total_submissions: teamSubmissions.length,
        total_qa_pairs: teamQaPairs.length,
        completed_tests: teamQaPairs.filter(q => q.status === 'completed').length,
        passed_tests: teamQaPairs.filter(q => q.test_passed === true).length,
        failed_tests: teamQaPairs.filter(q => q.test_passed === false).length,
        categories: {
          prompt_injection: teamSubmissions.filter(s => s.category === 'prompt_injection').length,
          authorization_bypass: teamSubmissions.filter(s => s.category === 'authorization_bypass').length,
          policy_violation: teamSubmissions.filter(s => s.category === 'policy_violation').length,
          data_exfiltration: teamSubmissions.filter(s => s.category === 'data_exfiltration').length,
        },
        success_rate: teamQaPairs.filter(q => q.status === 'completed').length > 0
          ? (teamQaPairs.filter(q => q.test_passed === true).length / 
             teamQaPairs.filter(q => q.status === 'completed').length * 100).toFixed(2)
          : '0.00'
      };
    }) || [];
    
    // Prepare the comprehensive dump
    const dataDump = {
      team_statistics: teamStats,
      submissions: submissions || [],
    };
    
    // Convert to TOON format at LLM boundary
    const toonData = encode(dataDump);
    
    return new NextResponse(toonData, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    });
  } catch (error) {
    console.error('Data dump error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate data dump',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
