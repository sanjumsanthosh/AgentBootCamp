import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('teams')
      .select('name')
      .order('name');
    
    if (error) throw error;
    
    return NextResponse.json({ 
      data: data?.map(t => t.name) || [] 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
