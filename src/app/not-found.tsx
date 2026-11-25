import Link from 'next/link'
import { Home, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { BRAND, TAGLINE } from '@/components/arsham/content'
import { BrandMark } from '@/components/arsham/brand-logo'

export const metadata = {
  title: 'صفحه پیدا نشد',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5 text-center" dir="rtl">
      <div className="flex items-center gap-3">
        <BrandMark size={52} />
        <div className="text-right">
          <p className="font-black text-lg leading-6">{BRAND}</p>
          <p className="text-xs text-[#9AA0A6]">{TAGLINE}</p>
        </div>
      </div>
      <h1 className="text-4xl font-black text-[#8AB4F8]">۴۰۴</h1>
      <p className="text-lg font-black">این صفحه پیدا نشد</p>
      <p className="text-sm text-[#9AA0A6] leading-8 max-w-md">
        ممکن است نشانی را اشتباه وارد کرده باشید یا صفحه جابه‌جا شده باشد.
        از پیوندهای زیر مسیر درست را پیدا کنید.
      </p>
      <nav aria-label="پیوندهای اصلی" className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90"
        >
          <Home className="w-4 h-4" /> صفحه اصلی
        </Link>
        <Link
          href="/features"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold border border-white/15 bg-white/5 hover:bg-white/10"
        >
          <Sparkles className="w-4 h-4" /> امکانات
        </Link>
        <Link
          href="/mag"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold border border-white/15 bg-white/5 hover:bg-white/10"
        >
          <BookOpen className="w-4 h-4" /> مجله
        </Link>
      </nav>
      <Link href="/" className="text-xs text-[#9AA0A6] hover:text-[#8AB4F8] inline-flex items-center gap-1.5">
        <ArrowRight className="w-3.5 h-3.5" /> بازگشت به خانه
      </Link>
    </div>
  )
}
