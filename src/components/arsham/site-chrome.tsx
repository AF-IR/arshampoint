'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Presentation, Menu, X, Sparkles, BookOpen, HelpCircle, Home,
  Info, Shield, FileText, Mail, UserCircle2, LayoutDashboard, LogOut,
} from 'lucide-react'
import { BRAND, TAGLINE, SUPPORT_EMAIL } from './content'
import { navigate, type Route } from '@/hooks/use-hash-route'

/* ── Navigation model ── */

export const PUBLIC_NAV: { route: Route; label: string }[] = [
  { route: '', label: 'خانه' },
  { route: 'features', label: 'امکانات' },
  { route: 'faq', label: 'سوالات متداول' },
  { route: 'about', label: 'درباره ما' },
  { route: 'contact', label: 'تماس' },
]

export const APP_NAV: { route: Route; label: string; icon: React.ElementType }[] = [
  { route: 'app', label: 'پنل من', icon: LayoutDashboard },
  { route: 'presentations', label: 'ارائه‌های من', icon: BookOpen },
  { route: 'account', label: 'حساب من', icon: UserCircle2 },
]

/* ── Brand logo ── */

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-xl'
  const icon = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  return (
    <button
      onClick={() => navigate('')}
      className="flex items-center gap-3 shrink-0"
      aria-label={`صفحه اصلی ${BRAND}`}
    >
      <span className={`grid place-items-center ${box} bg-gradient-to-bl from-[#8AB4F8] to-[#4285F4] text-[#0B0C0F]`}>
        <Presentation className={icon} />
      </span>
      <span className="text-right">
        <span className={`block font-black leading-5 ${size === 'lg' ? 'text-xl' : ''}`}>{BRAND}</span>
        <span className="block text-[11px] text-[#9AA0A6]">{TAGLINE}</span>
      </span>
    </button>
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
            <button
              key={n.route}
              onClick={() => { setOpen(false); navigate(n.route) }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#E8EAED] hover:bg-white/5 text-right"
            >
              <Home className="w-4 h-4 text-[#8AB4F8]" /> {n.label}
            </button>
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
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0A0B0E]" dir="rtl">
      <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-3">
          <Logo />
          <p className="text-xs text-[#9AA0A6] leading-6">
            {BRAND} ابزار ساخت پرزنتیشن‌های HTML با هوش مصنوعی است؛ موضوع را بنویسید و ارائه آماده اجرا تحویل بگیرید.
          </p>
        </div>
        <nav className="grid gap-2" aria-label="پیوندهای محصول">
          <p className="font-black text-sm mb-1">محصول</p>
          {[
            { r: '' as Route, l: 'خانه', i: Home },
            { r: 'features' as Route, l: 'امکانات', i: Sparkles },
            { r: 'faq' as Route, l: 'سوالات متداول', i: HelpCircle },
          ].map((x) => (
            <button key={x.r} onClick={() => navigate(x.r)} className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] text-right">
              <x.i className="w-3.5 h-3.5 text-[#8AB4F8]" /> {x.l}
            </button>
          ))}
        </nav>
        <nav className="grid gap-2" aria-label="پیوندهای سازمانی">
          <p className="font-black text-sm mb-1">شرکت</p>
          {[
            { r: 'about' as Route, l: 'درباره ما', i: Info },
            { r: 'contact' as Route, l: 'تماس با ما', i: Mail },
          ].map((x) => (
            <button key={x.r} onClick={() => navigate(x.r)} className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] text-right">
              <x.i className="w-3.5 h-3.5 text-[#8AB4F8]" /> {x.l}
            </button>
          ))}
        </nav>
        <nav className="grid gap-2" aria-label="پیوندهای قانونی">
          <p className="font-black text-sm mb-1">قانونی</p>
          {[
            { r: 'privacy' as Route, l: 'حریم خصوصی', i: Shield },
            { r: 'terms' as Route, l: 'قوانین استفاده', i: FileText },
          ].map((x) => (
            <button key={x.r} onClick={() => navigate(x.r)} className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] text-right">
              <x.i className="w-3.5 h-3.5 text-[#8AB4F8]" /> {x.l}
            </button>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-[11px] text-[#9AA0A6]">
        © {new Date().getFullYear()} {BRAND} ({BRAND && 'Arsham Point'}) — ساخته‌شده با Next.js، Supabase و هوش مصنوعی Z.ai
        {' · '}
        <span dir="ltr">{SUPPORT_EMAIL}</span>
      </div>
    </footer>
  )
}
