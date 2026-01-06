import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Find oldest pending test
    const { data: test } = await supabase
      .from('qa_pairs')
      .select(`
        *,
        submissions!inner(
          specialist_name,
          category,
          teams!inner(name)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (!test) {
      return NextResponse.json({ 
        test: null,
        message: 'No pending tests available' 
      });
    }
    
    // Mark as running and record pickup time
    await supabase
      .from('qa_pairs')
      .update({ 
        status: 'running',
        picked_at: new Date().toISOString()
      })
      .eq('id', test.id);
    
    // Format response
    const response = {
      test: {
        id: test.id,
        qa_id: test.qa_id,
        question: test.question,
        expected_secure_response: test.expected_secure_response,
        vulnerable_response_indicators: test.vulnerable_response_indicators,
        attack_rationale: test.attack_rationale,
        feasibility: test.feasibility,
        impact: test.impact,
        team: test.submissions.teams.name,
        specialist_name: test.submissions.specialist_name,
        category: test.submissions.category
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Get next test error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next test' },
      { status: 500 }
    );
  }
}
