import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  zarinpalGateway, zarinpalAmount, paymentSignature,
} from '@/lib/zarinpal'
import { SITE_URL } from '@/components/arsham/content'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
 * POST /api/billing/zarinpal/request
 * شروع پرداخت اشتراک ۳۰ روزه پلن حرفه‌ای از طریق درگاه زرین‌پال.
 *
 * Env:
 *   ZARINPAL_MERCHANT_ID   — مرچنت‌آی‌دی زرین‌پال (الزامی)
 *   ZARINPAL_AMOUNT_RIALS  — مبلغ به ریال (پیش‌فرض ۱۴۹٬۰۰۰۰ = ۱۴۹ هزار تومان)
 *
 * پاسخ: { redirectUrl } → کاربر به درگاه زرین‌پال هدایت می‌شود.
 * اگر مرچنت تنظیم نشده باشد، پیام راهنمای تماس با پشتیبانی برمی‌گردد
 * تا صفحه قیمت‌گذاری در حالت «به‌زودی» هم تجربه کاربری خوبی داشته باشد.
 * ───────────────────────────────────────────────────────────── */

function originOf(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (host) return `${proto}://${host}`
  return SITE_URL /* نرمال‌شده — بدون اسلش پایانی */
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'ابتدا وارد شوید.' }, { status: 401 })

  const merchant = process.env.ZARINPAL_MERCHANT_ID
  if (!merchant) {
    return NextResponse.json(
      {
        error:
          'درگاه پرداخت به‌زودی فعال می‌شود. برای فعال‌سازی پلن حرفه‌ای با پشتیبانی تماس بگیرید: arsham.fazel@gmail.com',
        gatewayReady: false,
      },
      { status: 503 }
    )
  }

  const amount = zarinpalAmount()
  const origin = originOf(req)
  const callbackUrl = `${origin}/api/billing/zarinpal/verify?uid=${encodeURIComponent(user.id)}&sig=${paymentSignature(user.id)}`

  try {
    const res = await fetch(zarinpalGateway().request, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        merchant_id: merchant,
        amount,
        description: 'اشتراک ۳۰ روزه پلن حرفه‌ای آرشام پوینت',
        callback_url: callbackUrl,
        metadata: { email: user.email },
      }),
      signal: AbortSignal.timeout(30_000),
    })
    const data = (await res.json().catch(() => ({}))) as {
      data?: { authority?: string; code?: number; message?: string }
      errors?: { code?: number; message?: string } | unknown[]
    }

    const authority = data?.data?.authority
    if (!res.ok || !authority) {
      const zErr = Array.isArray(data?.errors) ? 'خطای زرین‌پال' : data?.errors?.message
      console.error('[zarinpal:request]', res.status, JSON.stringify(data).slice(0, 400))
      return NextResponse.json(
        {
          error:
            zErr ||
            'ایجاد تراکنش در زرین‌پال ناموفق بود. لطفاً چند دقیقه بعد دوباره تلاش کنید.',
          gatewayReady: true,
        },
        { status: 502 }
      )
    }

    /* برای پیگیری پشتیبانی: کدام کاربر با کدام authority به درگاه رفت */
    console.log('[zarinpal:request] uid', user.id, 'authority', authority, 'amount', amount)
    return NextResponse.json({
      redirectUrl: `${zarinpalGateway().startPay}${authority}`,
      authority,
      amount,
    })
  } catch (err) {
    console.error('[zarinpal:request]', err)
    return NextResponse.json(
      { error: 'اتصال به درگاه زرین‌پال برقرار نشد. لطفاً دوباره تلاش کنید.', gatewayReady: true },
      { status: 502 }
    )
  }
}
