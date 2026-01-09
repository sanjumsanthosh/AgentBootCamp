'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReportDetailsModal } from '@/components/dashboard/report-columns';

export type Report = {
  id: string;
  team: string;
  executive_summary: string;
  risk_assessment: string;
  key_findings?: any;
  vulnerability_analysis?: any;
  recommendations?: any;
  created_at: string;
};

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/report/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`);
        }
        
        const { data } = await response.json();
        setReport(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Report</h2>
            <p className="text-red-700">{error || 'Report not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <ReportDetailsModal 
        open={true} 
        onClose={() => window.history.back()} 
        report={report} 
      />
    </div>
  );
}
