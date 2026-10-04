import type { MetadataRoute } from 'next';
import { site } from '@/data/content';

export default function sitemap(): MetadataRoute.Sitemap {
  // Single-page site. Add case-study routes here if you later split them out.
  return [{ url: site.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
