"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { QAPair } from "@/lib/types";

export type Submission = {
  id: string;
  specialist_name: string;
  category: string;
  submitted_at: string;
  teams: { name: string };
  qa_pairs: QAPair[];
};

const categoryColors: Record<string, string> = {
  prompt_injection: "bg-red-100 text-red-800",
  authorization_bypass: "bg-orange-100 text-orange-800",
  policy_violation: "bg-yellow-100 text-yellow-800",
  data_exfiltration: "bg-purple-100 text-purple-800",
};

const impactColors: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-blue-500 text-white",
};

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "teams.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Team
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.teams.name}</div>;
    },
  },
  {
    accessorKey: "specialist_name",
    header: "Specialist",
    cell: ({ row }) => {
      return <div className="font-mono text-sm">{row.getValue("specialist_name")}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge className={categoryColors[category]}>
          {category.replace(/_/g, " ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "qa_pairs",
    header: "Attacks",
    cell: ({ row }) => {
      const qaPairs = row.getValue("qa_pairs") as any[];
      return <div className="text-center font-semibold">{qaPairs?.length || 0}</div>;
    },
  },
  {
    id: "highest_impact",
    header: "Highest Impact",
    cell: ({ row }) => {
      const qaPairs = row.original.qa_pairs;
      const impacts = ["critical", "high", "medium", "low"];
      const highestImpact = impacts.find((impact) =>
        qaPairs?.some((qa) => qa.impact === impact)
      );
      
      return highestImpact ? (
        <Badge className={impactColors[highestImpact]}>{highestImpact}</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "submitted_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(row.getValue("submitted_at")), {
            addSuffix: true,
          })}
        </div>
      );
    },
  },
];
