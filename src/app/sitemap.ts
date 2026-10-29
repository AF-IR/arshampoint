import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/components/arsham/content'
import { ARTICLES } from '@/lib/mag'

/* Dynamic sitemap — all crawlable (server-rendered) routes,
 * including آرشام پوینت مگ articles. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/mag`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/features`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    ...ARTICLES.map((a) => ({
      url: `${SITE_URL}/mag/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
