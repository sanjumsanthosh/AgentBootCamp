'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSubmissions(
  teamFilter?: string,
  categoryFilter?: string,
  feasibilityFilter?: string,
  impactFilter?: string
) {
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
  
  if (teamFilter && teamFilter !== 'all') {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('name', teamFilter)
      .single();
    
    if (team) {
      query = query.eq('team_id', team.id);
    }
  }
  
  if (categoryFilter && categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Filter by feasibility/impact on client side or use JSON queries
  return data || [];
}

export async function getTeams() {
  const supabase = await createClient();
  const { data } = await supabase.from('teams').select('name').order('name');
  return data?.map(t => t.name) || [];
}

export async function refreshData() {
  revalidatePath('/');
}
