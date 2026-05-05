import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getInquiryDetail, isValidInquirySheet } from '@/lib/inquiries';
import { setLastSeen } from '@/lib/lastSeen';

export const dynamic = 'force-dynamic';

function passwordsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.INQUIRY_VIEW_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: '서버에 비밀번호가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  let body: { password?: unknown; sheet?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const password = typeof body.password === 'string' ? body.password : '';
  const sheet = typeof body.sheet === 'string' ? body.sheet : '';

  if (!passwordsMatch(password, expected)) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  if (!isValidInquirySheet(sheet)) {
    return NextResponse.json({ error: '알 수 없는 시트입니다.' }, { status: 400 });
  }

  const detail = await getInquiryDetail(sheet);
  if (!detail) {
    return NextResponse.json({ error: '데이터를 가져오지 못했습니다.' }, { status: 500 });
  }

  // Mark as seen for all users (shared state)
  await setLastSeen(sheet, detail.highWaterMark);

  return NextResponse.json({ detail });
}
