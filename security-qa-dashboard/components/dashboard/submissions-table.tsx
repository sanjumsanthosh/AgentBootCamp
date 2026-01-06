import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const categoryColors = {
  prompt_injection: "bg-red-100 text-red-800",
  authorization_bypass: "bg-orange-100 text-orange-800",
  policy_violation: "bg-yellow-100 text-yellow-800",
  data_exfiltration: "bg-purple-100 text-purple-800"
};

const impactColors = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-blue-500 text-white"
};

const feasibilityColors = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200"
};

interface SubmissionsTableProps {
  submissions: any[];
  onRowClick?: (submission: any) => void;
}

export default function SubmissionsTable({ submissions, onRowClick }: SubmissionsTableProps) {
  const getHighestImpact = (qaPairs: any[]) => {
    const impacts = ['critical', 'high', 'medium', 'low'];
    for (const impact of impacts) {
      if (qaPairs.some(qa => qa.impact === impact)) return impact;
    }
    return 'low';
  };

  const getHighestFeasibility = (qaPairs: any[]) => {
    const feasibilities = ['high', 'medium', 'low'];
    for (const feas of feasibilities) {
      if (qaPairs.some(qa => qa.feasibility === feas)) return feas;
    }
    return 'low';
  };

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Team</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Specialist</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">QAs</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Max Impact</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Max Feasibility</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => {
            const highestImpact = getHighestImpact(submission.qa_pairs || []);
            const highestFeasibility = getHighestFeasibility(submission.qa_pairs || []);
            
            return (
              <tr 
                key={submission.id}
                onClick={() => onRowClick?.(submission)}
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {submission.teams?.name || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {submission.specialist_name}
                </td>
                <td className="px-4 py-3">
                  <Badge className={categoryColors[submission.category as keyof typeof categoryColors]}>
                    {submission.category.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-gray-700 font-medium">
                  {submission.qa_pairs?.length || 0}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge className={impactColors[highestImpact as keyof typeof impactColors]}>
                    {highestImpact}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className={feasibilityColors[highestFeasibility as keyof typeof feasibilityColors]}>
                    {highestFeasibility}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {submissions.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          No submissions found
        </div>
      )}
    </div>
  );
}
