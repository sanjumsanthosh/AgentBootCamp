import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      qa_pair_id, 
      actual_response, 
      test_passed, 
      observations, 
      test_duration_ms 
    } = body;
    
    if (!qa_pair_id || actual_response === undefined || test_passed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: qa_pair_id, actual_response, test_passed' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Update test result
    const { error } = await supabase
      .from('qa_pairs')
      .update({
        status: 'completed',
        actual_response,
        test_passed,
        observations: observations || null,
        tested_at: new Date().toISOString(),
        test_duration_ms: test_duration_ms || null
      })
      .eq('id', qa_pair_id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true,
      message: 'Test result recorded successfully'
    });
  } catch (error) {
    console.error('Submit result error:', error);
    return NextResponse.json(
      { error: 'Failed to submit test result' },
      { status: 500 }
    );
  }
}
