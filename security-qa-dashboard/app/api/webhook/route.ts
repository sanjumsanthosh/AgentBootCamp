import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { WebhookPayload } from '@/lib/types';

// Mark this route as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic';

const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY;

export async function POST(request: NextRequest) {
  // Verify API key temp disable 
  // const apiKey = request.headers.get('x-api-key');
  
  // if (apiKey !== WEBHOOK_API_KEY) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized' },
  //     { status: 401 }
  //   );
  // }

  try {
    const payload: WebhookPayload = await request.json();

    console.log('Received webhook payload:', payload);
    
    // Extract team name from specialist_name or use default
    const teamName = payload.specialist_name.split('_')[0] || 'default';
    
    // Get or create team
    let { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('name', teamName)
      .single();
    
    if (teamError || !team) {
      const { data: newTeam } = await supabase
        .from('teams')
        .insert({ name: teamName })
        .select('id')
        .single();
      team = newTeam;
    }
    
    // Insert submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        team_id: team!.id,
        specialist_name: payload.specialist_name,
        category: payload.category
      })
      .select('id')
      .single();
    
    if (submissionError) throw submissionError;
    
    // Insert QA pairs
    const qaPairsData = payload.qa_pairs.map(qa => ({
      submission_id: submission.id,
      ...qa,
      vulnerable_response_indicators: qa.vulnerable_response_indicators
    }));
    
    const { error: qaPairsError } = await supabase
      .from('qa_pairs')
      .insert(qaPairsData);
    
    if (qaPairsError) throw qaPairsError;
    
    return NextResponse.json({ 
      success: true, 
      submission_id: submission.id 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
