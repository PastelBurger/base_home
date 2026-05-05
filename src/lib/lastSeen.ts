import { getRedis } from './redis';
import type { InquirySheet } from './inquiries';

const KEY_PREFIX = 'iplp:inquiry:lastSeen:';

export async function getLastSeenMap(
  sheets: readonly InquirySheet[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const s of sheets) result[s] = 0;

  const redis = getRedis();
  if (!redis) return result;

  try {
    const keys = sheets.map((s) => KEY_PREFIX + s);
    const values = await redis.mget(...keys);
    sheets.forEach((s, i) => {
      const v = values[i];
      if (v) {
        const n = parseFloat(v);
        if (!Number.isNaN(n)) result[s] = n;
      }
    });
  } catch (e) {
    console.error('redis mget error:', e);
  }
  return result;
}

export async function setLastSeen(sheet: InquirySheet, value: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(KEY_PREFIX + sheet, String(value));
  } catch (e) {
    console.error('redis set error:', e);
  }
}
