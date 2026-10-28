'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useHashRoute, navigate, type Route } from '@/hooks/use-hash-route'
import { AppHeader, PublicHeader, SiteFooter } from '@/components/arsham/site-chrome'
import { SessionProvider, useSession } from '@/components/arsham/session'
import { BRAND, TAGLINE } from '@/components/arsham/content'
import { AuthView } from '@/components/zslide/auth-view'

/* ─────────────────────────────────────────────────────────────
 * Route table — hash-routed SPA with route-level code splitting.
 * Each view is a separate chunk fetched on demand, so the landing
 * page bundle stays small (dashboard, account and the six static
 * pages ship only when actually visited).
 * On Vercel these hash routes can map 1:1 to real paths.
 * ───────────────────────────────────────────────────────────── */

const PROTECTED = new Set<Route>(['app', 'presentations', 'account'])

const TITLES: Record<Route, string> = {
  '': `${BRAND} | ${TAGLINE}`,
  auth: 'ورود / ثبت‌نام',
  app: 'پنل من',
  presentations: 'ارائه‌های من',
  account: 'حساب من',
  about: 'درباره ما',
  features: 'امکانات',
  faq: 'سوالات متداول',
  privacy: 'حریم خصوصی',
  terms: 'قوانین استفاده',
  contact: 'تماس با ما',
}

function ViewLoading() {
  return (
    <main className="flex-1 grid place-items-center py-24" dir="rtl">
      <Loader2 className="w-6 h-6 animate-spin text-[#8AB4F8]" aria-label="بارگذاری" />
    </main>
  )
}

function FullLoading() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0B0C10]" dir="rtl">
      <Loader2 className="w-7 h-7 animate-spin text-[#8AB4F8]" aria-label="بارگذاری" />
    </div>
  )
}

/* heavy / less-frequent views load on demand */
const Landing = dynamic(() => import('@/components/arsham/landing').then((m) => m.Landing), { loading: ViewLoading })
const Dashboard = dynamic(() => import('@/components/arsham/dashboard').then((m) => m.Dashboard), { loading: ViewLoading })
const PresentationsPage = dynamic(() => import('@/components/arsham/dashboard').then((m) => m.PresentationsPage), { loading: ViewLoading })
const AccountPage = dynamic(() => import('@/components/arsham/account').then((m) => m.AccountPage), { loading: ViewLoading })
const AboutPage = dynamic(() => import('@/components/arsham/static-pages').then((m) => m.AboutPage), { loading: ViewLoading })
const FeaturesPage = dynamic(() => import('@/components/arsham/static-pages').then((m) => m.FeaturesPage), { loading: ViewLoading })
const FaqPage = dynamic(() => import('@/components/arsham/static-pages').then((m) => m.FaqPage), { loading: ViewLoading })
const PrivacyPage = dynamic(() => import('@/components/arsham/static-pages').then((m) => m.PrivacyPage), { loading: ViewLoading })
const TermsPage = dynamic(() => import('@/components/arsham/static-pages').then((m) => m.TermsPage), { loading: ViewLoading })
const ContactPage = dynamic(() => import('@/components/arsham/static-pages').then((m) => m.ContactPage), { loading: ViewLoading })

function BootScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0B0C10]" dir="rtl">
      <div className="flex flex-col items-center gap-4 text-[#9AA0A6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8AB4F8]" />
        <p className="text-sm font-bold">در حال بارگذاری آرشام پوینت…</p>
      </div>
    </div>
  )
}

function Shell() {
  const route = useHashRoute()
  const { phase, user, authMode, setUser, logout } = useSession()

  /* keep the browser tab title in sync with the active view */
  useEffect(() => {
    document.title = route === '' ? TITLES[''] : `${TITLES[route]} | ${BRAND}`
  }, [route])

  /* redirect protected routes to auth when signed out */
  useEffect(() => {
    if (phase === 'ready' && PROTECTED.has(route) && !user) {
      navigate('auth')
    }
  }, [phase, route, user])

  const authed = phase === 'ready' && !!user

  /* Protected routes wait for the session check… */
  if (phase === 'loading' && PROTECTED.has(route)) return <BootScreen />

  /* …while public routes render instantly — the landing content is
   * server-rendered and crawlable (SEO), the CTA upgrades after boot. */
  if (route === 'auth' || (phase === 'ready' && PROTECTED.has(route) && !user)) {
    return (
      <AuthView
        authMode={authMode}
        onAuthed={(u) => {
          setUser(u)
          navigate('app')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10]" dir="rtl">
      {authed && PROTECTED.has(route) ? (
        <AppHeader userName={user!.name || user!.email} onLogout={logout} />
      ) : (
        <PublicHeader authed={authed} />
      )}

      {route === '' && <Landing authed={authed} />}
      {route === 'features' && <FeaturesPage />}
      {route === 'faq' && <FaqPage />}
      {route === 'about' && <AboutPage />}
      {route === 'privacy' && <PrivacyPage />}
      {route === 'terms' && <TermsPage />}
      {route === 'contact' && <ContactPage />}

      {authed && route === 'app' && <Dashboard user={user!} />}
      {authed && route === 'presentations' && <PresentationsPage user={user!} />}
      {authed && route === 'account' && <AccountPage user={user!} />}

      <SiteFooter />
    </div>
  )
}

export default function HomePage() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  )
}
