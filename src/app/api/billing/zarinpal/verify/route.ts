import { NextRequest, NextResponse } from 'next/server'
import { paymentSignature, zarinpalGateway, zarinpalAmount, safeRefId } from '@/lib/zarinpal'
import { activatePro, getPlan } from '@/lib/plan'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
 * GET /api/billing/zarinpal/verify
 * کال‌بک زرین‌پال بعد از پرداخت. پارامترها:
 *   Authority  — کد پیگیری زرین‌پال
 *   Status     — OK | NOK
 *   uid + sig  — شناسه کاربر + امضای HMAC (داخل request ساخته می‌شود)
 *
 * کد ۱۰۰ = پرداخت موفق جدید → اشتراک pro سی‌روزه فعال می‌شود.
 * کد ۱۰۱ = این authority قبلاً وریفای شده؛ اگر کاربر همین حالا pro است
 *          فقط موفق نشان داده می‌شود — رفرش کال‌بک نباید دوره را دوباره
 *          ۳۰ روز کند؛ اگر فعال‌سازیِ اول به خطا خورده بود، همین‌جا
 *          بازیابی می‌شود تا «مبلغ کسر شد اما اشتراک فعال نشد» نباشد.
 * بعد از وریفای موفق، کاربر به /checkout?payment=success (با کد پیگیری
 * تراکنش برای پشتیبانی) هدایت می‌شود.
 * ───────────────────────────────────────────────────────────── */

function redirect(req: NextRequest, result: 'success' | 'failed', refId?: string): NextResponse {
  const url = new URL(`/checkout?payment=${result}`, req.url)
  if (refId) url.searchParams.set('ref', refId)
  return NextResponse.redirect(url)
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
    const res = await fetch(zarinpalGateway().verify, {
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
      const refId = safeRefId(data?.data?.ref_id)
      /* کد ۱۰۱ = این تراکنش قبلاً وریفای شده (رفرش کال‌بک یا دابل‌کلیک).
       * اگر اشتراک کاربر زنده است، activatePro دوباره صدا زده نمی‌شود —
       * وگرنه هر رفرش صفحه دوره را ۳۰ روز اضافه می‌کرد (باگ پولی).
       * اگر فعال‌سازی اول به خطای DB خورده بود (کاربر pro نیست)، این
       * فراخوانی همان فرصت بازیابی است. */
      if (code === 101 && (await getPlan(uid)) === 'pro') {
        console.log('[zarinpal:verify] duplicate verify (101) — already pro, no re-extension', uid)
        return redirect(req, 'success', refId)
      }
      /* پرداخت تأیید شد — دقیقاً ۳۰ روز اشتراک حرفه‌ای فعال می‌کنیم */
      try {
        await activatePro(uid, 1, 'zarinpal')
        console.log('[zarinpal:verify] pro activated for', uid, 'ref', data?.data?.ref_id)
        return redirect(req, 'success', refId)
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
