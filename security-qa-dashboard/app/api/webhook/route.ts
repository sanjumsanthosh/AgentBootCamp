import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WebhookPayload } from '@/lib/types';

const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY;

// Mark this route as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // const apiKey = request.headers.get('x-api-key');
  
  // if (apiKey !== WEBHOOK_API_KEY) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const payload: WebhookPayload = await request.json();
    const supabase = await createClient();
    
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));
    console.log(`Processing ${payload.qa_pairs.length} QA pairs for ${payload.specialist_name}`);
    
    // Validate required fields
    if (!payload.specialist_name || !payload.category || !payload.qa_pairs) {
      return NextResponse.json(
        { error: 'Missing required fields: specialist_name, category, qa_pairs' },
        { status: 400 }
      );
    }
    
    if (payload.qa_pairs.length === 0) {
      return NextResponse.json(
        { error: 'At least one QA pair is required' },
        { status: 400 }
      );
    }
    
    const teamName = payload.specialist_name.split('_')[0] || 'default';
    console.log(`Team name extracted: ${teamName}`);
    
    // Get or create team
    let { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('name', teamName)
      .single();
    
    if (!team) {
      console.log(`Creating new team: ${teamName}`);
      const { data: newTeam, error: createError } = await supabase
        .from('teams')
        .insert({ name: teamName })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating team:', createError);
        throw createError;
      }
      team = newTeam;
    } else {
      console.log(`Found existing team: ${teamName} with id ${team.id}`);
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
    
    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      throw submissionError;
    }
    
    console.log(`Created submission with id: ${submission.id}`);
    
    // Insert QA pairs with all details
    const qaPairsData = payload.qa_pairs.map((qa, index) => {
      console.log(`Processing QA pair ${index + 1}/${payload.qa_pairs.length}: ${qa.qa_id}`);
      return {
        submission_id: submission.id,
        qa_id: qa.qa_id,
        question: qa.question,
        expected_secure_response: qa.expected_secure_response,
        attack_rationale: qa.attack_rationale,
        vulnerable_response_indicators: JSON.stringify(qa.vulnerable_response_indicators),
        feasibility: qa.feasibility,
        impact: qa.impact,
        related_happy_path_index: qa.related_happy_path_index
      };
    });
    
    const { error: qaPairsError } = await supabase
      .from('qa_pairs')
      .insert(qaPairsData);
    
    if (qaPairsError) {
      console.error('Error inserting QA pairs:', qaPairsError);
      throw qaPairsError;
    }
    
    console.log(`Successfully inserted ${payload.qa_pairs.length} QA pairs`);
    
    return NextResponse.json({ 
      success: true, 
      submission_id: submission.id,
      qa_pairs_count: payload.qa_pairs.length,
      team_name: teamName
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
