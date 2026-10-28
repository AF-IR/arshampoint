'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Presentation, Loader2, Sparkles, ShieldCheck, Globe, Download, Database, MailCheck, Wand2, Home } from 'lucide-react'
import { authLogin, authRegister, type SessionUser } from '@/lib/client-auth'
import { BRAND, TAGLINE, DEMO_ACCOUNT } from '@/components/arsham/content'
import { navigate } from '@/hooks/use-hash-route'

interface Props {
  onAuthed: (user: SessionUser) => void
  authMode: 'supabase' | 'local'
}

export function AuthView({ onAuthed, authMode }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [demoBusy, setDemoBusy] = useState(false)

  async function quickDemo() {
    setDemoBusy(true)
    setError('')
    setNotice('')
    try {
      const outcome = await authLogin(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)
      if (outcome.ok) onAuthed(outcome.user)
      else setError(outcome.error)
    } catch {
      setError('ورود آزمایشی ناموفق بود.')
    } finally {
      setDemoBusy(false)
    }
  }

  async function submit(mode: 'login' | 'register', e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setNotice('')
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '')
    const password = String(fd.get('password') ?? '')
    const name = String(fd.get('name') ?? '')
    setBusy(true)
    try {
      const outcome =
        mode === 'login'
          ? await authLogin(email, password)
          : await authRegister(name, email, password)
      if (outcome.ok) {
        onAuthed(outcome.user)
      } else if (outcome.needsEmailConfirm) {
        setNotice(outcome.error)
      } else {
        setError(outcome.error)
      }
    } catch {
      setError('خطای ناشناخته‌ای رخ داد. دوباره تلاش کنید.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" dir="rtl">
      {/* Brand side */}
      <div className="relative flex-1 flex flex-col justify-center items-center gap-8 p-10 overflow-hidden bg-gradient-to-bl from-[#101319] via-[#0B0C10] to-[#0D0F14]">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#8AB4F8]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#4285F4]/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-bl from-[#8AB4F8] to-[#4285F4] text-[#0B0C0F] shadow-lg shadow-[#4285F4]/20">
            <Presentation className="w-7 h-7" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{BRAND}</h1>
            <p className="text-sm text-[#9AA0A6] mt-1">{TAGLINE} — مدل GLM زد.دات‌ای</p>
          </div>
        </div>
        <ul className="relative grid gap-4 max-w-md w-full text-sm">
          {[
            { icon: Sparkles, t: 'تولید خودکار محتوا', d: 'فقط موضوع را بنویسید؛ ساختار، متن و آمار را هوش مصنوعی می‌سازد.' },
            { icon: Globe, t: 'خروجی HTML تک‌فایلی', d: 'پرزنتیشن به‌صورت HTML مستقل و راست‌چین با دو تم شبانه/روشن اجرا می‌شود.' },
            { icon: Download, t: 'پیش‌نمایش زنده و دانلود', d: 'داخل سایت اجرا و نمایش داده می‌شود و فایل آن قابل دانلود است.' },
            { icon: ShieldCheck, t: 'حساب کاربری امن', d: 'هر کاربر کتابخانه اختصاصی پرزنتیشن‌های خودش را دارد.' },
            {
              icon: Database,
              t: authMode === 'supabase' ? 'متصل به Supabase' : 'حالت دموی محلی',
              d:
                authMode === 'supabase'
                  ? 'احراز هویت و ذخیره‌سازی روی دیتابیس PostgreSQL سوپابیس انجام می‌شود.'
                  : 'برای نسخه اصلی، متغیرهای Supabase را تنظیم کنید تا ورود کاربران روی سوپابیس برود.',
            },
          ].map((f: { icon: React.ElementType; t: string; d: string }) => (
            <li key={f.t} className="flex gap-4 items-start rounded-2xl border border-white/10 bg-white/[.03] p-4 backdrop-blur-sm">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#8AB4F8]/15 text-[#8AB4F8] shrink-0">
                <f.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-bold">{f.t}</p>
                <p className="text-[#9AA0A6] leading-7 mt-0.5">{f.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#15171C] p-8 shadow-2xl">
          <Tabs defaultValue="login" dir="rtl">
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-white/5">
              <TabsTrigger value="login">ورود</TabsTrigger>
              <TabsTrigger value="register">ثبت‌نام</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => submit('login', e)} className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="l-email">ایمیل</Label>
                  <Input id="l-email" name="email" type="email" dir="ltr" required placeholder="you@example.com" className="bg-white/5 border-white/10 text-left" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="l-pass">رمز عبور</Label>
                  <Input id="l-pass" name="password" type="password" dir="ltr" required minLength={6} placeholder="••••••••" className="bg-white/5 border-white/10 text-left" />
                </div>
                {error && <p className="text-sm text-[#F28B82]">{error}</p>}
                <Button type="submit" disabled={busy} className="mt-1 bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] font-bold hover:opacity-90">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ورود به حساب'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={(e) => submit('register', e)} className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="r-name">نام (اختیاری)</Label>
                  <Input id="r-name" name="name" placeholder="مثلاً: سارا محمدی" className="bg-white/5 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="r-email">ایمیل</Label>
                  <Input id="r-email" name="email" type="email" dir="ltr" required placeholder="you@example.com" className="bg-white/5 border-white/10 text-left" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="r-pass">رمز عبور</Label>
                  <Input id="r-pass" name="password" type="password" dir="ltr" required minLength={6} placeholder="حداقل ۶ کاراکتر" className="bg-white/5 border-white/10 text-left" />
                </div>
                {error && <p className="text-sm text-[#F28B82]">{error}</p>}
                <Button type="submit" disabled={busy} className="mt-1 bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] font-bold hover:opacity-90">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ساخت حساب جدید'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {notice && (
            <div className="flex items-start gap-3 mt-5 rounded-2xl border border-[#8AB4F8]/30 bg-[#8AB4F8]/10 p-4 text-sm leading-7">
              <MailCheck className="w-5 h-5 text-[#8AB4F8] shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {authMode === 'local' && (
            <div className="mt-5 rounded-2xl border border-[#8AB4F8]/30 bg-[#8AB4F8]/[.07] p-4">
              <p className="text-xs font-black text-[#8AB4F8] flex items-center gap-1.5 mb-1">
                <Wand2 className="w-3.5 h-3.5" /> حساب آزمایشی (دمو)
              </p>
              <p className="text-[11px] text-[#9AA0A6] leading-6 mb-3" dir="ltr">
                {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={demoBusy}
                onClick={quickDemo}
                className="w-full h-9 border-[#8AB4F8]/40 bg-[#8AB4F8]/10 hover:bg-[#8AB4F8]/20 text-[#8AB4F8] font-bold"
              >
                {demoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ورود سریع با حساب آزمایشی'}
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('')}
            className="w-full text-center text-xs text-[#9AA0A6] hover:text-[#E8EAED] mt-5 flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> بازگشت به صفحه اصلی
          </button>

          <p className="text-xs text-[#9AA0A6] text-center mt-4 leading-6">
            با ورود، پرزنتیشن‌های شما در کتابخانه اختصاصی حساب ذخیره می‌شود.
          </p>
        </div>
      </div>
    </div>
  )
}
