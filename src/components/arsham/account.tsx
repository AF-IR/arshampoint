'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  UserCircle2, BookOpen, Layers, CalendarDays, LogOut,
  ShieldCheck, Server, Sparkles, Mail,
} from 'lucide-react'
import { apiFetch, type SessionUser } from '@/lib/client-auth'
import { navigate } from '@/hooks/use-hash-route'
import { useSession } from '@/components/arsham/session'
import { faDate, faNum, type DeckMeta } from '@/components/zslide/types'
import { DeployGuideDialog } from '@/components/zslide/deploy-guide'

/* صفحه «حساب من»: پروفایل + آمار استفاده + اقدامات حساب */

export function AccountPage({ user }: { user: SessionUser }) {
  const [decks, setDecks] = useState<DeckMeta[]>([])
  /* status + logout come from the shared session context —
   * no duplicate /api/status request per visit */
  const { status, logout } = useSession()

  useEffect(() => {
    let alive = true
    apiFetch('/api/presentations')
      .then(async (res) => (res.ok ? ((await res.json())?.decks ?? []) : []))
      .then((d) => {
        if (alive) setDecks(d)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  const totalSlides = decks.reduce((s, d) => s + (d.slideCount || 0), 0)
  const newest = decks[0]?.createdAt
  const initial = (user.name || user.email || '؟').trim().charAt(0)

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-5 py-8 grid gap-6" dir="rtl">
      <section>
        <h1 className="text-2xl font-black">حساب من</h1>
        <p className="text-sm text-[#9AA0A6] mt-2">مشخصات، آمار استفاده و تنظیمات حساب شما.</p>
      </section>

      {/* profile card */}
      <section className="rounded-3xl border border-white/10 bg-[#12141A] p-6 flex flex-wrap items-center gap-5">
        <span className="grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-bl from-[#8AB4F8] to-[#4285F4] text-[#0B0C0F] text-2xl font-black" aria-hidden>
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-lg">{user.name || 'کاربر آرشام پوینت'}</h2>
          <p className="text-xs text-[#9AA0A6] mt-1 flex items-center gap-1.5" dir="ltr">
            <Mail className="w-3.5 h-3.5" /> {user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate('app')} className="h-9 font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90">
            <Sparkles className="w-4 h-4 ml-1" /> ساخت ارائه
          </Button>
          <DeployGuideDialog status={status} />
          <Button size="sm" variant="outline" onClick={() => logout()} className="h-9 border-white/15 bg-white/5 hover:bg-[#F28B82]/15 hover:text-[#F28B82] hover:border-[#F28B82]/40 font-bold">
            <LogOut className="w-4 h-4 ml-1" /> خروج از حساب
          </Button>
        </div>
      </section>

      {/* stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, v: faNum(decks.length), l: 'پرزنتیشن ساخته‌شده' },
          { icon: Layers, v: faNum(totalSlides), l: 'اسلاید تولیدشده' },
          { icon: UserCircle2, v: user.name ? 'تأییدشده' : 'مهمان', l: 'وضعیت پروفایل' },
          { icon: CalendarDays, v: newest ? faDate(newest) : '—', l: 'آخرین فعالیت' },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/10 bg-[#12141A] p-5">
            <s.icon className="w-5 h-5 text-[#8AB4F8] mb-3" />
            <p className="font-black text-lg leading-7">{s.v}</p>
            <p className="text-[11px] text-[#9AA0A6] mt-1">{s.l}</p>
          </div>
        ))}
      </section>

      {/* infrastructure status */}
      <section className="rounded-3xl border border-white/10 bg-[#12141A] p-6 grid gap-4">
        <h3 className="font-black text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-[#8AB4F8]" /> وضعیت زیرساخت
        </h3>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-4">
            <p className="text-[#9AA0A6] mb-1.5">احراز هویت و دیتابیس</p>
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${status?.mode === 'supabase' ? 'text-[#81C995]' : 'text-[#FFB75F]'}`} />
              {status?.mode === 'supabase' ? 'Supabase (پروداکشن)' : 'دموی محلی'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-4">
            <p className="text-[#9AA0A6] mb-1.5">موتور هوش مصنوعی</p>
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8AB4F8]" />
              {status?.ai === 'http' ? `موتور هوش مصنوعی (${status.aiModel})` : 'SDK سندباکس'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-4">
            <p className="text-[#9AA0A6] mb-1.5">فرمت خروجی</p>
            <p className="font-bold">HTML تک‌فایلی مستقل</p>
          </div>
        </div>
        {status && status.mode === 'local' && (
          <p className="text-[11px] text-[#FFB75F] leading-6 rounded-xl border border-[#FFB75F]/25 bg-[#FFB75F]/10 p-3">
            در حالت دموی محلی هستید؛ برای فعال‌سازی نسخه اصلی (ورود واقعی کاربران روی Supabase) راهنمای استقرار را باز کنید.
          </p>
        )}
      </section>

      {/* quick actions */}
      <section className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('presentations')}
          className="rounded-3xl border border-white/10 bg-[#12141A] p-6 text-right hover:border-[#8AB4F8]/40 transition-colors"
        >
          <BookOpen className="w-6 h-6 text-[#8AB4F8] mb-3" />
          <p className="font-black">ارائه‌های من</p>
          <p className="text-xs text-[#9AA0A6] mt-1.5 leading-6">مشاهده، اجرا و دانلود همه پرزنتیشن‌های ساخته‌شده.</p>
        </button>
        <button
          onClick={() => logout()}
          className="rounded-3xl border border-white/10 bg-[#12141A] p-6 text-right hover:border-[#F28B82]/40 transition-colors"
        >
          <LogOut className="w-6 h-6 text-[#F28B82] mb-3" />
          <p className="font-black">خروج از حساب</p>
          <p className="text-xs text-[#9AA0A6] mt-1.5 leading-6">پایان نشست فعلی؛ ارائه‌های شما در کتابخانه می‌ماند.</p>
        </button>
      </section>
    </main>
  )
}
