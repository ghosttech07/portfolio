# Spandan Sahu — 3D freelance portfolio

Next.js 15 (App Router) · TypeScript · Tailwind · React Three Fiber + drei · GSAP/ScrollTrigger · Framer Motion · Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where to edit things

| What | Where |
| --- | --- |
| **All content** (projects, reviews, socials, stats, hero copy, nav, budgets) | `data/content.ts` |
| **Colours** (`--orange-deep`, `--orange`, `--orange-light`, `--cream`, `--ink`) | `app/globals.css` (`:root`) |
| **Your photo** (transparent PNG, ~3:4) | `public/hero/spandan.png` |
| **Project images** | `public/projects/*` then update paths in `data/content.ts` |
| **Intro character** (Lottie / Rive) | drop into `public/character/`, then set `CHARACTER_PROPS` in `components/Intro/Intro.tsx` (see comments in `components/Intro/Character.tsx`) |
| **3D headline font** | `node scripts/gen-font.mjs path/to/Font.ttf public/fonts/anton.typeface.json` |
| **Placeholder art** | `node scripts/gen-placeholders.mjs` |
| **Contact email sending** | `app/api/contact/route.ts` (Resend; configure the environment variables) |

Set `NEXT_PUBLIC_SITE_URL` in Vercel for correct SEO / Open Graph / sitemap URLs.

## Structure

```
components/
  Intro/         shutter + rope + <Character /> (pull-down reveal, once per session)
  Hero3D/        R3F "CREATE" scene, CSS-3D white panel, client stack
  Orbit/         3D ring of project cards (+ mobile snap carousel)
  ProjectModal/  card → full-screen case-study morph
  Reviews/       counters + 3D stacked review cards
  Connect/       scramble heading, magnetic buttons, form, footer
  ui/            loader, cursor, nav, menu, smooth scroll, shell
```

Reduced motion: intro skipped, rotation/float/tilt/marquee stopped, Works uses a static carousel.
Mobile / weak GPUs: fewer shapes, no transmission material (drei `PerformanceMonitor` also drops quality).
