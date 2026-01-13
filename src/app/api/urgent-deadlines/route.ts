import { NextResponse } from 'next/server';
import { getUrgentDeadlines } from '@/lib/googleSheets';

export const revalidate = 300; // 5 minutes cache

export async function GET() {
  try {
    const cases = await getUrgentDeadlines();
    return NextResponse.json({ cases });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ cases: [] });
  }
}
