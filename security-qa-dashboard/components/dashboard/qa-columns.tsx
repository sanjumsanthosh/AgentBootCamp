"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
import { QAPair } from "@/lib/types";

const impactColors: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-blue-500 text-white",
};

const feasibilityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export const qaColumns: ColumnDef<QAPair>[] = [
  {
    accessorKey: "question",
    header: "Question",
    cell: ({ row }) => {
      const question = row.getValue("question") as string;
      return (
        <div className="max-w-sm">
          <p className="text-sm whitespace-pre-wrap break-words">{question}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "expected_secure_response",
    header: "Expected Response",
    cell: ({ row }) => {
      const response = row.getValue("expected_secure_response") as string;
      return (
        <div className="max-w-md">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{response}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "actual_response",
    header: "Actual Response",
    cell: ({ row }) => {
      const actualResponse = row.getValue("actual_response") as string | null;
      const status = row.original.status || "pending";
      
      if (!actualResponse || status === "pending") {
        return <span className="text-xs text-muted-foreground italic">Not tested yet</span>;
      }
      
      return (
        <div className="max-w-md">
          <p className="text-sm whitespace-pre-wrap break-words">{actualResponse}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "test_passed",
    header: "Result",
    cell: ({ row }) => {
      const testPassed = row.getValue("test_passed") as boolean | null;
      const status = row.original.status;
      
      if (status !== "completed" || testPassed === null) {
        return <span className="text-muted-foreground">-</span>;
      }
      
      return testPassed ? (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Pass
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Fail
        </Badge>
      );
    },
  },
  {
    accessorKey: "impact",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Impact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const impact = row.getValue("impact") as string;
      return <Badge className={impactColors[impact]}>{impact}</Badge>;
    },
  },
  {
    accessorKey: "feasibility",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Feasibility
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const feasibility = row.getValue("feasibility") as string;
      return <Badge className={feasibilityColors[feasibility]}>{feasibility}</Badge>;
    },
  },
  {
    accessorKey: "attack_rationale",
    header: "Attack Rationale",
    cell: ({ row }) => {
      const rationale = row.getValue("attack_rationale") as string;
      return (
        <div className="max-w-lg">
          <p className="text-sm line-clamp-2">{rationale}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "vulnerable_response_indicators",
    header: "Indicators",
    cell: ({ row }) => {
      const indicators = row.getValue("vulnerable_response_indicators") as string | string[];
      const indicatorArray = typeof indicators === 'string' ? JSON.parse(indicators) : indicators;
      return (
        <div className="flex flex-wrap gap-1 max-w-md">
          {indicatorArray.slice(0, 3).map((ind: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">{ind}</Badge>
          ))}
          {indicatorArray.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{indicatorArray.length - 3}</Badge>
          )}
        </div>
      );
    },
  },
];
