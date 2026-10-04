import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Review } from '@/data/content';

/**
 * Where client-submitted reviews are kept.
 *
 *  • Production (Vercel): set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *    (free Upstash Redis, or Vercel Marketplace → Upstash). Reviews live in a Redis list.
 *  • Local dev / self-hosting: falls back to data/.reviews.json.
 *
 * On Vercel without Redis configured there is nowhere durable to write, so
 * `addReview` throws and the API tells the visitor to try again later.
 */

const KEY = 'portfolio:reviews';
const MAX = 60;
const FILE = path.join(process.cwd(), 'data', '.reviews.json');

const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

async function redis(command: (string | number)[]) {
  const res = await fetch(redisUrl()!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return (await res.json()).result;
}

export async function getSubmittedReviews(): Promise<Review[]> {
  try {
    if (redisUrl() && redisToken()) {
      const rows: string[] = (await redis(['LRANGE', KEY, 0, MAX - 1])) ?? [];
      return rows.map((r) => JSON.parse(r) as Review);
    }
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as Review[];
  } catch {
    return [];
  }
}

export async function addReview(r: Review) {
  if (redisUrl() && redisToken()) {
    await redis(['LPUSH', KEY, JSON.stringify(r)]);
    await redis(['LTRIM', KEY, 0, MAX - 1]);
    return;
  }
  if (process.env.VERCEL) throw new Error('Review storage is not configured');
  const list = await getSubmittedReviews();
  await fs.writeFile(FILE, JSON.stringify([r, ...list].slice(0, MAX), null, 2));
}
