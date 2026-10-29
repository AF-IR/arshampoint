'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sparkles, Globe, Moon, Keyboard, ShieldCheck, Download, Image,
  ArrowLeft, Play, Presentation, Zap, CheckCircle2, HelpCircle, BookOpen, Clock,
} from 'lucide-react'
import { BRAND, FEATURES, STEPS, FAQS, STATS } from './content'
import { ARTICLES, MAG_NAME } from '@/lib/mag'
import { navigate } from '@/hooks/use-hash-route'

const ICONS: Record<string, React.ElementType> = {
  Sparkles, Globe, Moon, Keyboard, ShieldCheck, Download, Image,
}

export function Landing({ authed }: { authed: boolean }) {
  const primary = () => navigate(authed ? 'app' : 'auth')
  return (
    <main dir="rtl">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#4285F4]/10 blur-3xl" />
        <div className="absolute top-20 -left-40 w-[26rem] h-[26rem] rounded-full bg-[#8AB4F8]/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-14 grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid gap-6">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#8AB4F8] bg-[#8AB4F8]/10 border border-[#8AB4F8]/25 rounded-full px-3.5 py-1.5">
              <Zap className="w-3.5 h-3.5" /> ساخت پاورپوینت فارسی با هوش مصنوعی — آنلاین و رایگان
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-[1.4]">
              <span className="bg-gradient-to-l from-[#8AB4F8] to-[#4285F4] bg-clip-text text-transparent">ساخت پاورپوینت فارسی با هوش مصنوعی</span>
              <br />
              تو فقط موضوع را بگو
            </h1>
            <p className="text-[#9AA0A6] leading-8 max-w-lg">
              {BRAND} موضوع ارائه شما را به یک پرزنتیشن HTML کامل تبدیل می‌کند؛
              با اسلاید جلد، دستور جلسه، آمار، نقل‌قول، خط زمانی و جمع‌بندی —
              راست‌چین، با دو حالت متنی و دارای تصویر، تم شبانه و روشن و دانلود تک‌فایلی.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={primary} className="h-12 px-6 text-base font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90">
                <Sparkles className="w-5 h-5 ml-2" /> {authed ? 'رفتن به پنل من' : 'ساخت اولین پرزنتیشن'}
              </Button>
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-base font-bold transition-colors"
              >
                <Play className="w-4 h-4" /> امکانات را ببین
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#9AA0A6]">
              {['بدون نیاز به نصب', 'حالت متنی و دارای تصویر', 'خروجی HTML ماندگار', 'کتابخانه اختصاصی کاربران'].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#81C995]" /> {x}
                </li>
              ))}
            </ul>
          </div>

          {/* hero slide mockup */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-bl from-[#4285F4]/15 to-transparent rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-[#101319] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 h-10 border-b border-white/5 bg-[#0D0F14]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F28B82]/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB75F]/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#81C995]/70" />
                <span className="text-[10px] text-[#9AA0A6] mr-2" dir="ltr">presentation.html</span>
              </div>
              <div className="p-8 grid gap-5" style={{ background: 'radial-gradient(420px 220px at 85% -10%, rgba(138,180,248,.18), transparent 60%)' }}>
                <span className="w-fit text-[10px] font-bold text-[#8AB4F8] bg-[#8AB4F8]/10 border border-[#8AB4F8]/25 rounded-full px-2.5 py-1">ارائه آماده اجرا</span>
                <div className="grid gap-3">
                  <span className="h-5 w-3/4 rounded-lg bg-gradient-to-l from-[#8AB4F8]/80 to-[#4285F4]/80" />
                  <span className="h-3 w-1/2 rounded-lg bg-white/15" />
                  <span className="h-3 w-2/3 rounded-lg bg-white/10" />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {['۸ اسلاید', '۴ پالت', '۲ تم'].map((x) => (
                    <div key={x} className="rounded-xl border border-white/10 bg-white/[.03] py-3 text-center text-[11px] font-bold text-[#9AA0A6]">{x}</div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#9AA0A6]">۱ / ۸</span>
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-6 bg-[#8AB4F8]' : 'w-1.5 bg-white/20'}`} />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-6xl mx-auto px-5 pb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[.03] p-5 text-center">
              <p className="text-xl font-black text-[#8AB4F8]">{s.value}</p>
              <p className="text-[11px] text-[#9AA0A6] mt-1.5 leading-5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-5 pb-16" id="features">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black">هر چیزی که برای یک ارائه آماده لازم دارید</h2>
          <p className="text-sm text-[#9AA0A6] mt-3 leading-7 max-w-xl mx-auto">
            از تولید محتوا تا نمایش زنده و دانلود؛ همه‌چیز در یک پنل ساده و فارسی.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = ICONS[f.icon] ?? Sparkles
            return (
              <article key={f.title} className="rounded-3xl border border-white/10 bg-[#12141A] p-6 hover:border-white/20 transition-colors">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#8AB4F8]/12 text-[#8AB4F8] mb-4">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-black mb-2">{f.title}</h3>
                <p className="text-sm text-[#9AA0A6] leading-7">{f.desc}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black">در سه قدم تا ارائه آماده</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="relative rounded-3xl border border-white/10 bg-[#12141A] p-6">
              <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-bl from-[#8AB4F8] to-[#4285F4] text-[#0B0C0F] font-black mb-4">
                {s.n}
              </span>
              <h3 className="font-black mb-2">{s.title}</h3>
              <p className="text-sm text-[#9AA0A6] leading-7">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Showcase (real generated sample, public static file) ── */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black">یک نمونه واقعی را همین حالا اجرا کنید</h2>
          <p className="text-sm text-[#9AA0A6] mt-3">
            این ارائه توسط هوش مصنوعی {BRAND} ساخته شده؛ با کلیدهای جهت‌دار جابه‌جا شوید.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#0D0F14]">
          <iframe
            src="/samples/showcase.html"
            title="نمونه پرزنتیشن تولیدشده با آرشام پوینت"
            className="w-full h-[420px] sm:h-[520px] border-0"
            loading="lazy"
          />
        </div>
        <p className="text-center text-[11px] text-[#9AA0A6] mt-3">
          خروجی تک‌فایلی است؛ همین فایل با دکمه دانلود برای شما قابل دریافت است.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-5 pb-16" id="faq">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black">سوالات متداول</h2>
        </div>
        <Accordion type="single" collapsible className="grid gap-3">
          {FAQS.slice(0, 4).map((f, i) => (
            <AccordionItem key={i} value={`f${i}`} className="border border-white/10 bg-[#12141A] rounded-2xl px-5 last:border-b">
              <AccordionTrigger className="font-bold text-sm hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-[#9AA0A6] leading-8">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-6">
          <Link href="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-[#8AB4F8] hover:underline">
            <HelpCircle className="w-4 h-4" /> همه سوال‌ها و پاسخ‌ها در صفحه سوالات متداول
          </Link>
        </div>
      </section>

      {/* ── SEO guide section with internal links (لینک‌سازی داخلی) ── */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="rounded-[2rem] border border-white/10 bg-[#101319] p-7 sm:p-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-black leading-9">راهنمای ساخت پرزنتیشن حرفه‌ای</h2>
            <p className="text-sm text-[#9AA0A6] leading-8 mt-3">
              نمی‌دانید از کجا شروع کنید؟ این راهنماها را بخوانید؛ برای هر مرحله از ساخت ارائه فارسی —
              از انتخاب ساختار تا اجرای روی صحنه — یک راهنمای کامل داریم.
            </p>
            <Link
              href="/mag"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#8AB4F8] hover:underline mt-4"
            >
              <BookOpen className="w-4 h-4" /> همه مقاله‌های {MAG_NAME}
            </Link>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {[
              { href: '/mag/persian-powerpoint-with-ai', title: 'ساخت پاورپوینت فارسی با هوش مصنوعی', desc: 'راهنمای کامل گام‌به‌گام، از نوشتن موضوع تا دانلود خروجی تک‌فایلی.' },
              { href: '/mag/standard-presentation-structure', title: 'ساختار استاندارد پرزنتیشن حرفه‌ای', desc: 'هشت قطعه استاندارد: از اسلاید جلد تا جمع‌بندی و دعوت به اقدام.' },
              { href: '/mag/online-vs-offline-presentation-tools', title: 'پاورپوینت آنلاین یا آفلاین؟', desc: 'مقایسه ابزارهای ساخت ارائه از نظر سرعت، هزینه و مالکیت فایل.' },
              { href: '/mag/powerpoint-font-fix', title: 'به هم ریختن فونت پاورپوینت در ورژن‌ها', desc: 'چرا فونت عوض می‌شود و چطور برای همیشه ریشه‌کنش کنیم.' },
              { href: '/mag/student-presentation-with-ai', title: 'ارائه دانشجویی با هوش مصنوعی', desc: 'از موضوع درس تا ارائه کلاسی آماده در چند دقیقه.' },
              { href: '/mag/7-business-presentation-tips', title: '۷ نکته ارائه در محیط کار', desc: 'از قاعده ۳۰ ثانیه اول تا پایانی که تصمیم می‌سازد.' },
            ].map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="group rounded-2xl border border-white/10 bg-white/[.03] p-5 hover:border-[#8AB4F8]/40 transition-colors"
              >
                <p className="font-black text-sm leading-7 group-hover:text-[#8AB4F8] transition-colors">{g.title}</p>
                <p className="text-xs text-[#9AA0A6] leading-6 mt-1.5">{g.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest mag articles ── */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black">تازه‌ترین مقاله‌های {MAG_NAME}</h2>
          <p className="text-sm text-[#9AA0A6] mt-3">آموزش‌ها و نکات ارائه، هر هفته تازه‌تر می‌شود.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...ARTICLES]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 3)
            .map((a) => (
            <Link
              key={a.slug}
              href={`/mag/${a.slug}`}
              className="group rounded-3xl border border-white/10 bg-[#12141A] p-6 hover:border-[#8AB4F8]/40 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-2 text-[11px] text-[#9AA0A6] mb-3">
                <span className="font-bold text-[#8AB4F8]">{a.category}</span>
                <span aria-hidden>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.readMinutes} دقیقه</span>
              </div>
              <h3 className="font-black leading-7 group-hover:text-[#8AB4F8] transition-colors">{a.title}</h3>
              <p className="text-xs text-[#9AA0A6] leading-6 mt-2 line-clamp-2">{a.description}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8AB4F8] mt-4">
                خواندن مقاله <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#8AB4F8]/25 p-10 text-center" style={{ background: 'radial-gradient(600px 260px at 50% -60%, rgba(138,180,248,.22), transparent 70%), #101319' }}>
          <Presentation className="w-10 h-10 mx-auto text-[#8AB4F8] mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black leading-relaxed">اولین پرزنتیشن‌ات را همین امروز بساز</h2>
          <p className="text-sm text-[#9AA0A6] mt-3 leading-7 max-w-lg mx-auto">
            ثبت‌نام کمتر از یک دقیقه طول می‌کشد؛ موضوع را بنویس و اولین ارائه هوش مصنوعی‌ات را تحویل بگیر.
          </p>
          <Button size="lg" onClick={primary} className="mt-6 h-12 px-8 text-base font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90">
            شروع کن <ArrowLeft className="w-5 h-5 mr-1" />
          </Button>
        </div>
      </section>
    </main>
  )
}
