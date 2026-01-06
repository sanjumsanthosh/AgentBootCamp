import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { qa_pair_id, error_message } = await request.json();
    
    const supabase = await createClient();
    
    await supabase
      .from('qa_pairs')
      .update({
        status: 'failed',
        observations: error_message,
        tested_at: new Date().toISOString()
      })
      .eq('id', qa_pair_id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark test as failed' }, { status: 500 });
  }
}
