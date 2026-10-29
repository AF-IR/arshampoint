import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Clock, Quote, Lightbulb, Sparkles } from 'lucide-react'
import { SITE_URL, BRAND } from '@/components/arsham/content'
import { ARTICLES, getArticle, relatedArticles, MAG_NAME, type MagBlock } from '@/lib/mag'
import { SeoHeader, SeoFooter, JsonLd, breadcrumbLd } from '@/components/arsham/seo-shell'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return { title: 'مقاله یافت نشد' }
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/mag/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `${SITE_URL}/mag/${article.slug}`,
      publishedTime: article.date,
      authors: [BRAND],
      images: ['/og.png'],
    },
  }
}

/* ── Block renderer — semantic h2/h3 hierarchy for SEO ── */
function Block({ b }: { b: MagBlock }) {
  switch (b.kind) {
    case 'h2':
      return <h2 className="text-lg sm:text-xl font-black text-[#E8EAED] pt-6">{b.text}</h2>
    case 'h3':
      return <h3 className="text-base font-black text-[#E8EAED] pt-3">{b.text}</h3>
    case 'p':
      return <p className="leading-9 text-[#C7CBD1]">{b.text}</p>
    case 'list':
      return (
        <ul className="grid gap-3 leading-8 text-[#C7CBD1] list-disc pr-5 marker:text-[#8AB4F8]">
          {b.items.map((it, i) => (
            <li key={i} className="text-right">{it}</li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <ol className="grid gap-4">
          {b.items.map((s, i) => (
            <li key={i} className="rounded-2xl border border-white/10 bg-[#12141A] p-5">
              <p className="font-black text-sm text-[#8AB4F8] mb-1.5">{s.title}</p>
              <p className="text-sm leading-8 text-[#C7CBD1]">{s.text}</p>
            </li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <blockquote className="relative rounded-3xl border border-[#8AB4F8]/25 bg-[#8AB4F8]/[.06] p-6">
          <Quote className="w-6 h-6 text-[#8AB4F8] mb-3" aria-hidden />
          <p className="text-base sm:text-lg font-bold leading-9 text-[#E8EAED]">{b.text}</p>
          {b.by ? <footer className="text-xs text-[#9AA0A6] mt-3">— {b.by}</footer> : null}
        </blockquote>
      )
    case 'callout':
      return (
        <aside className="rounded-3xl border border-[#FFB75F]/30 bg-[#FFB75F]/[.07] p-6" role="note">
          <p className="flex items-center gap-2 font-black text-sm text-[#FFB75F] mb-2">
            <Lightbulb className="w-4 h-4" aria-hidden /> {b.title}
          </p>
          <p className="text-sm leading-8 text-[#C7CBD1]">{b.text}</p>
        </aside>
      )
    case 'links':
      return (
        <section aria-label={b.title} className="grid gap-3">
          <h2 className="text-base font-black text-[#E8EAED] pt-4">{b.title}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {b.items.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="group rounded-2xl border border-white/10 bg-[#12141A] p-4 hover:border-[#8AB4F8]/40 transition-colors"
              >
                <p className="font-bold text-sm text-[#8AB4F8] group-hover:underline">{l.label}</p>
                {l.desc ? <p className="text-xs text-[#9AA0A6] leading-6 mt-1">{l.desc}</p> : null}
              </Link>
            ))}
          </div>
        </section>
      )
    default:
      return null
  }
}

export default async function MagArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const related = relatedArticles(article)
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: 'fa-IR',
    keywords: article.keywords.join('، '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/mag/${article.slug}` },
    author: { '@type': 'Person', name: 'آرشام فاضل', email: 'arsham.fazel@gmail.com' },
    publisher: { '@type': 'Organization', name: BRAND, url: SITE_URL },
    wordCount: article.blocks.reduce(
      (n, b) => n + ('text' in b && typeof b.text === 'string' ? Math.ceil(b.text.length / 5) : 0),
      0,
    ),
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-5">
        {/* breadcrumb — crawlable internal links */}
        <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-xs text-[#9AA0A6] pt-8">
          <Link href="/" className="hover:text-[#8AB4F8]">خانه</Link>
          <span aria-hidden>/</span>
          <Link href="/mag" className="hover:text-[#8AB4F8]">{MAG_NAME}</Link>
          <span aria-hidden>/</span>
          <span className="text-[#C7CBD1] truncate max-w-60">{article.title}</span>
        </nav>

        <header className="py-8 border-b border-white/5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9AA0A6] mb-4">
            <span className="font-bold text-[#8AB4F8] bg-[#8AB4F8]/10 border border-[#8AB4F8]/25 rounded-full px-2.5 py-1">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readMinutes} دقیقه مطالعه
            </span>
            <span aria-hidden>•</span>
            <time dateTime={article.date}>{article.dateFa}</time>
          </div>
          <h1 className="text-xl sm:text-3xl font-black leading-[1.7]">{article.title}</h1>
          <p className="text-sm text-[#9AA0A6] leading-8 mt-4">{article.description}</p>
        </header>

        <article className="grid gap-5 text-sm leading-9 py-8">
          {article.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </article>

        {/* related articles — internal linking */}
        {related.length > 0 && (
          <section aria-label="مقالات مرتبط" className="pb-10">
            <h2 className="text-base font-black mb-4">مقالات مرتبط در {MAG_NAME}</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/mag/${r.slug}`}
                  className="group rounded-2xl border border-white/10 bg-[#12141A] p-4 hover:border-[#8AB4F8]/40 transition-colors"
                >
                  <p className="font-bold text-xs text-[#8AB4F8] group-hover:underline leading-6">{r.title}</p>
                  <p className="text-[11px] text-[#9AA0A6] leading-6 mt-1.5 line-clamp-2">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-3xl mx-auto pb-16">
          <div className="rounded-3xl border border-[#8AB4F8]/25 p-8 text-center" style={{ background: 'radial-gradient(480px 220px at 50% -60%, rgba(138,180,248,.18), transparent 70%), #101319' }}>
            <Sparkles className="w-8 h-8 mx-auto text-[#8AB4F8] mb-3" />
            <h2 className="text-lg font-black">همین حالا پاورپوینت‌تان را با هوش مصنوعی بسازید</h2>
            <p className="text-sm text-[#9AA0A6] mt-2 leading-7">
              موضوع را بنویسید؛ آرشام پوینت در چند ثانیه پرزنتیشن فارسی و راست‌چین تحویل می‌دهد.
            </p>
            <Link
              href="/#/auth"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90 mt-5"
            >
              <Sparkles className="w-4 h-4" /> شروع رایگان
            </Link>
          </div>
          <div className="text-center mt-6">
            <Link href="/mag" className="inline-flex items-center gap-2 text-sm font-bold text-[#8AB4F8] hover:underline">
              <ArrowRight className="w-4 h-4" /> بازگشت به {MAG_NAME}
            </Link>
          </div>
        </section>
      </main>
      <SeoFooter />
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd(SITE_URL, article.title, `/mag/${article.slug}`)} />
    </div>
  )
}
