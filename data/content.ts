/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH — edit this file, never the components.
 * ─────────────────────────────────────────────────────────────
 * Everything visible on the site (name, hero copy, projects, reviews,
 * socials, stats, form options) comes from here.
 *
 * Images: drop files into /public/projects and point the paths below at them
 * (jpg/png/webp/avif all work; the generated .svg files are just placeholders).
 * Your hero cut-out photo lives at /public/hero/spandan.png (transparent PNG).
 */

export type Category = 'Website' | 'App' | 'Branding' | 'UI-UX' | 'Game';

export interface Project {
  id: string;
  title: string;
  category: Category;
  client: string;
  role: string;
  year: string;
  duration: string;
  projectType?: string;
  challenge?: string;
  outcome?: string;
  tagline: string;
  stack: string[];
  problem: string;
  solution: string;
  results: { value: string; label: string }[];
  /** Card image (a portrait crop is applied automatically). */
  thumbnail: string;
  /** Wide image shown at the top of the case study. */
  hero: string;
  /** Optional looping muted video for the case-study hero (mp4 in /public). */
  video?: string;
  gallery: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface Review {
  id: string;
  name: string;
  business: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  /** Optional photo (e.g. "/reviews/anna.jpg"); initials on a colour are used when empty. */
  avatar?: string;
}

export interface Social {
  id: 'instagram' | 'linkedin' | 'github' | 'email' | 'whatsapp';
  label: string;
  /** Shown in the hover tooltip. */
  handle: string;
  href: string;
}

export const site = {
  name: 'Spandan Sahu',
  firstName: 'Spandan',
  lastName: 'Sahu',
  role: 'Freelance Developer & Designer',
  // Set NEXT_PUBLIC_SITE_URL in Vercel; used for SEO, OG image and sitemap.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  description:
    'Spandan Sahu is a freelance developer and designer creating fast, beautiful websites, apps and brands that turn visitors into customers.',
  keywords: ['freelance developer', 'freelance designer', 'web designer', 'Next.js developer', 'React', 'UI/UX', 'portfolio'],
};

/** Hero copy. */
export const hero = {
  greeting: 'Hey I am',
  title: 'Freelancer',
  description: 'I design websites and apps, then build them to bring ideas to life. Fast, polished, and made to convert.',
  primaryCta: 'Hire Me',
  secondaryCta: 'View Work',
  /** Cut-out photo (transparent PNG). Empty = no photo. To bring it back: '/hero/spandan.png' */
  photo: '',
  /** Orbiting tech icons (html, css, js, figma, react, next). */
  techIcons: ['html', 'css', 'js', 'figma', 'react', 'next'] as const,
};

/** Navigation (hero panel, menu overlay, sticky pill). Point `target` at any section id. */
export const navLinks = [
  { label: 'Home', target: '#top' },
  { label: 'About', target: '#about' },
  { label: 'Services', target: '#services' },
  { label: 'Work', target: '#works' },
  { label: 'Contact', target: '#connect' },
];

export const projects: Project[] = [
  {
    id: 'ironforge-fitness',
    title: 'IronForge Fitness',
    category: 'Website',
    client: '',
    role: 'Website design & development',
    year: '',
    duration: '4 days',
    projectType: 'Personal demo project',
    tagline: 'A simple gym website demo showcasing facilities, memberships, and contact options.',
    stack: ['Next.js 15', 'React', 'Tailwind CSS', 'Framer Motion', 'Lucide React'],
    problem: 'Build a simple sample website to demonstrate how a gym can present its facilities, equipment, trainers, and membership options online across desktop, tablet, and mobile.',
    solution: 'A cinematic full-screen hero leads into the gym’s mission and facilities, an interactive equipment showcase, and Basic, Premium, and VIP membership cards. Trainer profiles, a filterable image gallery, and star-rated testimonials help visitors evaluate the experience. Clear membership calls to action, a Google Maps contact section, and a floating WhatsApp button with a pre-filled message make inquiries easy. Framer Motion adds scroll and hover animation, while responsive layouts, SEO metadata, and centrally managed content support ongoing updates.',
    results: [
      { value: '5', label: 'Equipment categories' },
      { value: '3', label: 'Membership tiers' },
    ],
    thumbnail: '/projects/ironforge-hero.png',
    hero: '/projects/ironforge-hero.png',
    gallery: ['/projects/ironforge-about.png', '/projects/ironforge-gallery.png'],
    liveUrl: 'https://gym-website-1qk1.vercel.app/',
    githubUrl: '',
  },
  {
    id: 'shakshi-storefront',
    title: 'Shakshi',
    category: 'Website',
    client: 'Shakshi mattress brand',
    role: 'Website design, development, database design & SEO',
    year: '',
    duration: '12 days',
    projectType: 'Paid client project',
    challenge: 'The main challenge was making the website load smoothly while delivering an immersive shopping experience.',
    outcome: 'The client was happy with the completed website and paid for the work.',
    tagline: 'A luxury mattress storefront with immersive 3D visuals and a complete commerce studio.',
    stack: ['Next.js 16', 'Tailwind CSS 4', 'Framer Motion', 'GSAP', 'Lenis', 'React Three Fiber', 'Zustand', 'Tiptap', 'Supabase'],
    problem: 'Bring a luxury mattress shopping experience and day-to-day store management together, while keeping the storefront available when the backend is unreachable. Give the team control over products, orders, editorial content, and the site design without editing code.',
    solution: 'An immersive storefront pairs 3D scenes and scroll animation with pages rendered from published content and built-in fallbacks. An independent, password-protected studio manages orders, product sizes and stock, discounts, customers, reviews, bookings, and inquiries. Its visual CMS supports editable section previews across desktop, tablet, and mobile, autosaved drafts, explicit publishing, and restorable versions. Theme settings, a rich-text Sleep Library, and a media library complete the publishing workflow. Shared types and content models connect the two apps, with database access kept in the backend and optional Supabase storage for production.',
    results: [
      { value: '2', label: 'Independent apps' },
      { value: '3', label: 'Responsive preview sizes' },
      { value: '10s', label: 'Draft autosave interval' },
    ],
    thumbnail: '/projects/shakshi-storefront.png',
    hero: '/projects/shakshi-storefront.png',
    gallery: ['/projects/shakshi-collection.png', '/projects/shakshi-catalogue.png', '/projects/shakshi-sleep-library.png'],
    liveUrl: 'https://shakshi-psi.vercel.app/',
    githubUrl: '',
  },
  {
    id: 'lord-ganesh-game',
    title: 'Lord Ganesh Game',
    category: 'Game',
    client: '',
    role: 'Game concept, database design & development',
    year: '',
    duration: '1 week',
    projectType: 'Personal competition project',
    challenge: 'The hardest part was developing an original creative direction and designing the 3D representation of Lord Ganesha.',
    outcome: 'The project went well and received enthusiastic feedback from the people who played it.',
    tagline: 'An endless 3D journey of exploration, modaks, and learning with Lord Ganesha.',
    stack: ['Three.js', 'Vite', 'WebGL 2', 'Web Workers', 'Web Audio', 'Supabase', 'PostgreSQL', 'Vercel'],
    problem: 'Create an accessible open-world game that teaches players about Lord Ganesha through exploration, while treating the deity with dignity. The experience needs to run on desktop and phones without installation, support an endless world, and keep competitive scores comparable across players.',
    solution: 'Ride Mooshika across an infinite, procedurally generated landscape spanning six blended biomes, villages, caves, and the Mount Kailash snowfields. Collect glowing modaks by answering questions, completing shlokas, arranging stories and mantras, or matching pairs. Wrong answers offer an explanation and another chance, with no death, damage, or losing. Free Journey and Modak Hunt offer relaxed exploration and competition, backed by a shared daily world, saved progress, and a global Supabase leaderboard with unique player names and score validation. Worker-built terrain, instanced props, adaptive rendering, a day–night cycle, procedural animation, and synthesised audio bring the world to life across keyboard, gamepad, and touch controls.',
    results: [
      { value: '6', label: 'Blended world biomes' },
      { value: '5', label: 'Interface languages' },
      { value: '2', label: 'Journey & Hunt modes' },
    ],
    thumbnail: '/projects/lord-ganesh-game.png',
    hero: '/projects/lord-ganesh-game.png',
    gallery: ['/projects/lord-ganesh-closeup.png', '/projects/lord-ganesh-village.png', '/projects/lord-ganesh-kailash.png'],
    liveUrl: 'https://lordganesh-ochre.vercel.app/',
    githubUrl: '',
  },
];

/** Filter chips above the ring. `match: null` means "show everything". */
export const filters: { label: string; match: Category[] | null }[] = [
  { label: 'All', match: null },
  { label: 'Web', match: ['Website'] },
  { label: 'App', match: ['App'] },
  { label: 'Branding', match: ['Branding'] },
];

export const reviews: Review[] = [
  {
    id: 'royalesleepy',
    name: 'RoyaleSleepy',
    business: 'Mattress Brand',
    rating: 5,
    quote: 'Wonderful work by Spandan! The website helped us reach a great audience and achieve strong sales.',
  },
  {
    id: 'shakshi',
    name: 'Shakshi',
    business: 'Luxury Mattress Brand',
    rating: 5,
    quote: 'Spandan did wonderful work on our website. We reached a great audience and saw excellent sales.',
  },
];

/** Replace hrefs/handles with your real ones. */
export const socials: Social[] = [
  { id: 'instagram', label: 'Instagram', handle: '@talkswithspandan', href: 'https://www.instagram.com/talkswithspandan' },
  { id: 'linkedin', label: 'LinkedIn', handle: 'in/spandan-sahu-a8252536a', href: 'https://www.linkedin.com/in/spandan-sahu-a8252536a' },
  { id: 'github', label: 'GitHub', handle: '@ghosttech07', href: 'https://github.com/ghosttech07' },
  { id: 'email', label: 'Email', handle: 'spandansahu07@gmail.com', href: 'mailto:spandansahu07@gmail.com' },
  { id: 'whatsapp', label: 'WhatsApp', handle: '+91 98617 06984', href: 'https://wa.me/919861706984' },
];

export const copy = {
  worksTitle: 'Projects',
  reviewsTitle: 'What Clients Are Saying',
  connectTitle: ["LET'S", 'GET IN', 'TOUCH'],
  connectLead: 'Have an idea, a deadline or just a question? I reply within 24 hours.',
};

/** ABOUT ME section. */
export const about = {
  heading: 'About Me',
  /** Illustrated portrait shown in the orange circle (transparent PNG in /public/about). */
  portrait: { src: '/about/boy.png', alt: 'Illustrated portrait of a boy with round glasses and his arms crossed', width: 700, height: 1321 },
  name: 'Spandan Sahu',
  firstName: 'Spandan',
  lastName: 'Sahu',
  role: 'Full-Stack Developer',
  intro:
    "Hi, I'm Spandan. I help businesses turn their ideas into websites, apps, and smart automations that actually bring results. You tell me what you need, and I'll design and build it from start to finish, so you get something that looks great, works smoothly, and is easy for you to manage.",
  skillsTitle: 'Skills',
  skillsHint: 'Drag to spin · click a card to open',
  /**
   * Skills, grouped. `icon` picks the logo (see components/About/skillIcons.ts for the list of keys).
   * Add a skill by adding { name, icon } to a group; add a group by adding a new object.
   */
  skills: [
    { category: 'Languages', items: [{ name: 'Python', icon: 'python' }, { name: 'JavaScript', icon: 'javascript' }, { name: 'TypeScript', icon: 'typescript' }, { name: 'C++', icon: 'cpp' }] },
    { category: 'Frontend', items: [{ name: 'HTML', icon: 'html' }, { name: 'CSS', icon: 'css' }, { name: 'React.js', icon: 'react' }, { name: 'Tailwind CSS', icon: 'tailwind' }] },
    { category: 'Backend', items: [{ name: 'Node.js', icon: 'node' }, { name: 'Express.js', icon: 'express' }] },
    { category: 'Database', items: [{ name: 'Supabase (PostgreSQL)', icon: 'supabase' }] },
    { category: 'Deployment & Version Control', items: [{ name: 'Vercel', icon: 'vercel' }, { name: 'Git', icon: 'git' }, { name: 'GitHub', icon: 'github' }] },
    { category: 'AI & Dev Tools', items: [{ name: 'Claude Code', icon: 'claudecode' }, { name: 'Claude', icon: 'claude' }, { name: 'ChatGPT', icon: 'chatgpt' }, { name: 'Cursor', icon: 'cursor' }] },
    { category: 'Design & Automation', items: [{ name: 'Figma', icon: 'figma' }, { name: 'n8n', icon: 'n8n' }] },
  ] as { category: string; items: { name: string; icon: string }[] }[],

  educationTitle: 'Education',
  education: [
    { degree: 'BSc in Computer Science', institution: 'BITS Pilani', period: '2025 – 2028', note: '' },
    {
      degree: 'Advanced Technology Program',
      institution: 'NxtWave Institute of Advanced Technologies (NIAT)',
      period: '2025 – 2029',
      note: 'Industry-focused training in full-stack development, AI, and software engineering, pursued alongside the BSc.',
    },
  ],
  projectLabel: 'First Client Project',
  project: {
    title: 'Royale Sleepy: E-commerce Website',
    tag: 'Client Project',
    url: 'https://royalesleepy.com',
    linkLabel: 'Visit royalesleepy.com',
    description:
      "A premium e-commerce website for Royale Sleepy, a comfort-engineered mattress brand by FoamCraft India (Sree Sainath Enterprise), an ISO 9001:2015 certified manufacturer operating since 2004. The site presents the brand's layered mattress technology (cooling comfort layer, memory foam core, natural coir support, and Bonnell spring system) alongside pillows, sofa foam, and custom foam products with pan-India delivery.",
  },
  cta: 'Hire Me',
};

/**
 * SERVICES section. Edit everything here: the copy, the service points, and the prices.
 * Each service point has its own `price` (a placeholder for now). Replace the
 * "₹XX,XXX – ₹XX,XXX" strings with real ranges whenever you decide them.
 */
export const servicesTitle = 'Services';
export const servicesSubtitle = 'What I can build for you';
export const servicesText = {
  pricingTerms: [
    'Clients are responsible for purchasing their domain.',
    'All third-party costs are paid by the client.',
    'Maintenance after project delivery is optional and charged separately. Website maintenance follows the listed range; app maintenance is quoted based on requirements.',
  ],
  viewPricing: 'View Pricing',
  pricingTitle: 'Pricing',
  quoteCta: 'Get a Quote',
  quoteTarget: '#connect', // any section id, e.g. '#connect'
  close: 'Close',
};

const PRICE = '₹XX,XXX – ₹XX,XXX';

export interface ServicePoint {
  name: string;
  price: string;
}
export interface ServiceCategory {
  id: string;
  title: string;
  /** which icon to show (see ICONS in components/Services/Services.tsx) */
  icon: 'code' | 'design' | 'ai' | 'app' | 'custom';
  points?: ServicePoint[];
  /** Custom Projects only: short description + starting range shown in the pricing view. */
  description?: string;
  startingPrice?: string;
  pricingExplainer?: string;
  highlight?: boolean;
}

export const services: ServiceCategory[] = [
  {
    id: 'web-development',
    title: 'Web Development',
    icon: 'code',
    points: [
      { name: 'Business websites and landing pages', price: '₹4,999 – ₹79,999' },
      { name: 'E-commerce websites', price: '₹15,000 – ₹1,50,000' },
      { name: 'Custom admin panels / CMS', price: '₹6,000 – ₹20,000' },
      { name: 'Web apps and SaaS MVPs', price: '₹10,000 – ₹70,000' },
      { name: 'Portfolio websites (animated & 3D)', price: '₹25,000 – ₹95,000' },
      { name: 'Website maintenance, hosting, and SEO basics', price: '₹3,000 – ₹20,000' },
    ],
  },
  {
    id: 'design',
    title: 'Design',
    icon: 'design',
    points: [
      { name: 'UI/UX design', price: '₹6,000 – ₹15,000' },
      { name: 'Wireframes and clickable prototypes', price: '₹6,000 – ₹20,000' },
      { name: 'Website redesigns', price: '₹10,000 – ₹50,000' },
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    icon: 'ai',
    points: [
      { name: 'Workflow automation with n8n', price: '₹5,000 – ₹50,000' },
      { name: 'AI chatbots for websites and WhatsApp', price: '₹2,000 – ₹10,000' },
      { name: 'AI feature integration into existing apps', price: '₹4,000 – ₹20,000' },
    ],
  },
  {
    id: 'application-development',
    title: 'Application Development',
    icon: 'app',
    points: [
      { name: 'Cross-platform mobile apps (Android + iOS) with React Native', price: '₹50,000 – ₹2,00,000' },
      { name: 'App + website combo with a shared backend', price: '₹40,000 – ₹2,00,000' },
      { name: 'MVP apps for startups', price: '₹40,000 – ₹1,50,000' },
      { name: 'Business apps (booking, ordering, loyalty, delivery tracking)', price: '₹40,000 – ₹90,000' },
      { name: 'Play Store / App Store publishing', price: '₹10,000 – ₹15,000' },
    ],
  },
  {
    id: 'custom-projects',
    title: 'Custom Projects',
    icon: 'custom',
    highlight: true,
    description:
      "Have an idea that doesn't fit the categories above? Tell me what you want to build, whether it's a unique tool, an integration, an experimental project, or something completely new, and I'll build it for you. Pricing is flexible and depends on your project's features, complexity, and level of customization. Check the price range below or get a custom quote.",
    startingPrice: 'Pricing depends on your requirements',
    pricingExplainer:
      "The final price depends on your project's features, complexity, and level of customization.",
  },
];

/** Footer details. */
export const footerInfo = {
  phone: '+91 98617 06984',
  address: 'Remote · Available worldwide',
};
