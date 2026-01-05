import { Suspense } from 'react';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

async function getInitialData() {
  const supabase = await createClient();
  
  const [teamsRes, submissionsRes] = await Promise.all([
    supabase.from('teams').select('name').order('name'),
    supabase
      .from('submissions')
      .select('id, specialist_name, category, submitted_at, teams:team_id(name), qa_pairs(*)')
      .order('submitted_at', { ascending: false })
  ]);
  
  return {
    teams: teamsRes.data?.map(t => t.name) || [],
    submissions: submissionsRes.data || []
  };
}

export default async function Dashboard() {
  const { teams, submissions } = await getInitialData();
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Security QA Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time attack scenario submissions</p>
        </header>
        
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardClient 
            initialSubmissions={submissions} 
            initialTeams={teams}
          />
        </Suspense>
      </div>
    </div>
  );
}
