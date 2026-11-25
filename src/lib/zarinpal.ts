import crypto from 'crypto'

/* ── زرین‌پال helpers مشترک بین request و verify ──
 * امضای HMAC برای callback: چون زرین‌پال فقط Authority و Status
 * را به callback اضافه می‌کند، شناسه کاربر با AUTH_SECRET امضا
 * می‌شود تا کسی نتواند اشتراک کاربر دیگری را با تراکنش خودش
 * فعال کند. */

/* آدرس‌های درگاه — هر بار از env خوانده می‌شود تا تست‌ها بتوانند جا برای
 * درگاه ماک/سندباکس باز کنند. اولویت:
 *   1) ZARINPAL_BASE_URL  — درگاه سفارشی/پروکسی (E2E با فیک‌گیت‌وی)
 *   2) ZARINPAL_SANDBOX=1 — محیط سندباکس رسمی زرین‌پال برای تست پرداخت
 *   3) پیش‌فرض            — پروداکشن payment.zarinpal.com */
export interface ZarinpalGateway {
  request: string
  verify: string
  startPay: string
}

export function zarinpalGateway(): ZarinpalGateway {
  const override = (process.env.ZARINPAL_BASE_URL ?? '').trim().replace(/\/+$/, '')
  const base =
    override ||
    (process.env.ZARINPAL_SANDBOX === '1'
      ? 'https://sandbox.zarinpal.com'
      : 'https://payment.zarinpal.com')
  return {
    request: `${base}/pg/v4/payment/request.json`,
    verify: `${base}/pg/v4/payment/verify.json`,
    startPay: `${base}/pg/StartPay/`,
  }
}

/* کد پیگیری که به کاربر نشان داده می‌شود — فقط رقم، حداکثر ۱۲ رقم،
 * وگرنه undefined (صفحه checkout بدون کد پیگیری رندر می‌شود) */
export function safeRefId(raw: unknown): string | undefined {
  const digits = String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 12)
  return digits || undefined
}

/** مبلغ اشتراک به ریال (پیش‌فرض ۱۴۹٬۰۰۰۰ = ۱۴۹ هزار تومان) */
export function zarinpalAmount(): number {
  return Math.max(10_000, Number(process.env.ZARINPAL_AMOUNT_RIALS ?? 1_490_000))
}

export function paymentSignature(userId: string): string {
  return crypto
    .createHmac(
      'sha256',
      process.env.AUTH_SECRET || 'zslide-dev-secret-change-me-in-production-9f2a'
    )
    .update(`zarinpal:${userId}`)
    .digest('hex')
    .slice(0, 32)
}
