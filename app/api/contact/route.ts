import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ContactPayload {
  name?: string;
  email?: string;
  budget?: string;
  message?: string;
  company?: string; // honeypot — real users never fill this
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

// Best-effort spam brake (per server instance): 5 messages / hour / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= 5) return true;
  hits.set(ip, [...recent, now]);
  return false;
}

/**
 * Sends the enquiry to your inbox with Resend (https://resend.com).
 * Env vars (see .env.local.example):
 *   RESEND_API_KEY     required
 *   CONTACT_TO_EMAIL   where enquiries land (default: spandansahu07@gmail.com)
 *   CONTACT_FROM_EMAIL sender (default: Resend's shared test sender)
 */
export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Bots fill the hidden field; pretend success so they move on.
  if (body.company) return NextResponse.json({ ok: true });

  const name = body.name?.trim().slice(0, 100) ?? '';
  const email = body.email?.trim().slice(0, 200) ?? '';
  const message = body.message?.trim().slice(0, 4000) ?? '';
  const budget = body.budget?.trim().slice(0, 100) ?? '';

  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ ok: false, error: 'Please fill in all fields correctly.' }, { status: 422 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many messages. Please try again later.' }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set');
    return NextResponse.json({ ok: false, error: 'Messages cannot be sent right now. Please email me directly.' }, { status: 503 });
  }

  const to = process.env.CONTACT_TO_EMAIL ?? 'spandansahu07@gmail.com';
  const from = process.env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email, // hitting Reply in Gmail answers the client
        subject: `New enquiry from ${name}`,
        text: `New enquiry from your portfolio

Name:   ${name}
Email:  ${email}${budget ? `
Budget: ${budget}` : ''}

Message:
${message}
`,
        html: `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f3f1;font-family:Arial,Helvetica,sans-serif;color:#111">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="background:#FF6A00;padding:20px 28px;color:#ffffff;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New enquiry from your portfolio</td></tr>
    <tr><td style="padding:28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">
        <tr><td style="width:90px;padding:6px 0;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:1px">Name</td><td style="padding:6px 0;font-weight:bold">${esc(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:1px">Email</td><td style="padding:6px 0"><a href="mailto:${esc(email)}" style="color:#E8500A">${esc(email)}</a></td></tr>
        ${budget ? `<tr><td style="padding:6px 0;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:1px">Budget</td><td style="padding:6px 0">${esc(budget)}</td></tr>` : ''}
      </table>
      <div style="height:1px;background:#e5e5e5;margin:20px 0"></div>
      <div style="color:#777;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Message</div>
      <div style="font-size:15px;line-height:1.6">${esc(message)}</div>
      <div style="margin-top:28px"><a href="mailto:${esc(email)}?subject=${encodeURIComponent('Re: your enquiry')}" style="display:inline-block;background:#111;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:13px;font-weight:bold">Reply to ${esc(name)}</a></div>
    </td></tr>
  </table>
</body></html>`,
      }),
    });
    if (!res.ok) {
      console.error('[contact] Resend error', res.status, await res.text());
      return NextResponse.json({ ok: false, error: 'Could not send your message. Please try again or email me directly.' }, { status: 502 });
    }
  } catch (err) {
    console.error('[contact] Resend request failed', err);
    return NextResponse.json({ ok: false, error: 'Could not send your message. Please try again later.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
