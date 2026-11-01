import { NextRequest, NextResponse } from 'next/server'
import { paymentSignature, ZARINPAL_VERIFY_URL, zarinpalAmount } from '@/lib/zarinpal'
import { activatePro } from '@/lib/plan'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
 * GET /api/billing/zarinpal/verify
 * کال‌بک زرین‌پال بعد از پرداخت. پارامترها:
 *   Authority  — کد پیگیری زرین‌پال
 *   Status     — OK | NOK
 *   uid + sig  — شناسه کاربر + امضای HMAC (داخل request ساخته می‌شود)
 *
 * کد ۱۰۰ = پرداخت موفق جدید، کد ۱۰۱ = قبلاً وریفای شده (هر دو موفق).
 * بعد از وریفای موفق، اشتراک pro سی‌روزه (۳۰ روز دقیق) فعال و کاربر به
 * /checkout?payment=success (همان صفحه بررسی سفارش) هدایت می‌شود.
 * ───────────────────────────────────────────────────────────── */

function redirect(req: NextRequest, result: 'success' | 'failed'): NextResponse {
  return NextResponse.redirect(new URL(`/checkout?payment=${result}`, req.url))
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const status = params.get('Status') ?? params.get('status')
  const authority = params.get('Authority') ?? params.get('authority')
  const uid = params.get('uid') ?? ''
  const sig = params.get('sig') ?? ''

  if (status !== 'OK' || !authority || !uid) {
    return redirect(req, 'failed')
  }
  /* امضای callback باید با AUTH_SECRET معتبر باشد تا کسی نتواند
   * اشتراک کاربر دیگری را با تراکنش خودش فعال کند */
  if (sig !== paymentSignature(uid)) {
    console.error('[zarinpal:verify] invalid signature for uid', uid)
    return redirect(req, 'failed')
  }

  const merchant = process.env.ZARINPAL_MERCHANT_ID
  const amount = zarinpalAmount()
  if (!merchant) return redirect(req, 'failed')

  try {
    const res = await fetch(ZARINPAL_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ merchant_id: merchant, amount, authority }),
      signal: AbortSignal.timeout(30_000),
    })
    const data = (await res.json().catch(() => ({}))) as {
      data?: { code?: number; ref_id?: number; message?: string }
    }
    const code = data?.data?.code
    if (code === 100 || code === 101) {
      /* پرداخت تأیید شد — دقیقاً ۳۰ روز اشتراک حرفه‌ای فعال می‌کنیم */
      try {
        await activatePro(uid, 1, 'zarinpal')
        console.log('[zarinpal:verify] pro activated for', uid, 'ref', data?.data?.ref_id)
        return redirect(req, 'success')
      } catch (err) {
        console.error('[zarinpal:verify] activatePro failed', err)
        return redirect(req, 'failed')
      }
    }
    console.error('[zarinpal:verify] rejected code', code, JSON.stringify(data).slice(0, 300))
    return redirect(req, 'failed')
  } catch (err) {
    console.error('[zarinpal:verify]', err)
    return redirect(req, 'failed')
  }
}
