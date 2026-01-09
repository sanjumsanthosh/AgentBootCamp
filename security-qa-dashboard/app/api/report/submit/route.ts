import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

interface ReportBody {
  team?: string;
  executive_summary?: string;
  key_findings?: unknown;
  vulnerability_analysis?: unknown;
  risk_assessment?: string;
  recommendations?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReportBody;
    const {
      team,
      executive_summary,
      key_findings,
      vulnerability_analysis,
      risk_assessment,
      recommendations,
    } = body || {};

    const errors: string[] = [];
    if (!team || typeof team !== 'string') errors.push('team is required and must be a string');
    if (!executive_summary || typeof executive_summary !== 'string') errors.push('executive_summary is required and must be a string');
    if (!risk_assessment || typeof risk_assessment !== 'string') errors.push('risk_assessment is required and must be a string');

    if (errors.length) {
      return NextResponse.json({ error: 'Invalid request', details: errors }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reports')
      .insert({
        team,
        executive_summary,
        key_findings: key_findings ?? null,
        vulnerability_analysis: vulnerability_analysis ?? null,
        risk_assessment,
        recommendations: recommendations ?? null,
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    const baseUrl = request.nextUrl.origin;
    const reportUrl = `${baseUrl}/report/${data?.id}`;

    return NextResponse.json({ 
      success: true, 
      report_id: data?.id, 
      created_at: data?.created_at,
      report_url: reportUrl 
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
