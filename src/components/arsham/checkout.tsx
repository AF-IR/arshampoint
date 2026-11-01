'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Check, CreditCard, Loader2, Mail, Phone, MapPin, ShieldCheck, ClipboardCheck,
  CheckCircle2, XCircle, LogIn, Crown, ReceiptText, Landmark, ArrowLeft,
} from 'lucide-react'
import { BRAND, CREATOR, SUPPORT_ADDRESS, PRO_PLAN } from './content'
import { apiFetch } from '@/lib/client-auth'
import { faDate } from '@/components/zslide/types'

/* ── صفحه بررسی سفارش (Checkout) ──
 * کاربر اول جزئیات خرید را مرور می‌کند (مبلغ، دوره، امکانات، شرایط)
 * و بعد دکمه پرداخت را می‌زند — رفتن مستقیم به درگاه نداریم. */

const faMoney = (n: number) => n.toLocaleString('fa-IR')

const PRO_INCLUDED = [
  'ارائه نامحدود در کل دوره ۳۰ روزه',
  'انتخاب دستی ۱۲ قالب طراحی و انواع اسلاید',
  'حذف کامل نشان برند از فایل خروجی',
  'پشتیبانی ایمیلی با پاسخ زیر ۲۴ ساعت',
  'دسترسی زودهنگام به قابلیت‌های جدید',
]

const TERMS = [
  'پس از پرداخت، اشتراک بلافاصله و خودکار فعال می‌شود.',
  'دوره اشتراک دقیقاً ۳۰ روز است؛ تمدید خودکار و کسر خودکار نداریم.',
  'اگر مبلغ کسر شد اما اشتراک فعال نشد، با ایمیل یا تلفن پشتیبانی تماس بگیرید — رسید کافی است.',
  'این خرید یک‌باره است؛ برای دوره بعدی خودتان تصمیم می‌گیرید.',
]

type Usage = { plan?: 'free' | 'pro'; unlimited?: boolean; periodEnd?: string | null }

export function CheckoutReview() {
  const [phase, setPhase] = useState<'loading' | 'guest' | 'pro' | 'ready'>('loading')
  const [usage, setUsage] = useState<Usage | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [payResult, setPayResult] = useState<'success' | 'failed' | null>(null)

  const loadUsage = useCallback(async () => {
    try {
      const res = await apiFetch('/api/usage')
      if (res.status === 401) {
        setPhase('guest')
        return
      }
      const data = await res.json().catch(() => ({}))
      const u: Usage = data?.usage ?? {}
      setUsage(u)
      setPhase(u?.plan === 'pro' ? 'pro' : 'ready')
    } catch {
      setPhase('ready')
    }
  }, [])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'success' || p === 'failed') setPayResult(p)
    loadUsage()
  }, [loadUsage])

  /* بازخوانی وضعیت بعد از بازگشت موفق از درگاه */
  useEffect(() => {
    if (payResult === 'success') loadUsage()
  }, [payResult, loadUsage])

  async function startPayment() {
    if (!agreed || paying) return
    setPaying(true)
    setPayError(null)
    try {
      const res = await fetch('/api/billing/zarinpal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.redirectUrl) {
        window.location.href = data.redirectUrl as string
        return
      }
      setPayError(
        data?.error ||
          'شروع پرداخت ناموفق بود. چند لحظه بعد دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.'
      )
    } catch {
      setPayError('اتصال به سرور پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.')
    } finally {
      setPaying(false)
    }
  }

  /* ── ۰) در حال بررسی وضعیت ── */
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[#12141A] p-10 text-sm text-[#9AA0A6]" dir="rtl">
        <Loader2 className="w-4 h-4 animate-spin" /> در حال بررسی وضعیت حساب…
      </div>
    )
  }

  /* ── ۱) مهمان — اول وارد شوید ── */
  if (phase === 'guest') {
    return (
      <section className="max-w-xl mx-auto rounded-3xl border border-white/10 bg-[#12141A] p-8 text-center grid gap-4" dir="rtl">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#8AB4F8]/15 text-[#8AB4F8] mx-auto">
          <LogIn className="w-6 h-6" />
        </span>
        <h2 className="font-black text-lg">اول وارد حساب خود شوید</h2>
        <p className="text-sm text-[#9AA0A6] leading-7">
          اشتراک حرفه‌ای به حساب کاربری شما وصل می‌شود؛ برای مشاهده جزئیات سفارش و پرداخت،
          ابتدا وارد شوید یا حساب رایگان بسازید.
        </p>
        <Link
          href="/#/auth"
          className="mx-auto inline-flex items-center gap-2 h-11 px-6 rounded-xl font-black text-sm bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90"
        >
          <LogIn className="w-4 h-4" /> ورود / ثبت‌نام رایگان
        </Link>
        <p className="text-[11px] text-[#9AA0A6]">ثبت‌نام کمتر از یک دقیقه طول می‌کشد و کارت بانکی نمی‌خواهد.</p>
      </section>
    )
  }

  return (
    <div className="grid gap-6" dir="rtl">
      {/* نتیجه بازگشت از درگاه */}
      {payResult === 'success' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#81C995]/40 bg-[#81C995]/10 p-5 text-sm leading-7">
          <CheckCircle2 className="w-5 h-5 text-[#81C995] shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#81C995]">پرداخت با موفقیت انجام شد ✓</p>
            <p className="text-[#9AA0A6] mt-1">
              اشتراک حرفه‌ای ۳۰ روزه فعال شد{usage?.periodEnd ? ` — تا ${faDate(usage.periodEnd)}` : ''}؛
              از این‌جا به بعد ارائه نامحدود بسازید و خروجی بدون نشان برند تحویل بگیرید.
            </p>
            <Link href="/#/dashboard" className="inline-flex items-center gap-1.5 mt-2 text-[#8AB4F8] font-bold text-xs hover:underline">
              رفتن به پنل ساخت ارائه <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
      {payResult === 'failed' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#F28B82]/40 bg-[#F28B82]/10 p-5 text-sm leading-7">
          <XCircle className="w-5 h-5 text-[#F28B82] shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#F28B82]">پرداخت ناموفق یا لغو شد</p>
            <p className="text-[#9AA0A6] mt-1">
              هزینه‌ای از حساب شما کسر نشده است. اگر مبلغ کسر شده اما اشتراک فعال نشده، با پشتیبانی تماس بگیرید — رسید و کد پیگیری کافی است.
            </p>
          </div>
        </div>
      )}

      {/* گام‌های خرید */}
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center text-[11.5px] font-bold" aria-label="مراحل خرید">
        {[
          { icon: ClipboardCheck, label: 'بررسی سفارش', now: true },
          { icon: CreditCard, label: 'پرداخت امن زرین‌پال', now: payResult === 'success' },
          { icon: Crown, label: 'فعال‌سازی آنی اشتراک', now: payResult === 'success' },
        ].map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-white/20">←</span>}
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
              s.now
                ? 'border-[#81C995]/50 bg-[#81C995]/10 text-[#81C995]'
                : 'border-[#8AB4F8]/40 bg-[#8AB4F8]/10 text-[#8AB4F8]'
            }`}>
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </span>
          </li>
        ))}
      </ol>

      {/* ── ۲) اشتراک فعال — نیازی به خرید نیست ── */}
      {phase === 'pro' ? (
        <section className="max-w-xl mx-auto rounded-3xl border border-[#81C995]/40 bg-[#12141A] p-8 text-center grid gap-3" dir="rtl">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#81C995]/15 text-[#81C995] mx-auto">
            <Crown className="w-6 h-6" />
          </span>
          <h2 className="font-black text-lg">اشتراک حرفه‌ای شما فعال است ✓</h2>
          <p className="text-sm text-[#9AA0A6] leading-7">
            {usage?.periodEnd
              ? `تاریخ پایان دوره: ${faDate(usage.periodEnd)} — تا این تاریخ ارائه نامحدود می‌سازید.`
              : 'تا پایان دوره ارائه نامحدود می‌سازید.'}
            {' '}برای تمدید پس از پایان دوره دوباره به همین صفحه بیایید.
          </p>
          <Link
            href="/#/dashboard"
            className="mx-auto inline-flex items-center gap-2 h-11 px-6 rounded-xl font-black text-sm bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90"
          >
            <ArrowLeft className="w-4 h-4" /> رفتن به پنل ساخت ارائه
          </Link>
        </section>
      ) : (
        /* ── ۳) بررسی سفارش ── */
        <section className="max-w-2xl mx-auto w-full rounded-3xl border border-white/10 bg-[#12141A] p-6 sm:p-8 grid gap-6" dir="rtl">
          <header className="flex items-start gap-3 pb-5 border-b border-white/8">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#8AB4F8]/15 text-[#8AB4F8] shrink-0">
              <ReceiptText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-black text-lg">بررسی سفارش</h2>
              <p className="text-xs text-[#9AA0A6] mt-1">جزئیات خرید را مرور کنید؛ بعد دکمه پرداخت را بزنید.</p>
            </div>
          </header>

          {/* خلاصه سفارش */}
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#9AA0A6]">محصول</span>
              <span className="font-black">اشتراک {BRAND} — پلن حرفه‌ای</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#9AA0A6]">دوره</span>
              <span className="font-bold">۳۰ روز کامل (تقویمی؛ دقیقاً ۳۰×۲۴ ساعت)</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#9AA0A6]">قیمت کل</span>
              <span className="font-black text-lg text-[#8AB4F8]">
                {faMoney(PRO_PLAN.priceToman)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11.5px] text-[#9AA0A6]">
              <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> مبلغ در درگاه به ریال</span>
              <span dir="ltr">{faMoney(PRO_PLAN.priceRials)} ریال</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11.5px] text-[#9AA0A6]">
              <span>معادل روزانه</span>
              <span>حدود {faMoney(PRO_PLAN.perDayToman)} تومان در روز</span>
            </div>
          </div>

          {/* امکانات */}
          <div className="grid gap-2.5">
            <p className="text-sm font-black">در این دوره چه می‌گیرید؟</p>
            <ul className="grid gap-2">
              {PRO_INCLUDED.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] leading-6 text-[#C7CBD1]">
                  <Check className="w-4 h-4 text-[#81C995] shrink-0 mt-1" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* شرایط */}
          <div className="grid gap-2.5">
            <p className="text-sm font-black">شرایط خرید</p>
            <ul className="grid gap-1.5">
              {TERMS.map((t, i) => (
                <li key={t} className="flex items-start gap-2 text-[12px] leading-6 text-[#9AA0A6]">
                  <span className="font-black text-[#8AB4F8] shrink-0">{['۱', '۲', '۳', '۴'][i] ?? i + 1}.</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* پذیرش شرایط */}
          <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-white/10 bg-white/[.03] p-4 select-none hover:border-[#8AB4F8]/40 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#4285F4] shrink-0"
            />
            <span className="text-[13px] leading-6 font-bold">
              شرایط خرید بالا را خواندم و می‌پذیرم؛ با زدن دکمه پایین به درگاه زرین‌پال می‌روم.
            </span>
          </label>

          {/* خطای پرداخت */}
          {payError && (
            <p className="text-[12px] text-[#FFB75F] leading-6 rounded-xl border border-[#FFB75F]/25 bg-[#FFB75F]/10 p-3.5">
              {payError}
            </p>
          )}

          {/* دکمه پرداخت */}
          <Button
            onClick={startPayment}
            disabled={!agreed || paying}
            className="h-12 text-base font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {paying ? (
              <><Loader2 className="w-5 h-5 animate-spin ml-1" /> در حال اتصال به درگاه…</>
            ) : (
              <><CreditCard className="w-5 h-5 ml-1" /> ادامه و پرداخت {faMoney(PRO_PLAN.priceToman)} تومان</>
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#9AA0A6]">
            <ShieldCheck className="w-3.5 h-3.5" /> پرداخت امن روی درگاه رسمی زرین‌پال — فعال‌سازی آنی پس از بازگشت
          </p>

          {/* پشتیبانی */}
          <footer className="grid gap-2 rounded-2xl border border-white/8 bg-white/[.02] p-4 text-[11.5px] text-[#9AA0A6] leading-6">
            <p className="font-black text-[#C7CBD1] text-xs">سوالی قبل از خرید دارید؟ پشتیبانی:</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <a href={`mailto:${CREATOR.email}`} className="flex items-center gap-1 hover:text-[#8AB4F8]" dir="ltr">
                <Mail className="w-3.5 h-3.5 text-[#8AB4F8]" /> {CREATOR.email}
              </a>
              <a href={CREATOR.phoneHref} className="flex items-center gap-1 hover:text-[#8AB4F8]" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-[#8AB4F8]" /> {CREATOR.phoneFa}
              </a>
            </p>
            <p className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8AB4F8] mt-0.5 shrink-0" /> {SUPPORT_ADDRESS}
            </p>
          </footer>
        </section>
      )}
    </div>
  )
}
