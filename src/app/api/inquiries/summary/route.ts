import { NextResponse } from 'next/server';
import { getInquirySummaries, INQUIRY_SHEETS } from '@/lib/inquiries';
import { getLastSeenMap } from '@/lib/lastSeen';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lastSeenMap = await getLastSeenMap(INQUIRY_SHEETS);
    const summaries = await getInquirySummaries(lastSeenMap);
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Inquiry summary API error:', error);
    return NextResponse.json({ summaries: [] });
  }
}
