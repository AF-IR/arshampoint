import crypto from 'crypto'

/* ── زرین‌پال helpers مشترک بین request و verify ──
 * امضای HMAC برای callback: چون زرین‌پال فقط Authority و Status
 * را به callback اضافه می‌کند، شناسه کاربر با AUTH_SECRET امضا
 * می‌شود تا کسی نتواند اشتراک کاربر دیگری را با تراکنش خودش
 * فعال کند. */

export const ZARINPAL_REQUEST_URL = 'https://payment.zarinpal.com/pg/v4/payment/request.json'
export const ZARINPAL_VERIFY_URL = 'https://payment.zarinpal.com/pg/v4/payment/verify.json'
export const ZARINPAL_STARTPAY_URL = 'https://payment.zarinpal.com/pg/StartPay/'

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
