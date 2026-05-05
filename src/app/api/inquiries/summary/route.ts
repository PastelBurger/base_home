import { NextResponse } from 'next/server';
import { getInquirySummaries, INQUIRY_SHEETS } from '@/lib/inquiries';
import { getLastSeenMap } from '@/lib/lastSeen';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const debug = new URL(request.url).searchParams.get('debug') === '1';
  try {
    const lastSeenMap = await getLastSeenMap(INQUIRY_SHEETS);
    const summaries = await getInquirySummaries(lastSeenMap, { debug });
    return NextResponse.json({
      summaries,
      ...(debug
        ? {
            debug: {
              redisConfigured: !!process.env.REDIS_URL,
              sheetIdConfigured: !!process.env.GOOGLE_INQUIRY_SHEET_ID,
              passwordConfigured: !!process.env.INQUIRY_VIEW_PASSWORD,
              lastSeenMap,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error('Inquiry summary API error:', error);
    return NextResponse.json({ summaries: [] });
  }
}
