"use client";

import { useState } from 'react';
import { useSubmissions } from '@/hooks/useSubmissions';
import TeamSelector from '@/components/dashboard/team-selector';
import Filters from '@/components/dashboard/filters';
import AttackCard from '@/components/dashboard/attack-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const { submissions, loading } = useSubmissions();
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [feasibilityFilter, setFeasibilityFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");
  
  // Extract unique teams
  const teams = Array.from(new Set(submissions.map(s => s.teams?.name))).filter(Boolean);
  
  // Filter submissions
  const filtered = submissions.filter(sub => {
    if (selectedTeam !== "all" && sub.teams?.name !== selectedTeam) return false;
    if (categoryFilter !== "all" && sub.category !== categoryFilter) return false;
    
    // Filter by QA pairs criteria
    if (feasibilityFilter !== "all" || impactFilter !== "all") {
      return sub.qa_pairs?.some((qa: any) => {
        const feasMatch = feasibilityFilter === "all" || qa.feasibility === feasibilityFilter;
        const impactMatch = impactFilter === "all" || qa.impact === impactFilter;
        return feasMatch && impactMatch;
      });
    }
    return true;
  });
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Security QA Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time attack scenario submissions</p>
        </header>
        
        <div className="flex gap-4 items-start">
          <TeamSelector 
            teams={teams} 
            selected={selectedTeam} 
            onChange={setSelectedTeam} 
          />
          
          <Filters
            category={categoryFilter}
            feasibility={feasibilityFilter}
            impact={impactFilter}
            onCategoryChange={setCategoryFilter}
            onFeasibilityChange={setFeasibilityFilter}
            onImpactChange={setImpactFilter}
          />
        </div>
        
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No submissions found
              </CardContent>
            </Card>
          ) : (
            filtered.map((submission) => (
              <AttackCard key={submission.id} submission={submission} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
