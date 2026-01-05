'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories, feasibilityLevels, impactLevels } from '@/lib/types';

interface FiltersProps {
  selectedCategory: string | null;
  selectedFeasibility: string | null;
  selectedImpact: string | null;
  onCategoryChange: (value: string | null) => void;
  onFeasibilityChange: (value: string | null) => void;
  onImpactChange: (value: string | null) => void;
}

export function Filters({
  selectedCategory,
  selectedFeasibility,
  selectedImpact,
  onCategoryChange,
  onFeasibilityChange,
  onImpactChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">Feasibility</label>
        <Select
          value={selectedFeasibility || 'all'}
          onValueChange={(value) => onFeasibilityChange(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {feasibilityLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <label className="text-sm font-medium mb-2 block">Impact</label>
        <Select
          value={selectedImpact || 'all'}
          onValueChange={(value) => onImpactChange(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {impactLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
