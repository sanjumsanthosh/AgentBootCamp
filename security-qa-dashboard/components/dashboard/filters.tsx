import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FiltersProps {
  category: string;
  feasibility: string;
  impact: string;
  onCategoryChange: (value: string) => void;
  onFeasibilityChange: (value: string) => void;
  onImpactChange: (value: string) => void;
}

export default function Filters({ 
  category, feasibility, impact,
  onCategoryChange, onFeasibilityChange, onImpactChange 
}: FiltersProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="prompt_injection">Prompt Injection</SelectItem>
          <SelectItem value="authorization_bypass">Auth Bypass</SelectItem>
          <SelectItem value="policy_violation">Policy Violation</SelectItem>
          <SelectItem value="data_exfiltration">Data Exfiltration</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={feasibility} onValueChange={onFeasibilityChange}>
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="Feasibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Feasibility</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={impact} onValueChange={onImpactChange}>
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="Impact" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Impact</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
