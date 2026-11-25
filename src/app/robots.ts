import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/components/arsham/content'

/* robots.txt داینامیک — همیشه به دامنه فعلی (apoint.ir یا پیش‌نمایش
 * vercel.app) اشاره می‌کند؛ نسخه استاتیک قبلی دامنه را هاردکد کرده بود. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
