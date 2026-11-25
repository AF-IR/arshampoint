/* ─────────────────────────────────────────────────────────────
 * سقف تعداد اسلاید بر اساس پلن — ماژول خالص (بدون هیچ import).
 * هم سمت سرور (گیت API) و هم سمت کلاینت (اسلایدر فرم) از این
 * ثابت‌ها استفاده می‌کنند تا همیشه هم‌نسخه باشند.
 *
 *   free : ۱ تا ۱۰ اسلاید
 *   pro  : ۱ تا ۱۴ اسلاید (اشتراک فعال ۳۰ روزه — Supabase + زرین‌پال)
 *
 * متغیرهای محیطی (اختیاری):
 *   NEXT_PUBLIC_MAX_SLIDES_FREE  (پیش‌فرض ۱۰)
 *   NEXT_PUBLIC_MAX_SLIDES_PRO   (پیش‌فرض ۱۴)
 * ───────────────────────────────────────────────────────────── */

export type PlanIdLite = 'free' | 'pro'

export const MIN_SLIDES = 1

const envInt = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw)
  return Number.isFinite(n) && n >= MIN_SLIDES ? Math.floor(n) : fallback
}

export const MAX_SLIDES_FREE = envInt(process.env.NEXT_PUBLIC_MAX_SLIDES_FREE, 10)
export const MAX_SLIDES_PRO = Math.max(
  MAX_SLIDES_FREE,
  envInt(process.env.NEXT_PUBLIC_MAX_SLIDES_PRO, 14)
)

export function maxSlidesForPlan(plan: PlanIdLite): number {
  return plan === 'pro' ? MAX_SLIDES_PRO : MAX_SLIDES_FREE
}

/* ارقام فارسی — نسخه مستقل از plan.ts تا این ماژول pure بماند */
const toFa = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

/** پیام فارسی وقتی کاربر رایگان تعداد اسلاید بیش از سقف خواست */
export function slidesUpgradeMessage(requested: number, max: number): string {
  return `ارائه ${toFa(requested)} اسلایدی در پلن رایگان ممکن نیست — حداکثر ${toFa(max)} اسلاید. با ارتقا به پلن حرفه‌ای ارائه‌های تا ${toFa(MAX_SLIDES_PRO)} اسلاید، انتخاب دستی قالب و نوع اسلایدها و خروجی بدون نشان برند می‌سازید.`
}
