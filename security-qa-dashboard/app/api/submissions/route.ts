import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const category = searchParams.get('category');
    
    const supabase = await createClient();
    
    let query = supabase
      .from('submissions')
      .select(`
        id,
        specialist_name,
        category,
        submitted_at,
        teams:team_id(name),
        qa_pairs(*)
      `)
      .order('submitted_at', { ascending: false });
    
    if (team && team !== 'all') {
      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('name', team)
        .single();
      
      if (teamData) {
        query = query.eq('team_id', teamData.id);
      }
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
