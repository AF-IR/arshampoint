import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, Sparkles } from 'lucide-react'
import { SITE_URL, BRAND, MAG_SEO_INTRO } from '@/components/arsham/content'
import { ARTICLES, MAG_NAME, MAG_TAGLINE } from '@/lib/mag'
import { SeoHeader, SeoFooter, JsonLd, breadcrumbLd } from '@/components/arsham/seo-shell'

export const metadata: Metadata = {
  title: `${MAG_NAME} — آموزش ساخت پاورپوینت و ارائه`,
  description:
    'آرشام پوینت مگ؛ مجله تخصصی ساخت پاورپوینت فارسی با هوش مصنوعی: راهنمای گام‌به‌گام، مقایسه ابزارهای آنلاین و آفلاین، نکات ارائه حرفه‌ای و ساختار استاندارد اسلایدها.',
  alternates: { canonical: '/mag' },
  openGraph: {
    type: 'website',
    title: `${MAG_NAME} — آموزش ساخت پاورپوینت و ارائه`,
    description: MAG_TAGLINE,
    url: `${SITE_URL}/mag`,
    images: ['/og.png'],
  },
}

export default function MagIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: MAG_NAME,
    url: `${SITE_URL}/mag`,
    inLanguage: 'fa-IR',
    description: MAG_TAGLINE,
    publisher: { '@type': 'Organization', name: BRAND, url: SITE_URL },
    blogPost: ARTICLES.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.description,
      datePublished: a.date,
      url: `${SITE_URL}/mag/${a.slug}`,
      keywords: a.keywords.join('، '),
      inLanguage: 'fa-IR',
    })),
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <header className="text-center py-12 border-b border-white/5">
          <p className="text-xs font-bold text-[#8AB4F8] bg-[#8AB4F8]/10 border border-[#8AB4F8]/25 rounded-full w-fit mx-auto px-3.5 py-1.5 mb-4">
            <BookOpen className="inline w-3.5 h-3.5 ml-1 -mt-0.5" /> {MAG_NAME}
          </p>
          <h1 className="text-2xl sm:text-4xl font-black leading-relaxed max-w-3xl mx-auto">
            {MAG_TAGLINE}
          </h1>
          <p className="text-sm text-[#9AA0A6] leading-8 max-w-2xl mx-auto mt-4">
            {MAG_SEO_INTRO}
          </p>
        </header>

        <section aria-label="فهرست مقالات" className="py-10">
          <div className="grid gap-5 md:grid-cols-2">
            {ARTICLES.map((a) => (
              <article key={a.slug} className="group h-full">
                <Link
                  href={`/mag/${a.slug}`}
                  className="block h-full rounded-3xl border border-white/10 bg-[#12141A] p-6 hover:border-[#8AB4F8]/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9AA0A6] mb-3">
                    <span className="font-bold text-[#8AB4F8] bg-[#8AB4F8]/10 border border-[#8AB4F8]/25 rounded-full px-2.5 py-1">
                      {a.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.readMinutes} دقیقه مطالعه
                    </span>
                    <span aria-hidden>•</span>
                    <span>{a.dateFa}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black leading-8 group-hover:text-[#8AB4F8] transition-colors">
                    {a.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9AA0A6] leading-7 mt-2 line-clamp-3">
                    {a.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8AB4F8] mt-4">
                    ادامه مطلب <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </span>
                  {/* crawled keyword context */}
                  <p className="sr-only">کلیدواژه‌ها: {a.keywords.join('، ')}</p>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto pb-16">
          <div className="rounded-3xl border border-[#8AB4F8]/25 p-8 text-center" style={{ background: 'radial-gradient(480px 220px at 50% -60%, rgba(138,180,248,.18), transparent 70%), #101319' }}>
            <Sparkles className="w-8 h-8 mx-auto text-[#8AB4F8] mb-3" />
            <h2 className="text-lg sm:text-xl font-black">مقاله خواندید؟ حالا ارائه‌تان را بسازید</h2>
            <p className="text-sm text-[#9AA0A6] mt-2 leading-7">
              ساخت پاورپوینت فارسی با هوش مصنوعی در آرشام پوینت کمتر از یک دقیقه طول می‌کشد.
            </p>
            <Link
              href="/#/auth"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90 mt-5"
            >
              <Sparkles className="w-4 h-4" /> شروع رایگان
            </Link>
          </div>
        </section>
      </main>
      <SeoFooter />
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd(SITE_URL, MAG_NAME, '/mag')} />
    </div>
  )
}
