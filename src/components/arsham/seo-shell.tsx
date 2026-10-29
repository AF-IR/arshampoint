import Link from 'next/link'
import {
  Sparkles, Home, HelpCircle, Info, Mail, Shield, FileText, Phone, Zap, BookOpen,
} from 'lucide-react'
import { BRAND, BRAND_EN, TAGLINE, CREATOR, FOOTER_KEYWORDS } from './content'
import { BrandMark, DomainChip } from './brand-logo'

/* ─────────────────────────────────────────────────────────────
 * Server-rendered chrome for the real SEO pages (/features, /faq, …).
 * No 'use client', no hooks — fully crawlable HTML with real <a> links.
 * The SPA header/footer (site-chrome.tsx) stays for hash-routes; this
 * twin mirrors its design so brand and navigation feel identical.
 * ───────────────────────────────────────────────────────────── */

const NAV = [
  { href: '/', label: 'خانه' },
  { href: '/features', label: 'امکانات' },
  { href: '/mag', label: 'مجله' },
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس با ما' },
]

const FOOTER_GROUPS: { title: string; items: { href: string; label: string; icon: React.ElementType }[] }[] = [
  {
    title: 'محصول',
    items: [
      { href: '/', label: 'خانه', icon: Home },
      { href: '/features', label: 'امکانات', icon: Sparkles },
      { href: '/faq', label: 'سوالات متداول', icon: HelpCircle },
    ],
  },
  {
    title: 'آرشام پوینت مگ',
    items: [
      { href: '/mag', label: 'همه مقاله‌ها', icon: BookOpen },
      { href: '/mag/persian-powerpoint-with-ai', label: 'ساخت پاورپوینت با هوش مصنوعی', icon: Sparkles },
      { href: '/mag/standard-presentation-structure', label: 'ساختار پرزنتیشن حرفه‌ای', icon: BookOpen },
    ],
  },
  {
    title: 'شرکت',
    items: [
      { href: '/about', label: 'درباره ما', icon: Info },
      { href: '/contact', label: 'تماس با ما', icon: Mail },
    ],
  },
  {
    title: 'قانونی',
    items: [
      { href: '/privacy', label: 'حریم خصوصی', icon: Shield },
      { href: '/terms', label: 'قوانین استفاده', icon: FileText },
    ],
  },
]

export function SeoHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0C10]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-16 flex items-center gap-3 px-5">
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label={`صفحه اصلی ${BRAND}`}>
          <BrandMark size={40} />
          <span className="text-right">
            <span className="flex items-center gap-1.5">
              <span className="block font-black leading-5">{BRAND}</span>
              <DomainChip />
            </span>
            <span className="block text-[11px] text-[#9AA0A6]">{TAGLINE}</span>
          </span>
        </Link>
        <nav
          className="hidden md:flex items-center gap-1 mx-auto overflow-x-auto"
          aria-label="ناوبری اصلی"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-xl text-sm font-bold text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block mr-auto">
          <Link
            href="/#/auth"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90"
          >
            <Zap className="w-4 h-4" /> شروع رایگان
          </Link>
        </div>
        {/* mobile: horizontally scrollable nav (server-safe, no JS) */}
        <nav
          className="md:hidden flex items-center gap-1 overflow-x-auto -mx-2 px-2"
          aria-label="ناوبری موبایل"
        >
          {NAV.slice(1).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#9AA0A6] hover:text-[#E8EAED] whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/#/auth"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#8AB4F8] whitespace-nowrap"
          >
            ورود
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SeoFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0A0B0E]" dir="rtl">
      <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-3">
          <Link href="/" className="flex items-center gap-3 w-fit" aria-label={`صفحه اصلی ${BRAND}`}>
            <BrandMark size={40} />
            <span className="text-right">
              <span className="flex items-center gap-1.5">
                <span className="block font-black leading-5">{BRAND}</span>
                <DomainChip />
              </span>
              <span className="block text-[11px] text-[#9AA0A6]">{TAGLINE}</span>
            </span>
          </Link>
          <p className="text-xs text-[#9AA0A6] leading-6">
            {BRAND} ابزار ساخت پرزنتیشن‌های HTML با هوش مصنوعی است؛ موضوع را بنویسید و ارائه آماده اجرا تحویل بگیرید.
          </p>
        </div>
        {FOOTER_GROUPS.map((g) => (
          <nav key={g.title} className="grid gap-2" aria-label={`پیوندهای ${g.title}`}>
            <p className="font-black text-sm mb-1">{g.title}</p>
            {g.items.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] w-fit"
              >
                <x.icon className="w-3.5 h-3.5 text-[#8AB4F8]" /> {x.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      {/* SEO keyword links — crawlable anchors for the core keyword family */}
      <div className="border-t border-white/5 px-5 py-4">
        <nav aria-label="کلیدواژه‌های پرجستجو" className="max-w-6xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-2 justify-center">
          {FOOTER_KEYWORDS.map((k) => (
            <Link key={k.href + k.label} href={k.href} className="text-[11px] text-[#9AA0A6] hover:text-[#8AB4F8] transition-colors">
              {k.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/5 px-5 py-4 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9AA0A6]">
        <span>
          © {new Date().getFullYear()} {BRAND} ({BRAND_EN}) — Apoint.ir — ساخته‌شده توسط{' '}
          <span className="text-[#E8EAED] font-bold">{CREATOR.name}</span> با موتور هوش مصنوعی آرشام پوینت
        </span>
        <span className="flex items-center gap-4">
          <a href={`mailto:${CREATOR.email}`} className="hover:text-[#E8EAED] flex items-center gap-1.5" dir="ltr">
            <Mail className="w-3.5 h-3.5 text-[#8AB4F8]" /> {CREATOR.email}
          </a>
          <a href={CREATOR.phoneHref} className="hover:text-[#E8EAED] flex items-center gap-1.5" dir="ltr">
            <Phone className="w-3.5 h-3.5 text-[#8AB4F8]" /> {CREATOR.phoneDisplay}
          </a>
        </span>
      </div>
    </footer>
  )
}

/* ── Page hero (H1 + lead) ── */
export function PageHero({
  kicker, title, lead,
}: { kicker: string; title: string; lead: string }) {
  return (
    <header className="text-center py-12 border-b border-white/5 mb-12">
      <p className="text-xs font-bold text-[#8AB4F8] bg-[#8AB4F8]/10 border border-[#8AB4F8]/25 rounded-full w-fit mx-auto px-3.5 py-1.5 mb-4">
        {kicker}
      </p>
      <h1 className="text-2xl sm:text-4xl font-black leading-relaxed max-w-3xl mx-auto">{title}</h1>
      <p className="text-sm text-[#9AA0A6] leading-8 max-w-2xl mx-auto mt-4">{lead}</p>
    </header>
  )
}

/* ── Prose container + heading helpers ── */
export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 text-sm leading-8 text-[#C7CBD1] max-w-3xl mx-auto pb-10">{children}</div>
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg sm:text-xl font-black text-[#E8EAED] pt-4">{children}</h2>
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-black text-[#E8EAED] pt-2">{children}</h3>
}

export function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-black text-[#8AB4F8] pt-1">{children}</h4>
}

/* ── Internal linking block (linked related pages) ── */
export function RelatedLinks({
  current,
  items,
}: {
  current: string
  items?: { href: string; label: string; desc: string }[]
}) {
  const links =
    items ??
    NAV.filter((n) => n.href !== '/' && n.href !== current).map((n) => ({
      href: n.href,
      label: n.label,
      desc: '',
    }))
  return (
    <section aria-label="بخش‌های مرتبط" className="max-w-3xl mx-auto pb-16">
      <h2 className="text-base font-black mb-4">بخش‌های مرتبط</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
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
}

/* ── JSON-LD helper (per-page structured data) ── */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function breadcrumbLd(SITE: string, name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: SITE },
      { '@type': 'ListItem', position: 2, name, item: `${SITE}${path}` },
    ],
  }
}
