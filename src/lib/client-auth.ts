'use client'

import type { SupabaseClient } from '@supabase/supabase-js'

/* ─────────────────────────────────────────────────────────────
 * Mode-aware client auth + fetch wrapper.
 *
 * supabase mode (production):
 *   Auth via supabase-js in the browser (signUp / signInWithPassword),
 *   session persisted + auto-refreshed; every API call carries
 *   Authorization: Bearer <access_token>.
 *
 * local mode (demo):
 *   Cookie-based auth through the API routes.
 * ───────────────────────────────────────────────────────────── */

export interface SessionUser {
  id: string
  email: string
  name: string | null
}

export interface StatusInfo {
  mode: 'supabase' | 'local'
  ai: 'http' | 'sdk'
  aiModel: string
  ready: boolean
  hint: string
}

export const CLIENT_ENV_OK = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/* supabase-js is loaded lazily (~30KB gz) — in local demo mode it never
 * enters the initial bundle at all. */
let browser: SupabaseClient | null = null

export async function supabaseBrowser(): Promise<SupabaseClient> {
  if (!CLIENT_ENV_OK) throw new Error('Supabase در کلاینت پیکربندی نشده است.')
  if (!browser) {
    const { createClient } = await import('@supabase/supabase-js')
    browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    )
  }
  return browser
}

/* /api/status is immutable per deployment — resolve it once and
 * reuse the same promise across boot, account page and dialogs. */
let statusPromise: Promise<{
  mode: 'supabase' | 'local' | 'misconfigured'
  status?: StatusInfo
}> | null = null

/** Resolve the effective client mode (cached; one request per page load). */
export function resolveMode(): Promise<{
  mode: 'supabase' | 'local' | 'misconfigured'
  status?: StatusInfo
}> {
  if (!statusPromise) {
    statusPromise = (async () => {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' })
        const { status } = (await res.json()) as { status: StatusInfo }
        if (status.mode === 'supabase') {
          return CLIENT_ENV_OK ? { mode: 'supabase', status } : { mode: 'misconfigured', status }
        }
        return { mode: 'local', status }
      } catch {
        return { mode: CLIENT_ENV_OK ? 'supabase' : 'local' }
      }
    })()
  }
  return statusPromise
}

/* ── Friendly Persian messages for common Supabase auth errors ── */

function faAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'ایمیل یا رمز عبور اشتباه است.'
  if (m.includes('user already registered')) return 'این ایمیل قبلاً ثبت شده است. وارد شوید.'
  if (m.includes('email not confirmed')) return 'ایمیل شما تأیید نشده است. پوشه ایمیل خود را بررسی کنید.'
  if (m.includes('password should be at least')) return 'رمز عبور باید حداقل ۶ کاراکتر باشد.'
  if (m.includes('rate limit') || m.includes('too many requests'))
    return 'تعداد تلاش‌ها زیاد است؛ چند دقیقه بعد دوباره امتحان کنید.'
  if (m.includes('unable to validate email')) return 'ایمیل معتبر نیست.'
  if (m.includes('failed to fetch')) return 'اتصال به سرور Supabase برقرار نشد؛ آدرس و کلیدها را بررسی کنید.'
  return message
}

export type AuthOutcome =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string; needsEmailConfirm?: boolean }

function mapUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): SessionUser {
  const meta = u.user_metadata ?? {}
  const name =
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    null
  return { id: u.id, email: u.email ?? '', name }
}

export async function authLogin(email: string, password: string): Promise<AuthOutcome> {
  if (CLIENT_ENV_OK) {
    const sb = await supabaseBrowser()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: faAuthError(error.message) }
    if (!data.user) return { ok: false, error: 'ورود ناموفق بود.' }
    return { ok: true, user: mapUser(data.user) }
  }
  return postToApi('/api/auth/login', { email, password })
}

export async function authRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthOutcome> {
  if (CLIENT_ENV_OK) {
    const sb = await supabaseBrowser()
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name: name || undefined } },
    })
    if (error) return { ok: false, error: faAuthError(error.message) }
    if (!data.session) {
      // Project requires email confirmation
      return {
        ok: false,
        needsEmailConfirm: true,
        error: 'ثبت‌نام انجام شد. برای فعال‌سازی حساب، ایمیل تأیید را بررسی کنید.',
      }
    }
    if (!data.user) return { ok: false, error: 'ثبت‌نام ناموفق بود.' }
    return { ok: true, user: mapUser(data.user) }
  }
  return postToApi('/api/auth/register', { name: name || undefined, email, password })
}

async function postToApi(url: string, body: unknown): Promise<AuthOutcome> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: data?.error || 'خطایی رخ داد. دوباره تلاش کنید.' }
  return { ok: true, user: data.user as SessionUser }
}

export async function authLogout(): Promise<void> {
  if (CLIENT_ENV_OK) {
    try {
      const sb = await supabaseBrowser()
      await sb.auth.signOut()
    } catch {
      /* ignore */
    }
  }
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
}

/** Restore the session on page load (both modes). */
export async function restoreSession(): Promise<SessionUser | null> {
  if (CLIENT_ENV_OK) {
    const sb = await supabaseBrowser()
    const { data } = await sb.auth.getSession()
    if (!data.session) return null
    try {
      const res = await apiFetch('/api/auth/me')
      if (!res.ok) return null
      const d = await res.json()
      return (d?.user as SessionUser) ?? null
    } catch {
      return null
    }
  }
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    const d = await res.json()
    return (d?.user as SessionUser) ?? null
  } catch {
    return null
  }
}

/** fetch() that automatically carries the Supabase access token
 * (no-op header in local cookie mode). Always refreshes first if needed. */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (CLIENT_ENV_OK) {
    try {
      const sb = await supabaseBrowser()
      const { data } = await sb.auth.getSession()
      const token = data.session?.access_token
      if (token) headers.set('Authorization', `Bearer ${token}`)
    } catch {
      /* no session — request goes out unauthenticated */
    }
  }
  return fetch(input, { ...init, headers, cache: 'no-store' })
}
