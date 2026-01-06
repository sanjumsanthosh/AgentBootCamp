"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type Report = {
  id: string;
  team: string;
  executive_summary: string;
  risk_assessment: string;
  key_findings?: any;
  vulnerability_analysis?: any;
  recommendations?: any;
  created_at: string;
};

interface ReportDetailsModalProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
}

function ReportDetailsModal({ open, onClose, report }: ReportDetailsModalProps) {
  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col mx-4 overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50 sticky top-0">
          <h2 className="font-semibold text-lg">Report: {report.team}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <section className="space-y-2">
            <h3 className="font-semibold text-gray-900 uppercase text-sm">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">{report.executive_summary}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-gray-900 uppercase text-sm">Risk Assessment</h3>
            <p className="text-gray-700 leading-relaxed">{report.risk_assessment}</p>
          </section>

          {report.key_findings && (
            <section className="space-y-2">
              <h3 className="font-semibold text-gray-900 uppercase text-sm">Key Findings</h3>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                {typeof report.key_findings === 'string' ? report.key_findings : JSON.stringify(report.key_findings, null, 2)}
              </div>
            </section>
          )}

          {report.vulnerability_analysis && (
            <section className="space-y-2">
              <h3 className="font-semibold text-gray-900 uppercase text-sm">Vulnerability Analysis</h3>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                {typeof report.vulnerability_analysis === 'string' ? report.vulnerability_analysis : JSON.stringify(report.vulnerability_analysis, null, 2)}
              </div>
            </section>
          )}

          {report.recommendations && (
            <section className="space-y-2">
              <h3 className="font-semibold text-gray-900 uppercase text-sm">Recommendations</h3>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                {typeof report.recommendations === 'string' ? report.recommendations : JSON.stringify(report.recommendations, null, 2)}
              </div>
            </section>
          )}

          <div className="text-xs text-gray-500">
            Created: {new Date(report.created_at).toLocaleString()}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

export const reportColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "team",
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
      return <div className="font-medium">{row.getValue("team")}</div>;
    },
  },
  {
    accessorKey: "executive_summary",
    header: "Executive Summary",
    cell: ({ row }) => {
      const summary = row.getValue("executive_summary") as string;
      return (
        <div className="max-w-xs text-sm text-gray-700">
          <p className="line-clamp-2">{summary}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "risk_assessment",
    header: "Risk Level",
    cell: ({ row }) => {
      const risk = row.getValue("risk_assessment") as string;
      const riskLevel = risk?.toLowerCase().includes('critical') || risk?.toLowerCase().includes('high') ? 'high' : 
                        risk?.toLowerCase().includes('medium') ? 'medium' : 'low';
      
      const colorMap: Record<string, string> = {
        high: "bg-red-100 text-red-800",
        medium: "bg-yellow-100 text-yellow-800",
        low: "bg-green-100 text-green-800",
      };

      return (
        <Badge className={colorMap[riskLevel]}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(row.getValue("created_at")), {
            addSuffix: true,
          })}
        </div>
      );
    },
  },
];

interface ReportsCellProps {
  row: {
    original: Report;
    getValue: (key: string) => any;
  };
  onView?: (report: Report) => void;
}

function ReportsCell({ row, onView }: ReportsCellProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onView?.(row.original)}
      className="text-blue-600 hover:text-blue-800"
    >
      View Report
    </Button>
  );
}

export function useReportModal() {
  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  return {
    open,
    selectedReport,
    openModal: (report: Report) => {
      setSelectedReport(report);
      setOpen(true);
    },
    closeModal: () => {
      setOpen(false);
      setSelectedReport(null);
    },
    Modal: ReportDetailsModal,
  };
}
