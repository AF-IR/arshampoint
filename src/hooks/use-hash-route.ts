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

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, parseHash, () => '')
}
