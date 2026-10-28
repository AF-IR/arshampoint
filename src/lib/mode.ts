/* ─────────────────────────────────────────────────────────────
 * Runtime mode detection
 *
 * The app runs in one of two modes, chosen automatically from env:
 *
 *  1) "supabase" — PRODUCTION (works on Vercel)
 *     Requires: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *               SUPABASE_SERVICE_ROLE_KEY
 *     Auth    : Supabase Auth (email/password, verified JWT)
 *     Data    : Supabase Postgres table `presentations`
 *
 *  2) "local" — DEMO / offline sandbox fallback
 *     Auth    : local users table (scrypt) + signed httpOnly cookie
 *     Data    : local Prisma/SQLite database
 * ───────────────────────────────────────────────────────────── */

export type AppMode = 'supabase' | 'local'
export type AiMode = 'http' | 'sdk'

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function getAppMode(): AppMode {
  return supabaseConfigured() ? 'supabase' : 'local'
}

/* AI provider: if a real Z.ai API key is configured (Vercel production),
 * call the OpenAI-compatible Z.ai endpoint; otherwise use the bundled
 * z-ai-web-dev-sdk (zero-config, sandbox/dev environment). */
export function aiMode(): AiMode {
  return process.env.ZAI_API_KEY ? 'http' : 'sdk'
}

export const ZAI_HTTP_BASE =
  process.env.ZAI_BASE_URL || 'https://api.z.ai/api/paas/v4'
export const ZAI_HTTP_MODEL = process.env.ZAI_MODEL || 'glm-4.6'

export interface StatusInfo {
  mode: AppMode
  ai: AiMode
  aiModel: string
  ready: boolean // can generate presentations end-to-end
  hint: string
}

export function getStatus(): StatusInfo {
  const mode = getAppMode()
  const ai = aiMode()
  const ready = mode === 'supabase' || ai === 'sdk'
  const hint =
    mode === 'supabase'
      ? 'حالت پروداکشن: احراز هویت و دیتابیس از طریق Supabase فعال است.'
      : ai === 'sdk'
        ? 'حالت دموی محلی: برای نسخه اصلی، متغیرهای Supabase را در تنظیمات محیط تنظیم کنید.'
        : 'پیکربندی ناقص است: متغیرهای Supabase یا ZAI_API_KEY لازم است.'
  return { mode, ai, aiModel: ZAI_HTTP_MODEL, ready, hint }
}
