import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { addReview, getSubmittedReviews } from '@/lib/reviewStore';
import type { Review } from '@/data/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Best-effort spam brake (per server instance): 3 reviews / hour / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= 3) return true;
  hits.set(ip, [...recent, now]);
  return false;
}

export async function GET() {
  const canSubmit = !process.env.VERCEL || Boolean(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
  );
  return NextResponse.json({ reviews: await getSubmittedReviews(), canSubmit }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // honeypot: pretend success

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const name = str(body.name, 60);
  const business = str(body.business, 80);
  const quote = str(body.quote, 400);
  const rating = Math.round(Number(body.rating));

  if (name.length < 2 || quote.length < 10 || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ ok: false, error: 'Please add your name, a star rating and a short review (10+ characters).' }, { status: 422 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'You have sent a few reviews already. Please try again later.' }, { status: 429 });
  }

  const review: Review = { id: `u-${randomUUID()}`, name, business: business || 'Client', rating: rating as Review['rating'], quote };
  try {
    await addReview(review);
  } catch {
    return NextResponse.json({ ok: false, error: 'Reviews cannot be saved right now. Please try again later.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, review });
}
