import type { Metadata } from 'next'
import { BRAND, SITE_URL, CREATOR } from '@/components/arsham/content'

/* ─────────────────────────────────────────────────────────────
 * متادیتای استاندارد و کامل برای صفحات سئو — یک منبع واحد.
 *
 * چرا helper؟ Next.js متادیتا را «سطح اول» ادغام می‌کند: اگر صفحه
 * openGraph خودش را تعریف کند، شیء layout کاملاً جایگزین می‌شود و
 * فیلدهایی مثل og:site_name و og:locale و og:type از قلم می‌افتند.
 * این تابع تضمین می‌کند هر صفحه هر پنج بلوک را کامل داشته باشد:
 *   title/description · canonical · OpenGraph کامل · Twitter Card · robots
 * ───────────────────────────────────────────────────────────── */

interface SeoInput {
  /** عنوان صفحه (بدون پسوند برند — template در layout اضافه می‌کند) */
  title: string
  description: string
  /** مسیر صفحه مثل /features — canonical و og:url از همین ساخته می‌شود */
  path: string
  ogType?: 'website' | 'article'
  /** فقط برای ogType: 'article' — تاریخ انتشار ISO */
  publishedTime?: string
  keywords?: string[]
  /** متن کوتاه‌تر/تبلیغاتی‌تر مخصوص اشتراک‌گذاری (اختیاری — پیش‌فرض همان title/description) */
  ogTitle?: string
  ogDescription?: string
}

export function seoMetadata({
  title,
  description,
  path,
  ogType = 'website',
  publishedTime,
  keywords,
  ogTitle,
  ogDescription,
}: SeoInput): Metadata {
  const url = `${SITE_URL}${path === '/' ? '' : path}`
  const shareTitle = ogTitle ?? title
  const shareDescription = ogDescription ?? description
  const image = { url: '/og.png', width: 1200, height: 630, alt: `${BRAND} — ${shareTitle}` }

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: ogType,
      locale: 'fa_IR',
      siteName: BRAND,
      url,
      title: shareTitle,
      description: shareDescription,
      images: [image],
      ...(ogType === 'article' && publishedTime
        ? { publishedTime, authors: [CREATOR.name] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription,
      images: ['/og.png'],
    },
  }
}
