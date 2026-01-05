'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamSelectorProps {
  teams: Array<{ id: string; name: string }>;
  selectedTeam: string | null;
  onTeamChange: (teamId: string) => void;
}

export function TeamSelector({ teams, selectedTeam, onTeamChange }: TeamSelectorProps) {
  return (
    <div className="w-full max-w-xs">
      <Select value={selectedTeam || undefined} onValueChange={onTeamChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
