"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createBrowserClient();
    
    // Fetch initial data
    const fetchData = async () => {
      const { data } = await supabase
        .from('submissions')
        .select(`
          *,
          teams:team_id(name),
          qa_pairs(*)
        `)
        .order('submitted_at', { ascending: false });
      
      setSubmissions(data || []);
      setLoading(false);
    };
    
    fetchData();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('submissions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        async (payload: any) => {
          // Fetch full submission with relations
          const { data } = await supabase
            .from('submissions')
            .select('*, teams:team_id(name), qa_pairs(*)')
            .eq('id', payload.new.id)
            .single();
          
          if (data) setSubmissions((prev: any) => [data, ...prev]);
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return { submissions, loading };
}
