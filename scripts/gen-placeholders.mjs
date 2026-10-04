// Generates placeholder SVG art for /public/projects. Run: node scripts/gen-placeholders.mjs
// Replace the paths in data/content.ts with real screenshots whenever you like.
import { writeFileSync, mkdirSync } from 'node:fs';

const items = {
  'lumen-commerce': ['#FFB27A', '#E8500A'],
  'atlas-support-ai': ['#1c1c1c', '#FF6A00'],
  'pulse-fitness': ['#FF9A3C', '#B8390A'],
  'verde-studio': ['#2b2b2b', '#FF9A3C'],
  'northwind-analytics': ['#FFD2A8', '#E8500A'],
  'sage-notes-ai': ['#111111', '#FF8A2A'],
};
mkdirSync('public/projects', { recursive: true });

const svg = (w, h, [a, b], variant, seed) => {
  const bars = Array.from({ length: 5 }, (_, i) =>
    `<rect x="${w * 0.12}" y="${h * (0.36 + i * 0.09)}" width="${w * (0.3 + ((i * 7 + seed) % 5) * 0.08)}" height="${h * 0.025}" rx="${h * 0.0125}" fill="#fff" opacity="${0.5 - i * 0.06}"/>`).join('');
  const blobs = `<circle cx="${w * (0.8 - variant * 0.1)}" cy="${h * 0.25}" r="${h * 0.32}" fill="#fff" opacity=".14"/><circle cx="${w * 0.2}" cy="${h * 0.95}" r="${h * 0.4}" fill="#000" opacity=".18"/>`;
  const card = variant % 2
    ? `<rect x="${w * 0.55}" y="${h * 0.3}" width="${w * 0.33}" height="${h * 0.42}" rx="${h * 0.03}" fill="#000" opacity=".28"/><rect x="${w * 0.58}" y="${h * 0.34}" width="${w * 0.27}" height="${h * 0.22}" rx="${h * 0.02}" fill="#fff" opacity=".35"/>`
    : `<circle cx="${w * 0.72}" cy="${h * 0.52}" r="${h * 0.22}" fill="none" stroke="#fff" stroke-width="${h * 0.02}" opacity=".5"/><circle cx="${w * 0.72}" cy="${h * 0.52}" r="${h * 0.12}" fill="#fff" opacity=".3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>${blobs}<rect x="${w * 0.06}" y="${h * 0.12}" width="${w * 0.88}" height="${h * 0.78}" rx="${h * 0.035}" fill="#0a0a0a" opacity=".14"/><rect x="${w * 0.1}" y="${h * 0.2}" width="${w * 0.36}" height="${h * 0.05}" rx="${h * 0.025}" fill="#fff" opacity=".9"/>${bars}${card}</svg>`;
};

let seed = 0;
for (const [id, colors] of Object.entries(items)) {
  seed++;
  writeFileSync(`public/projects/${id}-thumb.svg`, svg(960, 1200, colors, 1, seed));
  writeFileSync(`public/projects/${id}-hero.svg`, svg(1600, 900, colors, 0, seed));
  for (let g = 1; g <= 3; g++) writeFileSync(`public/projects/${id}-g${g}.svg`, svg(1200, 800, colors, g, seed + g));
}
console.log('placeholders written');
