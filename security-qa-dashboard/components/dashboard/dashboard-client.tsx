'use client';

import { useState, useEffect, useCallback } from 'react';
import TeamSelector from './team-selector';
import Filters from './filters';
import AttackCard from './attack-card';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  initialSubmissions: any[];
  initialTeams: string[];
}

export default function DashboardClient({ initialSubmissions, initialTeams }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [teams, setTeams] = useState(initialTeams);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState(3000);
  
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [feasibilityFilter, setFeasibilityFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  
  // Fetch submissions via API
  const fetchSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTeam !== 'all') params.set('team', selectedTeam);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      
      const res = await fetch(`/api/submissions?${params}`);
      const json = await res.json();
      
      if (json.data) {
        setSubmissions(json.data);
        if (json.data[0]) {
          setLastUpdate(json.data[0].submitted_at);
        }
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  }, [selectedTeam, categoryFilter]);
  
  // Polling for new submissions with exponential backoff
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch('/api/latest-submission');
        const json = await res.json();
        
        if (json.latest && json.latest !== lastUpdate) {
          // New data available, refetch
          fetchSubmissions();
          setPollInterval(3000); // Reset to fast polling
        } else {
          // No updates, slow down polling
          setPollInterval(prev => Math.min(prev * 1.5, 15000));
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };
    
    const interval = setInterval(checkForUpdates, pollInterval);
    return () => clearInterval(interval);
  }, [lastUpdate, pollInterval, fetchSubmissions]);
  
  // Refetch when filters change
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  
  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams');
        const json = await res.json();
        if (json.data) setTeams(json.data);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    };
    fetchTeams();
  }, []);
  
  // Client-side filtering for feasibility/impact
  const filtered = submissions.filter(sub => {
    if (feasibilityFilter !== 'all' || impactFilter !== 'all') {
      return sub.qa_pairs?.some((qa: any) => {
        const feasMatch = feasibilityFilter === 'all' || qa.feasibility === feasibilityFilter;
        const impactMatch = impactFilter === 'all' || qa.impact === impactFilter;
        return feasMatch && impactMatch;
      });
    }
    return true;
  });
  
  return (
    <>
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
    </>
  );
}
