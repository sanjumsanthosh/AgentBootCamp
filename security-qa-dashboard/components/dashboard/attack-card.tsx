import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

export default function AttackCard({ submission }: any) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: getCategoryColor(submission.category) }}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{submission.specialist_name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {submission.teams?.name} • {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
            </p>
          </div>
          <Badge className={categoryColors[submission.category as keyof typeof categoryColors]}>
            {submission.category.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {submission.qa_pairs?.map((qa: any) => (
            <div key={qa.qa_id} className="border-t pt-4 first:border-0 first:pt-0">
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{qa.qa_id}</Badge>
                <Badge className={impactColors[qa.impact as keyof typeof impactColors]}>
                  {qa.impact}
                </Badge>
                <Badge variant="secondary">{qa.feasibility} feasibility</Badge>
              </div>
              
              <p className="font-medium text-sm mb-2">Question:</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-3">{qa.question}</p>
              
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  View Details
                </summary>
                <div className="mt-3 space-y-3 pl-4">
                  <div>
                    <p className="font-medium">Expected Secure Response:</p>
                    <p className="text-gray-600 mt-1">{qa.expected_secure_response}</p>
                  </div>
                  <div>
                    <p className="font-medium">Attack Rationale:</p>
                    <p className="text-gray-600 mt-1">{qa.attack_rationale}</p>
                  </div>
                  <div>
                    <p className="font-medium">Vulnerable Indicators:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {qa.vulnerable_response_indicators.map((ind: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{ind}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    prompt_injection: '#ef4444',
    authorization_bypass: '#f97316',
    policy_violation: '#eab308',
    data_exfiltration: '#a855f7'
  };
  return colors[category] || '#6b7280';
}
        </div>
        
        {qa.related_happy_path_index !== null && (
          <div>
            <h4 className="font-semibold mb-2">Related Happy Path</h4>
            <p className="text-sm text-muted-foreground">Index: {qa.related_happy_path_index}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
