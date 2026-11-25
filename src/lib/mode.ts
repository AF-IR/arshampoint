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

/* ── استخر کلیدهای سرویس هوش مصنوعی ──
 * ZAI_API_KEY می‌تواند یک کلید باشد یا چند کلید که با پرانتز از هم جدا
 * شده‌اند — تیم‌های همزمان (چند نفر روی یک استقرار) را پوشش می‌دهد:
 *   ZAI_API_KEY="(کلید اول)(کلید دوم)(کلید سوم)"
 * جداکننده‌های ویرگول / خط جدید / خط عمودی هم پذیرفته می‌شود.
 * هر فراخوانی از یک کلیدِ «رندوم» شروع می‌کند و اگر کلیدی خطای سهمیه یا
 * محدودیت نرخ داد، کلید بعدی امتحان می‌شود (در deck-ai.ts). */
export function aiApiKeys(): string[] {
  const raw = (process.env.ZAI_API_KEY ?? '').trim()
  if (!raw) return []
  let keys: string[]
  if (raw.includes('(')) {
    keys = [...raw.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim())
    if (!keys.length) keys = raw.split(/[\s,|]+/).map((k) => k.replace(/[()]/g, '').trim())
  } else {
    keys = raw.split(/[,|\n]/)
  }
  const cleaned = keys.map((k) => k.trim()).filter((k) => k.length >= 16)
  return [...new Set(cleaned)]
}

/* AI provider: if at least one real API key is configured (Vercel production),
 * call the OpenAI-compatible HTTP endpoint; otherwise use the bundled
 * z-ai-web-dev-sdk (zero-config, sandbox/dev environment). */
export function aiMode(): AiMode {
  return aiApiKeys().length > 0 ? 'http' : 'sdk'
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
  const keyCount = aiApiKeys().length
  const hint =
    mode === 'supabase'
      ? `حالت پروداکشن: احراز هویت و دیتابیس از طریق Supabase فعال است.${keyCount > 1 ? ` استخر ${keyCount} کلیدی موتور هوش مصنوعی هم فعال است.` : ''}`
      : ai === 'sdk'
        ? 'حالت دموی محلی: برای نسخه اصلی، متغیرهای Supabase را در تنظیمات محیط تنظیم کنید.'
        : 'پیکربندی ناقص است: متغیرهای Supabase یا کلید سرویس هوش مصنوعی لازم است.'
  return { mode, ai, aiModel: ZAI_HTTP_MODEL, ready, hint }
}
