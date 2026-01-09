"use client";

import { useState, useEffect, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, AlertCircle, CheckCircle, AlertTriangle, TrendingDown } from "lucide-react";
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
  report_url?: string;
};

interface ReportDetailsModalProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
}

function ReportDetailsModal({ open, onClose, report }: ReportDetailsModalProps) {
  const [activeSection, setActiveSection] = useState('summary');
  const summaryRef = useRef<HTMLDivElement>(null);
  const executiveRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const findingsRef = useRef<HTMLDivElement>(null);
  const vulnerabilityRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  if (!open || !report) return null;

  // Calculate security score from vulnerability analysis
  const calculateSecurityScore = () => {
    if (!report.vulnerability_analysis || typeof report.vulnerability_analysis !== 'object') {
      return { score: 0, critical: 0, high: 0, medium: 0, low: 0, passed: 0 };
    }

    const va = report.vulnerability_analysis as any;
    const critical = va.critical?.count || 0;
    const high = va.high?.count || 0;
    const medium = va.medium?.count || 0;
    const low = va.low?.count || 0;
    
    // Estimate passed tests (this would normally come from the report)
    const totalTests = 20; // base assumption
    const failedTests = critical + high + medium + low;
    const passed = Math.max(0, totalTests - failedTests);
    
    // Calculate score: 100 - (critical*4 + high*3 + medium*1.5 + low*0.5)
    const deductions = (critical * 10) + (high * 5) + (medium * 2.5) + (low * 1.5);
    const score = Math.max(0, Math.min(100, 100 - deductions));

    return { score: Math.round(score), critical, high, medium, low, passed };
  };

  const scores = calculateSecurityScore();
  const scoreColor = scores.score >= 80 ? 'text-green-600' : scores.score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreBgColor = scores.score >= 80 ? 'bg-green-30' : scores.score >= 30 ? 'bg-yellow-30' : 'bg-red-30';

  const sections = [
    { id: 'summary', label: 'Security Summary', ref: summaryRef },
    { id: 'executive', label: 'Executive Summary', ref: executiveRef },
    { id: 'risk', label: 'Risk Assessment', ref: riskRef },
    ...(report.key_findings ? [{ id: 'findings', label: 'Key Findings', ref: findingsRef }] : []),
    ...(report.vulnerability_analysis ? [{ id: 'vulnerability', label: 'Vulnerability Analysis', ref: vulnerabilityRef }] : []),
    ...(report.recommendations ? [{ id: 'recommendations', label: 'Recommendations', ref: recommendationsRef }] : []),
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col mx-4 overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50 sticky top-0 z-10">
          <h2 className="font-semibold text-lg">Report: {report.team}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Security Summary Section */}
          <div ref={summaryRef} className={`${scoreBgColor} border-2 border-gray-200 rounded-lg p-6`}>
            <h3 className="font-semibold text-gray-900 uppercase text-sm mb-4">Security Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {/* Score Donut Chart */}
              <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center relative">
                <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                  {/* Score progress */}
                  <circle
                    cx="70"
                    cy="70"
                    r="55"
                    fill="none"
                    stroke={scores.score >= 80 ? '#22c55e' : scores.score >= 60 ? '#eab308' : '#ef4444'}
                    strokeWidth="12"
                    strokeDasharray={`${(scores.score / 100) * 345.6} 345.6`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className={`text-3xl font-bold ${scoreColor}`}>{scores.score}</div>
                  <div className="text-xs text-gray-600">Score</div>
                </div>
              </div>

              {/* Status Horizontal Bars */}
              <div className="col-span-2 md:col-span-4 space-y-4">
                {/* Critical Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 w-16">Critical</span>
                  <div className="flex-1 relative h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded overflow-hidden">
                    <div className="absolute inset-0 bg-white/30"></div>
                  </div>
                  <div className="text-sm font-bold text-red-600 w-8 text-right">{scores.critical}</div>
                  {scores.critical > 0 && (
                    <div className="absolute" style={{ left: `${Math.min(100, (scores.critical / 7) * 100)}%` }}>
                      <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
                    </div>
                  )}
                </div>

                {/* High Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 w-16">High</span>
                  <div className="flex-1 relative h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded overflow-hidden">
                    <div className="absolute inset-0 bg-white/30"></div>
                  </div>
                  <div className="text-sm font-bold text-orange-600 w-8 text-right">{scores.high}</div>
                  {scores.high > 0 && (
                    <div className="absolute" style={{ left: `${Math.min(100, (scores.high / 7) * 100)}%` }}>
                      <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
                    </div>
                  )}
                </div>

                {/* Medium Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 w-16">Medium</span>
                  <div className="flex-1 relative h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded overflow-hidden">
                    <div className="absolute inset-0 bg-white/30"></div>
                  </div>
                  <div className="text-sm font-bold text-yellow-600 w-8 text-right">{scores.medium}</div>
                  {scores.medium > 0 && (
                    <div className="absolute" style={{ left: `${Math.min(100, (scores.medium / 7) * 100)}%` }}>
                      <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
                    </div>
                  )}
                </div>

                {/* Low Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 w-16">Low</span>
                  <div className="flex-1 relative h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded overflow-hidden">
                    <div className="absolute inset-0 bg-white/30"></div>
                  </div>
                  <div className="text-sm font-bold text-blue-600 w-8 text-right">{scores.low}</div>
                  {scores.low > 0 && (
                    <div className="absolute" style={{ left: `${Math.min(100, (scores.low / 7) * 100)}%` }}>
                      <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-black"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="border-t pt-4 mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick Navigation</p>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.ref)}
                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section ref={executiveRef} className="space-y-2">
            <h3 className="font-semibold text-gray-900 uppercase text-sm">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">{report.executive_summary}</p>
          </section>

          <section ref={riskRef} className="space-y-2">
            <h3 className="font-semibold text-gray-900 uppercase text-sm">Risk Assessment</h3>
            <p className="text-gray-700 leading-relaxed">{report.risk_assessment}</p>
          </section>

          {report.key_findings && (
            <section ref={findingsRef} className="space-y-3">
              <h3 className="font-semibold text-gray-900 uppercase text-sm">Key Findings</h3>
              <div className="space-y-4">
                {Array.isArray(report.key_findings) ? (
                  report.key_findings.map((finding: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{finding.title}</h4>
                        <Badge
                          variant={
                            finding.severity === 'critical'
                              ? 'destructive'
                              : finding.severity === 'high'
                              ? 'outline'
                              : finding.severity === 'positive'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            finding.severity === 'positive'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : ''
                          }
                        >
                          {finding.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3">{finding.description}</p>

                      {finding.evidence && Array.isArray(finding.evidence) && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Evidence:</p>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {finding.evidence.map((item: string, i: number) => (
                              <li key={i} className="ml-3 italic text-gray-600">
                                "{item.substring(0, 120)}{item.length > 120 ? '...' : ''}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {finding.affected_tests && Array.isArray(finding.affected_tests) && (
                        <div className="flex flex-wrap gap-1">
                          {finding.affected_tests.map((test: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {test}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                    {typeof report.key_findings === 'string'
                      ? report.key_findings
                      : JSON.stringify(report.key_findings, null, 2)}
                  </div>
                )}
              </div>
            </section>
          )}

          {report.vulnerability_analysis && (
            <section ref={vulnerabilityRef} className="space-y-3">
              <h3 className="font-semibold text-gray-900 uppercase text-sm">Vulnerability Analysis</h3>
              {typeof report.vulnerability_analysis === 'object' && !Array.isArray(report.vulnerability_analysis) ? (
                <div className="space-y-4">
                  {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                    const level = report.vulnerability_analysis[severity];
                    if (!level || level.count === 0) return null;
                    
                    const severityColors = {
                      critical: 'border-red-300 bg-red-50',
                      high: 'border-orange-300 bg-orange-50',
                      medium: 'border-yellow-300 bg-yellow-50',
                      low: 'border-blue-300 bg-blue-50'
                    };
                    
                    const badgeVariants = {
                      critical: 'destructive',
                      high: 'outline',
                      medium: 'outline',
                      low: 'outline'
                    };
                    
                    return (
                      <div key={severity}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={badgeVariants[severity] as any}>
                            {severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-semibold text-gray-600">{level.count} found</span>
                        </div>
                        
                        {level.details && level.details.length > 0 && (
                          <div className="space-y-2 ml-2">
                            {level.details.map((vuln: any, idx: number) => (
                              <div key={idx} className={`border-l-4 p-3 rounded text-xs ${severityColors[severity]}`}>
                                <div className="flex items-start justify-between mb-1">
                                  <p className="font-semibold text-gray-900">{vuln.vulnerability}</p>
                                  {vuln.cvss_score && (
                                    <span className="text-xs font-bold bg-white px-2 py-1 rounded">
                                      CVSS {vuln.cvss_score}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 mb-2">{vuln.description}</p>
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Remediation:</p>
                                  <p className="text-gray-600 italic">{vuln.remediation}</p>
                                </div>
                                {vuln.affected_qa_ids && vuln.affected_qa_ids.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {vuln.affected_qa_ids.map((id: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {id}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {level.categories && level.categories.length > 0 && (
                          <div className="ml-2 mt-2 flex flex-wrap gap-1">
                            {level.categories.map((cat: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {cat.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                  {typeof report.vulnerability_analysis === 'string'
                    ? report.vulnerability_analysis
                    : JSON.stringify(report.vulnerability_analysis, null, 2)}
                </div>
              )}
            </section>
          )}

          {report.recommendations && (
            <section ref={recommendationsRef} className="space-y-3">
              <h3 className="font-semibold text-gray-900 uppercase text-sm">Recommendations</h3>
              {Array.isArray(report.recommendations) ? (
                <div className="space-y-3">
                  {report.recommendations.map((rec: any, idx: number) => {
                    const impactColor = rec.impact === 'critical' ? 'bg-red-50' : rec.impact === 'high' ? 'bg-orange-50' : 'bg-yellow-50';
                    const effortColor = rec.effort === 'low' ? 'text-green-700' : rec.effort === 'medium' ? 'text-orange-700' : 'text-red-700';
                    
                    return (
                      <div key={idx} className={`border-l-4 border-blue-300 ${impactColor} p-4 rounded`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold bg-blue-100 px-2 py-1 rounded text-blue-800">
                                Priority {rec.priority}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {rec.category?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">{rec.recommendation}</p>
                          </div>
                          <div className="ml-3 flex flex-col gap-1 text-right">
                            <div className="text-xs">
                              <span className="font-semibold text-gray-700">Impact: </span>
                              <Badge 
                                variant={rec.impact === 'critical' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {rec.impact}
                              </Badge>
                            </div>
                            <div className={`text-xs font-semibold ${effortColor}`}>
                              Effort: {rec.effort}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">Implementation Details:</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{rec.implementation_details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                  {typeof report.recommendations === 'string'
                    ? report.recommendations
                    : JSON.stringify(report.recommendations, null, 2)}
                </div>
              )}
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

export { ReportDetailsModal };
