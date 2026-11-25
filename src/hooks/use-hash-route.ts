'use client'

import { useSyncExternalStore } from 'react'

/* Tiny hash router — the sandbox preview only exposes the `/` route,
 * so multi-page navigation is implemented with hash fragments
 * (#/app, #/about, …). On a real deployment (Vercel) these can be
 * migrated to real paths without changing the view components. */

export type Route =
  | ''            // landing
  | 'auth'
  | 'app'         // dashboard: create + library
  | 'presentations'
  | 'account'
  | 'about'
  | 'features'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'contact'

const KNOWN: Route[] = [
  '', 'auth', 'app', 'presentations', 'account',
  'about', 'features', 'faq', 'privacy', 'terms', 'contact',
]

export function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
  return (KNOWN as string[]).includes(h) ? (h as Route) : ''
}

export function navigate(route: Route) {
  window.location.hash = route ? `#/${route}` : '#/'
  window.scrollTo({ top: 0 })
}

/* مثل navigate اما ورودی تاریخچه را «جایگزین» می‌کند نه اینکه یکی اضافه
 * کند — برای گذارهای ورود/خروج و ریدایرکت‌های گارد تا دکمه Back مرورگر
 * کاربر را به فرم لاگین یا مسیرهای مرده برنگرداند (شکایت «با بک می‌پره»). */
export function replaceNavigate(route: Route) {
  const hash = route ? `#/${route}` : '#/'
  if (window.location.hash === hash) return
  window.history.replaceState(null, '', hash)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  window.scrollTo({ top: 0 })
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, parseHash, () => '')
}
