'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Submission } from './columns';
import { qaColumns } from './qa-columns';
import { type QAPair } from '@/lib/types';
import TeamSelector from './team-selector';
import Filters from './filters';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  initialSubmissions: Submission[];
  initialTeams: string[];
}

export default function DashboardClient({ initialSubmissions, initialTeams }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [teams, setTeams] = useState(initialTeams);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [feasibilityFilter, setFeasibilityFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  
  // Fetch submissions via API
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTeam !== 'all') params.set('team', selectedTeam);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      
      const res = await fetch(`/api/submissions?${params}`);
      const json = await res.json();
      
      if (json.data) {
        setSubmissions(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeam, categoryFilter]);
  
  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchSubmissions();
    }, autoRefresh);
    
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSubmissions]);
  
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
  
  // Detail View
  if (selectedSubmission) {
    const categoryColors: Record<string, string> = {
      prompt_injection: "bg-red-100 text-red-800",
      authorization_bypass: "bg-orange-100 text-orange-800",
      policy_violation: "bg-yellow-100 text-yellow-800",
      data_exfiltration: "bg-purple-100 text-purple-800",
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setSelectedSubmission(null)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedSubmission.specialist_name}</h2>
              <div className="flex gap-2 items-center">
                <Badge className={categoryColors[selectedSubmission.category]}>
                  {selectedSubmission.category.replace(/_/g, " ")}
                </Badge>
                <span className="text-sm text-gray-600">
                  Team: {selectedSubmission.teams.name}
                </span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">
                  {selectedSubmission.qa_pairs.length} attacks
                </span>
              </div>
            </div>
          </div>
          
          <DataTable 
            columns={qaColumns} 
            data={selectedSubmission.qa_pairs} 
          />
        </div>
      </div>
    );
  }
  
  // List View
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between flex-wrap">
        <div className="flex gap-4 items-start flex-1">
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
        
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchSubmissions()}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <select 
            value={autoRefresh ?? 'off'} 
            onChange={(e) => {
              const value = e.target.value;
              setAutoRefresh(value === 'off' ? null : parseInt(value));
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="off">Auto: Off</option>
            <option value="5000">Auto: 5s</option>
            <option value="10000">Auto: 10s</option>
            <option value="30000">Auto: 30s</option>
            <option value="60000">Auto: 1m</option>
          </select>
        </div>
      </div>
      
      <DataTable 
        columns={columns} 
        data={filtered}
        onRowClick={(row) => setSelectedSubmission(row)}
      />
    </div>
  );
}
