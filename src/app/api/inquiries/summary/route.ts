import { NextResponse } from 'next/server';
import {
  getInquirySummaries,
  INQUIRY_SHEETS,
  lastSummariesError,
  lastSummariesEarlyExit,
} from '@/lib/inquiries';
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
              serviceAccountConfigured: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
              passwordConfigured: !!process.env.INQUIRY_VIEW_PASSWORD,
              lastSeenMap,
              earlyExit: lastSummariesEarlyExit,
              summariesError: lastSummariesError,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error('Inquiry summary API error:', error);
    return NextResponse.json({
      summaries: [],
      ...(debug
        ? {
            debug: {
              routeError: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
            },
          }
        : {}),
    });
  }
}
