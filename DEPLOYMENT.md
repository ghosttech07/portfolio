# Deploy the portfolio on Vercel

Import `ghosttech07/portfolio` into Vercel. Choose Next.js, repository root, and the default build (`npm run build`) and output settings. The project has a lockfile; use `npm ci` for installation.

Add these values in Vercel Project Settings → Environment Variables before deploying:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Your existing private Resend API key |
| `CONTACT_TO_EMAIL` | `spandansahu07@gmail.com` |
| `CONTACT_FROM_EMAIL` | Your configured Resend sender; the test sender must send to your Resend account email |
| `NEXT_PUBLIC_SITE_URL` | The complete public portfolio URL, including `https://` |

Do not upload `.env.local` or expose the API key through a `NEXT_PUBLIC_` variable. Copy the private settings directly from your local configuration into Vercel. Rebuild after changing the public site URL. Without an explicit site URL, production metadata uses Vercel's production domain.

## Optional visitor reviews

The two approved client reviews are bundled and need no database. To enable the visitor review form on Vercel, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from an Upstash Redis database. The form stays hidden in deployments without durable storage.

## After deployment

- Open the site on a real Android phone and iPhone, if available. Check menu navigation, all pricing dialogs, all project popups, next/previous, close buttons, and contact inputs.
- Submit one contact test and confirm delivery and Reply-To.
- Check `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` use the deployed domain.
- Confirm all three live project links and social links.
- Run a mobile Lighthouse or PageSpeed audit against the public deployment. Local timings do not represent a slow mobile network or GPU.
- Connect a custom domain only if you own one, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.

## Local production check

Stop the development server before running `npm run build`, then run `npm start`. Both modes use `.next`, so they should not run against the same build directory simultaneously.

The font files are bundled locally with their OFL licenses. Production builds do not need Google Fonts downloads.
