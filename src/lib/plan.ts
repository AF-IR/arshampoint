import { getAppMode } from '@/lib/mode'

/* ─────────────────────────────────────────────────────────────
 * Plans & quota — the commercial core of آرشام پوینت.
 *
 *  free : FREE_DAILY_QUOTA presentations per rolling 24-hour day
 *         (روزانه تا سقف ۳ ارائه — بدون وابستگی به ماه میلادی),
 *         branding credit kept inside the generated HTML
 *  pro  : unlimited presentations, branding removed from output;
 *         هر دوره اشتراک دقیقاً ۳۰ روز است (نه یک ماه تقویمی)
 *
 * A pro subscription = one row in `subscriptions`
 *   (Supabase table / Prisma model) with status 'active' and
 *   period_end in the future. Works in BOTH runtime modes:
 *   - supabase → service-role client (bypasses RLS)
 *   - local    → Prisma/SQLite
 * Any error degrades gracefully to 'free' so generation never breaks.
 * ───────────────────────────────────────────────────────────── */

export type PlanId = 'free' | 'pro'

/** سهمیه روزانه پلن رایگان — در هر ۲۴ ساعت (قابل تنظیم با متغیر محیطی) */
export const FREE_DAILY_QUOTA = Math.max(
  1,
  Number(process.env.FREE_DAILY_QUOTA ?? 3) || 3
)

/** طول هر دوره اشتراک حرفه‌ای به روز — دقیقاً ۳۰ روز تقویمی، نه ماه میلادی */
export const PRO_PERIOD_DAYS = Math.max(
  7,
  Number(process.env.PRO_PERIOD_DAYS ?? 30) || 30
)

const DAY_MS = 24 * 60 * 60 * 1000

export interface UsageInfo {
  plan: PlanId
  /** free: تعداد ارائه‌های ۲۴ ساعت گذشته */
  used: number
  /** 0 = نامحدود */
  quota: number
  /** -1 وقتی نامحدود است */
  remaining: number
  unlimited: boolean
  /** پایان دوره اشتراک حرفه‌ای (برای نمایش در صفحه حساب) */
  periodEnd?: string | null
  /** اگر سهمیه روزانه پر شده باشد، نزدیک‌ترین زمانی که یک اسلات آزاد می‌شود */
  nextFreeAt?: string | null
}

export interface SubscriptionRow {
  plan: string
  status: string
  periodEnd: string | null
}

/* ── Readers ── */

async function readActiveSubscription(userId: string): Promise<SubscriptionRow | null> {
  try {
    if (getAppMode() === 'supabase') {
      const { supabaseAdmin } = await import('@/lib/supabase-server')
      const { data, error } = await supabaseAdmin()
        .from('subscriptions')
        .select('plan, status, period_end')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error || !data) return null
      return {
        plan: String(data.plan ?? 'pro'),
        status: String(data.status ?? 'active'),
        periodEnd: (data.period_end as string | null) ?? null,
      }
    }
    const { db } = await import('@/lib/db')
    const row = await db.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    })
    if (!row) return null
    return { plan: row.plan, status: row.status, periodEnd: row.periodEnd?.toISOString() ?? null }
  } catch {
    /* جدول هنوز ساخته نشده یا خطای گذرا → پلن رایگان */
    return null
  }
}

function subscriptionIsLive(sub: SubscriptionRow | null): boolean {
  if (!sub || sub.status !== 'active') return false
  if (sub.periodEnd) {
    const end = new Date(sub.periodEnd).getTime()
    if (Number.isFinite(end) && end < Date.now()) return false
  }
  return sub.plan === 'pro'
}

export async function getPlan(userId: string): Promise<PlanId> {
  const sub = await readActiveSubscription(userId)
  return subscriptionIsLive(sub) ? 'pro' : 'free'
}

/* ── Daily usage — پنجره لغزان ۲۴ ساعت گذشته (مستقل از تقویم) ── */

async function dailyUsage(userId: string): Promise<number> {
  const since = new Date(Date.now() - DAY_MS)
  try {
    if (getAppMode() === 'supabase') {
      const { supabaseAdmin } = await import('@/lib/supabase-server')
      const { count, error } = await supabaseAdmin()
        .from('presentations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
      if (error) return 0
      return count ?? 0
    }
    const { db } = await import('@/lib/db')
    return await db.presentation.count({
      where: { userId, createdAt: { gte: since } },
    })
  } catch {
    return 0
  }
}

/** قدیمی‌ترین ارائه داخل پنجره ۲۴ ساعته → زمان آزاد شدن بعدی اسلات */
async function oldestUsageInWindow(userId: string): Promise<Date | null> {
  const since = new Date(Date.now() - DAY_MS)
  try {
    if (getAppMode() === 'supabase') {
      const { supabaseAdmin } = await import('@/lib/supabase-server')
      const { data, error } = await supabaseAdmin()
        .from('presentations')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error || !data?.created_at) return null
      return new Date(String(data.created_at))
    }
    const { db } = await import('@/lib/db')
    const row = await db.presentation.findFirst({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })
    return row?.createdAt ?? null
  } catch {
    return null
  }
}

export async function getUsage(userId: string): Promise<UsageInfo> {
  const plan = await getPlan(userId)
  if (plan === 'pro') {
    const sub = await readActiveSubscription(userId)
    return {
      plan,
      used: 0,
      quota: 0,
      remaining: -1,
      unlimited: true,
      periodEnd: sub?.periodEnd ?? null,
    }
  }
  const used = await dailyUsage(userId)
  const usage: UsageInfo = {
    plan,
    used,
    quota: FREE_DAILY_QUOTA,
    remaining: Math.max(0, FREE_DAILY_QUOTA - used),
    unlimited: false,
    nextFreeAt: null,
  }
  if (used >= FREE_DAILY_QUOTA) {
    const oldest = await oldestUsageInWindow(userId)
    if (oldest) usage.nextFreeAt = new Date(oldest.getTime() + DAY_MS).toISOString()
  }
  return usage
}

/* ── Writers ── */

/**
 * فعال‌سازی اشتراک حرفه‌ای برای periods دوره — هر دوره دقیقاً ۳۰ روز
 * (PRO_PERIOD_DAYS × ۲۴ ساعت) است؛ از ماه میلادی استفاده نمی‌کنیم.
 */
export async function activatePro(
  userId: string,
  periods = 1,
  source = 'zarinpal'
): Promise<void> {
  const periodEnd = new Date(Date.now() + periods * PRO_PERIOD_DAYS * DAY_MS)
  if (getAppMode() === 'supabase') {
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    /* ابتدا اشتراک‌های قبلی غیرفعال می‌شوند تا همیشه یک ردیف فعال داشته باشیم */
    await supabaseAdmin()
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active')
    const { error } = await supabaseAdmin().from('subscriptions').insert({
      user_id: userId,
      plan: 'pro',
      status: 'active',
      source,
      period_end: periodEnd.toISOString(),
    })
    if (error) throw new Error('ثبت اشتراک در Supabase ناموفق بود.')
    return
  }
  const { db } = await import('@/lib/db')
  await db.subscription.updateMany({
    where: { userId, status: 'active' },
    data: { status: 'expired' },
  })
  await db.subscription.create({
    data: {
      userId,
      plan: 'pro',
      status: 'active',
      source,
      periodEnd,
    },
  })
}

/* ── Persian copy for quota errors ── */

const toFa = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

export function quotaExceededMessage(usage: UsageInfo): string {
  return `سهمیه روزانه پلن رایگان (${toFa(usage.quota)} ارائه در هر ۲۴ ساعت) تمام شد. هر روز ${toFa(usage.quota)} ارائه تازه در اختیار دارید؛ با ارتقا به پلن حرفه‌ای هم ارائه نامحدود بسازید و هم نشان برند از خروجی حذف می‌شود.`
}
