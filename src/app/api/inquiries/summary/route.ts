import { NextResponse } from 'next/server';
import { getInquirySummaries } from '@/lib/inquiries';

export const revalidate = 60;

export async function GET() {
  try {
    const summaries = await getInquirySummaries();
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Inquiry summary API error:', error);
    return NextResponse.json({ summaries: [] });
  }
}
