import type { MetadataRoute } from 'next'
import { BRAND, TAGLINE, DESCRIPTION } from '@/components/arsham/content'

/* PWA manifest — installable app + better mobile/SEO signals. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} | ${TAGLINE}`,
    short_name: BRAND,
    description: DESCRIPTION,
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0C10',
    theme_color: '#0B0C10',
    lang: 'fa-IR',
    dir: 'rtl',
    orientation: 'any',
    categories: ['productivity', 'business', 'education'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
