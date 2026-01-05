import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamSelectorProps {
  teams: string[];
  selected: string;
  onChange: (value: string) => void;
}

export default function TeamSelector({ teams, selected, onChange }: TeamSelectorProps) {
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="w-[200px] bg-white">
        <SelectValue placeholder="Select Team" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Teams</SelectItem>
        {teams.map(team => (
          <SelectItem key={team} value={team}>{team}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
