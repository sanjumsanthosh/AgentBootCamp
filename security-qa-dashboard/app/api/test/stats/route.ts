import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('qa_pairs')
      .select('status, test_passed');
    
    const stats = {
      total: data?.length || 0,
      pending: data?.filter(t => t.status === 'pending').length || 0,
      running: data?.filter(t => t.status === 'running').length || 0,
      completed: data?.filter(t => t.status === 'completed').length || 0,
      failed: data?.filter(t => t.status === 'failed').length || 0,
      passed: data?.filter(t => t.test_passed === true).length || 0,
      test_failed: data?.filter(t => t.test_passed === false).length || 0
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
