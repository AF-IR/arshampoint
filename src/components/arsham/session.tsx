'use client'

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react'
import { useToast } from '@/hooks/use-toast'
import { navigate } from '@/hooks/use-hash-route'
import {
  authLogout, resolveMode, restoreSession,
  type SessionUser, type StatusInfo,
} from '@/lib/client-auth'

/* ─────────────────────────────────────────────────────────────
 * Central session state for the whole app (boot, login, logout,
 * status badge). Replaces prop-drilling and duplicate /api/status
 * fetches: mode + session are resolved once, in parallel, and
 * every view (dashboard, account, dialogs) reads from here.
 * ───────────────────────────────────────────────────────────── */

interface SessionContextValue {
  phase: 'loading' | 'ready'
  user: SessionUser | null
  status: StatusInfo | null
  authMode: 'supabase' | 'local'
  setUser: (u: SessionUser | null) => void
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<StatusInfo | null>(null)
  const [authMode, setAuthMode] = useState<'supabase' | 'local'>('local')
  const { toast } = useToast()

  useEffect(() => {
    let alive = true
    /* mode and session resolve in parallel — saves a round-trip at boot */
    Promise.all([resolveMode(), restoreSession()]).then(([mode, u]) => {
      if (!alive) return
      setStatus(mode.status ?? null)
      setAuthMode(mode.mode === 'supabase' ? 'supabase' : 'local')
      setUser(u)
      setPhase('ready')
    })
    return () => {
      alive = false
    }
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
    toast({ title: 'خروج انجام شد', description: 'به امید دیدار دوباره!' })
    navigate('')
  }, [toast])

  const value = useMemo<SessionContextValue>(
    () => ({ phase, user, status, authMode, setUser, logout }),
    [phase, user, status, authMode, logout],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession باید داخل SessionProvider استفاده شود.')
  return ctx
}
