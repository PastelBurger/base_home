import Redis from 'ioredis';

declare global {
  var __iplpRedis: Redis | null | undefined;
  var __iplpRedisInit: boolean | undefined;
}

export function getRedis(): Redis | null {
  if (globalThis.__iplpRedisInit) return globalThis.__iplpRedis ?? null;
  globalThis.__iplpRedisInit = true;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('REDIS_URL not set; last-seen state will not persist');
    globalThis.__iplpRedis = null;
    return null;
  }

  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  });
  client.on('error', (err) => console.error('Redis error:', err.message));
  globalThis.__iplpRedis = client;
  return client;
}
