import {
  siPython,
  siJavascript,
  siTypescript,
  siCplusplus,
  siHtml5,
  siReact,
  siTailwindcss,
  siNodedotjs,
  siExpress,
  siSupabase,
  siVercel,
  siGit,
  siGithub,
  siCursor,
  siFigma,
  siN8n,
  siClaude,
} from 'simple-icons';
// The classic blue CSS3 shield and the OpenAI mark live in the older icon set (v13), aliased in package.json.
import { siCss3, siOpenai } from 'simple-icons-v13';

/**
 * Logo registry for the Skills section. Keys are used by `about.skills[].items[].icon`
 * in data/content.ts. Logos are the official brand marks: the `simple-icons` package (brand colours), plus the
 * OpenAI mark for ChatGPT and the Claude Code mark from LobeHub's icon set.
 * Unknown keys fall back to a letter badge, so a typo never breaks the page.
 */
type Fill = { kind: 'fill'; path: string; hex: string; evenodd?: boolean };
type Stroke = { kind: 'stroke'; d: string; hex: string };
type Def = Fill | Stroke;

const fill = (i: { path: string; hex: string }): Fill => ({ kind: 'fill', path: i.path, hex: `#${i.hex}` });

// Some official brand colours are near-black; they sit on a white tile so they stay visible.
const ICONS: Record<string, Def> = {
  python: fill(siPython),
  javascript: fill(siJavascript),
  typescript: fill(siTypescript),
  cpp: fill(siCplusplus),
  html: fill(siHtml5),
  css: fill(siCss3), // the classic CSS3 shield
  react: fill(siReact),
  tailwind: fill(siTailwindcss),
  node: fill(siNodedotjs),
  express: fill(siExpress),
  supabase: fill(siSupabase),
  vercel: fill(siVercel),
  git: fill(siGit),
  github: fill(siGithub),
  cursor: fill(siCursor),
  figma: fill(siFigma),
  n8n: fill(siN8n),
  claude: fill(siClaude),
  // official Claude Code mark (Anthropic's pixel character), from LobeHub's icon set
  claudecode: { kind: 'fill', evenodd: true, hex: '#D97757', path: 'M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z' },
  // ChatGPT uses the OpenAI mark
  chatgpt: { ...fill(siOpenai), hex: '#000000' }, // OpenAI's current brand colour is black (the old release still lists purple)
};

export function SkillLogo({ icon, name, className = 'h-full w-full' }: { icon: string; name: string; className?: string }) {
  const def = ICONS[icon];
  if (!def) {
    return (
      <span aria-hidden className={`flex items-center justify-center font-chunk text-lg text-ink ${className}`}>
        {name[0]}
      </span>
    );
  }
  return def.kind === 'fill' ? (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill={def.hex}>
      <path d={def.path} fillRule={def.evenodd ? 'evenodd' : undefined} clipRule={def.evenodd ? 'evenodd' : undefined} />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke={def.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={def.d} />
    </svg>
  );
}
