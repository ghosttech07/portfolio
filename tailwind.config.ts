import type { Config } from 'tailwindcss';

// Colors read CSS variables (space-separated RGB channels) so the whole theme
// can be swapped from app/globals.css — and still support `bg-accent/20` etc.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette (swap in app/globals.css)
        deep: token('orange-deep'),
        brand: token('orange'),
        light: token('orange-light'),
        cream: token('cream'),
        ink: token('ink'),
        // Semantic aliases used by shared UI
        bg: token('ink'),
        fg: token('cream'),
        accent: token('orange'),
        'accent-ink': token('ink'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        chunk: ['var(--font-chunk)', 'Impact', 'sans-serif'],
        grotesk: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        hero: ['var(--font-hero)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
