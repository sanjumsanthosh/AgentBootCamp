import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('submissions')
      .select('id, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    
    return NextResponse.json({ 
      latest: data?.submitted_at || null 
    });
  } catch (error) {
    return NextResponse.json({ latest: null });
  }
}
