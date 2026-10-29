'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Menu, X, Sparkles, BookOpen, HelpCircle, Home,
  Info, Shield, FileText, Mail, Phone, UserCircle2, LayoutDashboard, LogOut,
} from 'lucide-react'
import { BRAND, BRAND_EN, TAGLINE, CREATOR, FOOTER_KEYWORDS } from './content'
import { BrandMark, DomainChip } from './brand-logo'
import { navigate, type Route } from '@/hooks/use-hash-route'

/* ── Navigation model ──
 * Public pages are REAL server-rendered routes (/features, /faq, …)
 * so crawlers see crawlable <a href> links; app routes stay hash-based. */

export const PUBLIC_NAV: { href: string; label: string }[] = [
  { href: '/', label: 'خانه' },
  { href: '/features', label: 'امکانات' },
  { href: '/mag', label: 'مجله' },
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس' },
]

export const APP_NAV: { route: Route; label: string; icon: React.ElementType }[] = [
  { route: 'app', label: 'پنل من', icon: LayoutDashboard },
  { route: 'presentations', label: 'ارائه‌های من', icon: BookOpen },
  { route: 'account', label: 'حساب من', icon: UserCircle2 },
]

/* ── Brand logo (real link to home) ── */

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 shrink-0"
      aria-label={`صفحه اصلی ${BRAND}`}
    >
      <BrandMark size={size === 'lg' ? 48 : 40} />
      <span className="text-right">
        <span className="flex items-center gap-1.5">
          <span className={`block font-black leading-5 ${size === 'lg' ? 'text-xl' : ''}`}>{BRAND}</span>
          <DomainChip />
        </span>
        <span className="block text-[11px] text-[#9AA0A6]">{TAGLINE}</span>
      </span>
    </Link>
  )
}

/* ── Public header (landing + static pages) ── */

export function PublicHeader({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#0B0C10]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full flex items-center gap-3 px-5">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 mx-auto" aria-label="ناوبری اصلی">
          {PUBLIC_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-xl text-sm font-bold text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-white/5 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2 mr-auto">
          {authed ? (
            <Button size="sm" onClick={() => navigate('app')} className="h-9 font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90">
              <LayoutDashboard className="w-4 h-4 ml-1" /> پنل من
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => navigate('auth')} className="h-9 border-white/15 bg-white/5 hover:bg-white/10 font-bold">
                ورود
              </Button>
              <Button size="sm" onClick={() => navigate('auth')} className="h-9 font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90">
                <Sparkles className="w-4 h-4 ml-1" /> شروع رایگان
              </Button>
            </>
          )}
        </div>
        <button
          className="md:hidden grid place-items-center w-10 h-10 rounded-xl border border-white/10 bg-white/5"
          onClick={() => setOpen((o) => !o)}
          aria-label="منو"
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0E1015] px-5 py-4 grid gap-1">
          {PUBLIC_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#E8EAED] hover:bg-white/5 text-right"
            >
              <Home className="w-4 h-4 text-[#8AB4F8]" /> {n.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-white/10">
            <Button
              size="sm"
              className="w-full h-10 font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F]"
              onClick={() => { setOpen(false); navigate('auth') }}
            >
              {authed ? 'پنل من' : 'ورود / ثبت‌نام'}
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

/* ── App header (authed pages) ── */

export function AppHeader({
  userName,
  onLogout,
}: {
  userName: string
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#0B0C10]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full flex items-center gap-3 px-5">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 mx-auto" aria-label="ناوبری پنل">
          {APP_NAV.map((n) => (
            <button
              key={n.route}
              onClick={() => navigate(n.route)}
              className="px-3 py-2 rounded-xl text-sm font-bold text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-white/5 transition-colors"
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2 mr-auto">
          <span className="text-xs text-[#9AA0A6] bg-white/5 border border-white/10 rounded-full px-3 py-1.5 truncate max-w-40" dir="ltr">
            {userName}
          </span>
          <Button size="sm" variant="outline" onClick={onLogout} className="h-9 border-white/15 bg-white/5 hover:bg-white/10 font-bold">
            <LogOut className="w-4 h-4 ml-1" /> خروج
          </Button>
        </div>
        <button
          className="md:hidden grid place-items-center w-10 h-10 rounded-xl border border-white/10 bg-white/5"
          onClick={() => setOpen((o) => !o)}
          aria-label="منو"
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0E1015] px-5 py-4 grid gap-1">
          {APP_NAV.map((n) => (
            <button
              key={n.route}
              onClick={() => { setOpen(false); navigate(n.route) }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#E8EAED] hover:bg-white/5 text-right"
            >
              <n.icon className="w-4 h-4 text-[#8AB4F8]" /> {n.label}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#F28B82] hover:bg-[#F28B82]/10 text-right"
          >
            <LogOut className="w-4 h-4" /> خروج از حساب
          </button>
        </div>
      )}
    </header>
  )
}

/* ── Footer (shared) ── */

export function SiteFooter() {
  const groups: { title: string; items: { href: string; label: string; icon: React.ElementType }[] }[] = [
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
        { href: '/mag/student-presentation-with-ai', label: 'ارائه دانشجویی', icon: BookOpen },
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

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0A0B0E]" dir="rtl">
      <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-3">
          <Logo />
          <p className="text-xs text-[#9AA0A6] leading-6">
            {BRAND} ابزار ساخت پرزنتیشن‌های HTML با هوش مصنوعی است؛ موضوع را بنویسید و ارائه آماده اجرا تحویل بگیرید.
          </p>
          {/* contact info — mailto/tel are crawlable, semantic links */}
          <div className="grid gap-1.5 mt-1">
            <a href={`mailto:${CREATOR.email}`} className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] w-fit" dir="ltr">
              <Mail className="w-3.5 h-3.5 text-[#8AB4F8]" /> {CREATOR.email}
            </a>
            <a href={CREATOR.phoneHref} className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] w-fit" dir="ltr">
              <Phone className="w-3.5 h-3.5 text-[#8AB4F8]" /> {CREATOR.phoneDisplay}
            </a>
          </div>
        </div>
        {groups.map((g) => (
          <nav key={g.title} className="grid gap-2" aria-label={`پیوندهای ${g.title}`}>
            <p className="font-black text-sm mb-1">{g.title}</p>
            {g.items.map((x) => (
              <Link key={x.href} href={x.href} className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] w-fit">
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
      <div className="border-t border-white/5 py-4 px-5 text-center text-[11px] text-[#9AA0A6] leading-6">
        © {new Date().getFullYear()} {BRAND} ({BRAND_EN}) — Apoint.ir — ساخته‌شده توسط{' '}
        <Link href="/about" className="text-[#E8EAED] font-bold hover:text-[#8AB4F8]">{CREATOR.name}</Link>
        {' '}با Next.js، Supabase و موتور هوش مصنوعی آرشام پوینت
      </div>
    </footer>
  )
}
