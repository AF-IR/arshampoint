'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check, Sparkles, Building2, Zap, Mail, Phone,
  CheckCircle2, XCircle, ShieldCheck, MapPin, ClipboardList,
} from 'lucide-react'
import { BRAND, CREATOR, SUPPORT_ADDRESS, PRO_PLAN } from './content'

/* ── صفحه قیمت‌گذاری (کامپوننت کلاینت برای دکمه پرداخت زرین‌پال) ── */

interface PlanFeature {
  text: string
  included: boolean
}

const FREE_FEATURES: PlanFeature[] = [
  { text: 'روزانه تا ۳ ارائه کامل با هوش مصنوعی', included: true },
  { text: 'قالب طراحی هوشمند متناسب با موضوع + ۱۲ رنگ غالب', included: true },
  { text: 'دو حالت متنی (آفلاین) و دارای تصویر', included: true },
  { text: 'نمادهای گرافیکی SVG و چیدمان‌های حرفه‌ای', included: true },
  { text: 'کتابخانه ابری و دانلود HTML تک‌فایلی', included: true },
  { text: 'نشان «آرشام پوینت» در نوار کنترل خروجی', included: true },
]

const PRO_FEATURES: PlanFeature[] = [
  { text: 'ارائه نامحدود در دوره ۳۰ روزه (بدون سقف روزانه)', included: true },
  { text: 'انتخاب دستی ۱۲ قالب طراحی و نوع اسلایدها', included: true },
  { text: 'حذف کامل نشان برند از فایل خروجی', included: true },
  { text: 'پشتیبانی ایمیلی با پاسخ زیر ۲۴ ساعت', included: true },
  { text: 'دسترسی زودهنگام به قابلیت‌های جدید', included: true },
  { text: 'تمدید دستی — بدون کسر خودکار از حساب', included: true },
]

const BIZ_FEATURES: string[] = [
  'حساب تیمی و کتابخانه مشترک سازمان',
  'قالب رنگی اختصاصی با لوگوی سازمان شما',
  'فاکتور رسمی و قرارداد سالانه',
  'پشتیبانی اختصاصی و آموزش تیم',
]

export function PricingPlans() {
  /* نتیجه بازگشت از درگاه (پیوندهای قدیمی /pricing?payment=…) */
  const [payResult, setPayResult] = useState<'success' | 'failed' | null>(null)

  useEffect(() => {
    /* خواندن یک‌باره نتیجه بازگشت از درگاه از URL — فقط پس از mount ممکن است
     * (اینجا setState در effect عمدی و یک‌باره است) */
    const p = new URLSearchParams(window.location.search).get('payment')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p === 'success' || p === 'failed') setPayResult(p)
  }, [])

  return (
    <div className="grid gap-6" dir="rtl">
      {/* نتیجه بازگشت از درگاه */}
      {payResult === 'success' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#81C995]/40 bg-[#81C995]/10 p-5 text-sm leading-7">
          <CheckCircle2 className="w-5 h-5 text-[#81C995] shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#81C995]">پرداخت با موفقیت انجام شد ✓</p>
            <p className="text-[#9AA0A6] mt-1">
              اشتراک حرفه‌ای شما به مدت ۳۰ روز فعال شد؛ از همین حالا ارائه نامحدود بسازید و خروجی بدون نشان برند تحویل بگیرید.
            </p>
          </div>
        </div>
      )}
      {payResult === 'failed' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#F28B82]/40 bg-[#F28B82]/10 p-5 text-sm leading-7">
          <XCircle className="w-5 h-5 text-[#F28B82] shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#F28B82]">پرداخت ناموفق یا لغو شد</p>
            <p className="text-[#9AA0A6] mt-1">
              اگر مبلغ از حساب شما کسر شده اما اشتراک فعال نشده، با پشتیبانی تماس بگیرید — رسید و کد پیگیری کافی است.
            </p>
          </div>
        </div>
      )}

      {/* کارت‌های پلن */}
      <div className="grid gap-5 lg:grid-cols-3 items-stretch">
        {/* رایگان */}
        <section className="rounded-3xl border border-white/10 bg-[#12141A] p-7 flex flex-col">
          <h2 className="font-black text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#8AB4F8]" /> رایگان</h2>
          <p className="mt-3">
            <span className="text-3xl font-black">۰</span>
            <span className="text-sm text-[#9AA0A6] mr-2">تومان / همیشه</span>
          </p>
          <p className="text-xs text-[#9AA0A6] mt-2 leading-6">برای شروع، دانشجوها و ارائه‌های گاه‌به‌گاه.</p>
          <ul className="grid gap-2.5 mt-5 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-2 text-[13px] leading-6">
                <Check className="w-4 h-4 text-[#81C995] shrink-0 mt-1" /> {f.text}
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center h-11 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-bold text-sm transition-colors"
          >
            شروع رایگان
          </Link>
        </section>

        {/* حرفه‌ای */}
        <section className="relative rounded-3xl border-2 border-[#8AB4F8]/50 bg-[#12141A] p-7 flex flex-col shadow-2xl shadow-[#8AB4F8]/10">
          <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] text-[11px] font-black px-3.5 py-1.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> پیشنهاد ما
          </span>
          <h2 className="font-black text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-[#8AB4F8]" /> حرفه‌ای</h2>
          <p className="mt-3">
            <span className="text-3xl font-black">{PRO_PLAN.priceToman.toLocaleString('fa-IR')}</span>
            <span className="text-sm text-[#9AA0A6] mr-2">تومان / ۳۰ روز</span>
          </p>
          <p className="text-xs text-[#8AB4F8] mt-1.5 leading-6 font-bold">
            ≈ {PRO_PLAN.perDayToman.toLocaleString('fa-IR')} تومان در روز
          </p>
          <p className="text-xs text-[#9AA0A6] mt-1.5 leading-6">برای معلم‌ها، مشاورها و کسانی که هر هفته ارائه می‌دهند.</p>
          <ul className="grid gap-2.5 mt-5 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-2 text-[13px] leading-6">
                <Check className="w-4 h-4 text-[#8AB4F8] shrink-0 mt-1" /> {f.text}
              </li>
            ))}
          </ul>
          {/* نه مستقیم به درگاه — اول صفحه بررسی سفارش، بعد پرداخت */}
          <Link
            href="/checkout"
            className="mt-6 inline-flex items-center justify-center gap-2 h-11 font-black text-sm bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90 rounded-xl transition-opacity"
          >
            <ClipboardList className="w-4 h-4" /> خرید اشتراک — بررسی سفارش
          </Link>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#9AA0A6] mt-3">
            <ShieldCheck className="w-3.5 h-3.5" /> اول صفحه مرور سفارش، بعد درگاه امن زرین‌پال
          </p>
        </section>

        {/* سازمانی */}
        <section className="rounded-3xl border border-white/10 bg-[#12141A] p-7 flex flex-col">
          <h2 className="font-black text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-[#8AB4F8]" /> سازمانی</h2>
          <p className="mt-3">
            <span className="text-3xl font-black">سفارشی</span>
          </p>
          <p className="text-xs text-[#9AA0A6] mt-2 leading-6">برای مدارس، دانشگاه‌ها، آژانس‌ها و شرکت‌ها.</p>
          <ul className="grid gap-2.5 mt-5 flex-1">
            {BIZ_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] leading-6">
                <Check className="w-4 h-4 text-[#81C995] shrink-0 mt-1" /> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center h-11 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-bold text-sm transition-colors"
          >
            <Mail className="w-4 h-4 ml-1.5" /> تماس برای مشاوره
          </Link>
          <p className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[11px] text-[#9AA0A6] mt-3">
            <a href={`mailto:${CREATOR.email}`} className="flex items-center gap-1 hover:text-[#8AB4F8]" dir="ltr"><Mail className="w-3 h-3" /> {CREATOR.email}</a>
            <a href={CREATOR.phoneHref} className="flex items-center gap-1 hover:text-[#8AB4F8]" dir="ltr"><Phone className="w-3 h-3" /> {CREATOR.phoneDisplay}</a>
          </p>
        </section>
      </div>

      <p className="text-center text-[11px] text-[#9AA0A6] leading-6">
        قیمت‌ها به تومان و بدون ارزش‌افزوده است؛ هر دوره اشتراک حرفه‌ای دقیقاً ۳۰ روز است، تمدید دستی انجام می‌شود و هر زمان می‌توانید انصراف دهید.
        {BRAND} ابزار ساخت پاورپوینت فارسی با هوش مصنوعی است.
      </p>
      <p className="flex items-start justify-center gap-1.5 text-center text-[11px] text-[#9AA0A6] leading-6">
        <MapPin className="w-3.5 h-3.5 text-[#8AB4F8] mt-0.5 shrink-0" />
        <span>آدرس تیم پشتیبانی: {SUPPORT_ADDRESS}</span>
      </p>
    </div>
  )
}
