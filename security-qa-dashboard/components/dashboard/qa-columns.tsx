"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { QAPair } from "@/lib/types";

const impactColors: Record<string, string> = {
  critical: "bg-red-500 hover:bg-red-500 text-white font-semibold",
  high: "bg-orange-500 hover:bg-orange-500 text-white font-semibold",
  medium: "bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-semibold",
  low: "bg-blue-500 hover:bg-blue-500 text-white font-semibold",
};

const feasibilityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

function parseIndicators(indicators: string | string[] | undefined): string[] {
  if (!indicators) return [];
  if (typeof indicators === "string") {
    try {
      return JSON.parse(indicators);
    } catch {
      return [indicators];
    }
  }
  return indicators;
}

function DetailsModal({ open, onClose, data }: { open: boolean; onClose: () => void; data: QAPair | null }) {
  if (!open || !data) return null;
  const testPassed = data.test_passed;

  const actualBg =
    testPassed === false
      ? "bg-red-50 border-l-4 border-red-500"
      : testPassed === true
        ? "bg-green-50 border-l-4 border-green-500"
        : "bg-gray-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col mx-4">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="font-semibold text-lg">Test Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm text-gray-800">
          {/* Question and Tags */}
          <section className="space-y-2">
            <h3 className="font-semibold text-xs text-gray-600 uppercase">Question</h3>
            <p className="whitespace-pre-wrap break-words bg-gray-50 p-3 rounded text-sm leading-tight">{data.question}</p>
            <div className="flex flex-wrap gap-1">
              {parseIndicators(data.vulnerable_response_indicators).map((ind, i) => (
                <Badge key={i} variant="outline" className="text-[11px] px-1.5 py-0.5">{ind}</Badge>
              ))}
            </div>
          </section>

          {/* Expected and Actual Responses Side by Side */}
          <section className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-gray-600 uppercase">Expected Secure Response</h3>
              <p className="whitespace-pre-wrap break-words bg-green-50 p-3 rounded text-sm leading-tight">{data.expected_secure_response}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-gray-600 uppercase">Actual Response</h3>
              {data.actual_response ? (
                <div className={`${actualBg} p-3 rounded`}>
                  <p className="whitespace-pre-wrap break-words text-sm leading-tight">{data.actual_response}</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500 italic">Not tested yet</span>
                </div>
              )}
            </div>
          </section>

          {/* Observations */}
          {data.observations && (
            <section className="space-y-2">
              <h3 className="font-semibold text-xs text-gray-600 uppercase">Observations</h3>
              <p className="whitespace-pre-wrap break-words bg-gray-50 p-3 rounded text-sm leading-tight">{data.observations}</p>
            </section>
          )}

          {/* Attack Rationale */}
          <section className="space-y-2">
            <h3 className="font-semibold text-xs text-gray-600 uppercase">Attack Rationale</h3>
            <p className="whitespace-pre-wrap break-words bg-gray-50 p-3 rounded text-sm leading-tight">{data.attack_rationale}</p>
          </section>

          {/* Impact and Feasibility */}
          <section className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-xs text-gray-600 uppercase">Impact</h3>
              <Badge className={impactColors[data.impact]}>{data.impact}</Badge>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-xs text-gray-600 uppercase">Feasibility</h3>
              <Badge className={feasibilityColors[data.feasibility]}>{data.feasibility}</Badge>
            </div>
          </section>
        </div>

        <div className="p-4 border-t flex justify-end bg-gray-50">
          <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function QuestionCell({ row }: { row: { getValue: (key: string) => any; original: QAPair } }) {
  const [open, setOpen] = useState(false);
  console.log(row.original);
  const question = row.original.question;
  const indicators = parseIndicators(row.original.vulnerable_response_indicators);

  return (
    <>
      <div
        className="space-y-2 cursor-pointer hover:bg-gray-100 rounded transition-colors w-full h-full flex flex-col"
        onClick={() => setOpen(true)}
      >
        <p className="text-sm leading-tight break-words whitespace-normal text-gray-900">{question}</p>
        <div className="flex flex-wrap gap-1">
          {indicators.map((ind, i) => (
            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.5 flex-shrink-0">{ind}</Badge>
          ))}
        </div>
      </div>
      <DetailsModal open={open} onClose={() => setOpen(false)} data={row.original} />
    </>
  );
}

function ExpectedCell({ row }: { row: any }) {
  const response = row.getValue("expected_secure_response") as string;
  return (
    <div className="w-full">
      <p className="text-sm leading-tight break-words whitespace-normal">{response}</p>
    </div>
  );
}

function ActualCell({ row }: { row: any }) {
  const actual = row.getValue("actual_response") as string | null;
  const status = row.original.status || "pending";
  const passed = row.original.test_passed;

  if (!actual || status === "pending") {
    return <span className="text-xs text-muted-foreground italic">Not tested yet</span>;
  }

  const bg = passed === false ? "bg-red-50 border-l-4 border-red-500" : passed === true ? "bg-green-50 border-l-4 border-green-500" : "bg-gray-50";
  return (
    <div className={`${bg} rounded w-full h-full`}>
      <p className="text-xs leading-tight break-words whitespace-normal p-1">{actual}</p>
    </div>
  );
}

function RationaleCell({ row }: { row: any }) {
  const rationale = row.getValue("attack_rationale") as string;
  const impact = row.original.impact as string;
  const feasibility = row.original.feasibility as string;

  return (
    <div className="space-y-1.5 w-full">
      <p className="text-xs leading-tight break-words whitespace-normal">{rationale}</p>
      <div className="flex gap-1">
        <Badge className={`${impactColors[impact]} text-[10px] px-1.5 py-0`}>{impact}</Badge>
        <Badge className={`${feasibilityColors[feasibility]} text-[10px] px-1.5 py-0`}>{feasibility}</Badge>
      </div>
    </div>
  );
}

function ObservationsCell({ row }: { row: any }) {
  const observations = row.getValue("observations") as string | null;
  if (!observations) return <span className="text-xs text-muted-foreground italic">-</span>;
  return (
    <div className="max-w-[200px] p-1 text-[14px] leading-tight">
      <p className="break-words whitespace-normal text-gray-800 line-clamp-3 max-h-16">{observations}</p>
    </div>
  );
}

export const qaColumns: ColumnDef<QAPair>[] = [
  {
    id: "question",
    header: "Question",
    cell: QuestionCell,
  },
  {
    accessorKey: "expected_secure_response",
    header: "Expected Response",
    cell: ExpectedCell,
  },
  {
    accessorKey: "actual_response",
    header: "Actual Response",
    cell: ActualCell,
  },
  {
    accessorKey: "attack_rationale",
    header: "Attack Rationale",
    cell: RationaleCell,
  },
  {
    accessorKey: "observations",
    header: "Observations",
    cell: ObservationsCell,
  },
];
