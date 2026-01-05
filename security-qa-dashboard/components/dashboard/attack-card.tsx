'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QAPair } from '@/lib/types';

interface AttackCardProps {
  qa: QAPair;
  specialistName: string;
  category: string;
}

export function AttackCard({ qa, specialistName, category }: AttackCardProps) {
  const getFeasibilityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{qa.qa_id}</CardTitle>
            <CardDescription>
              {specialistName} • {category.replace('_', ' ')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getFeasibilityColor(qa.feasibility)}>
              {qa.feasibility}
            </Badge>
            <Badge className={getImpactColor(qa.impact)}>
              {qa.impact}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Question</h4>
          <p className="text-sm text-muted-foreground">{qa.question}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Expected Secure Response</h4>
          <p className="text-sm text-muted-foreground">{qa.expected_secure_response}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Attack Rationale</h4>
          <p className="text-sm text-muted-foreground">{qa.attack_rationale}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Vulnerable Response Indicators</h4>
          <ul className="list-disc list-inside space-y-1">
            {qa.vulnerable_response_indicators.map((indicator, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">{indicator}</li>
            ))}
          </ul>
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
