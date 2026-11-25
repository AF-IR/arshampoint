'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Wand2, Loader2, Users, Palette, Image as ImageIcon, WifiOff, Link2, Info, Crown, LayoutTemplate, SlidersHorizontal, UserSquare } from 'lucide-react'
import { ACCENTS, TONES, faNum, type GeneratePayload } from './types'
import { STYLE_OPTIONS } from '@/lib/deck-styles'
import { DECK_LAYOUT_TYPES } from '@/lib/deck-types'
import { MIN_SLIDES, MAX_SLIDES_PRO, maxSlidesForPlan } from '@/lib/plan-limits'
import { apiFetch } from '@/lib/client-auth'

interface Props {
  busy: boolean
  onGenerate: (payload: GeneratePayload) => void
}

export function CreatePanel({ busy, onGenerate }: Props) {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [authorsText, setAuthorsText] = useState('')
  const [tone, setTone] = useState<string>(TONES[0])
  const [slideCount, setSlideCount] = useState(8)
  const [language, setLanguage] = useState<'fa' | 'en'>('fa')
  const [accent, setAccent] = useState('blue')
  const [style, setStyle] = useState('auto')
  const [layouts, setLayouts] = useState<string[]>([])
  const [visualMode, setVisualMode] = useState<'offline' | 'image'>('offline')
  const [imageLinksText, setImageLinksText] = useState('')
  const [plan, setPlan] = useState<'free' | 'pro'>('free')

  /* پلن کاربر برای باز/قفل کردن کنترل‌های حرفه‌ای */
  useEffect(() => {
    let alive = true
    apiFetch('/api/usage')
      .then(async (res) => (res.ok ? ((await res.json())?.usage ?? null) : null))
      .then((u) => {
        if (alive && u?.plan) setPlan(u.plan)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  const isPro = plan === 'pro'
  const maxSlides = maxSlidesForPlan(plan)
  /* مقدار مؤثر تعداد اسلاید — همیشه داخل سقف پلن مهار می‌شود
   * (بدون effect: اگر پلن بین دو رندر عوض شد، خودکار درست نمایش و ارسال می‌شود) */
  const effSlides = Math.min(slideCount, maxSlides)
  const valid = topic.trim().length >= 3
  const accentLabel = ACCENTS.find((a) => a.key === accent)?.label ?? ''

  const parsedImageLinks = () =>
    imageLinksText
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\/\S+$/i.test(s))

  /* نام تهیه‌کنندگان/اعضا — هر خط یک نام، حداکثر ۶ نام */
  const parsedAuthors = () =>
    authorsText
      .split(/\n/)
      .map((s) => s.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 6)

  function toggleLayout(key: string) {
    if (!isPro) return
    setLayouts((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      if (prev.length >= 4) return prev
      return [...prev, key]
    })
  }

  function submit() {
    if (!valid || busy) return
    const links = visualMode === 'image' ? parsedImageLinks() : []
    const authors = parsedAuthors()
    onGenerate({
      topic: topic.trim(),
      audience: audience.trim() || undefined,
      tone,
      slideCount: effSlides,
      authors: authors.length ? authors : undefined,
      language,
      accent,
      visualMode,
      imageLinks: links.length ? links : undefined,
      /* انتخاب دستی قالب/نوع اسلاید فقط برای پلن حرفه‌ای ارسال می‌شود */
      style: isPro && style !== 'auto' ? style : undefined,
      layouts: isPro && layouts.length ? layouts : undefined,
    })
  }

  return (
    <section className="a-fade-up rounded-3xl border border-white/10 bg-[#15171C] p-6 sm:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-bl from-[#8AB4F8] to-[#4285F4] text-[#0B0C0F]">
          <Wand2 className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-black">پرزنتیشن جدید بساز</h2>
          <p className="text-sm text-[#9AA0A6]">موضوع را بنویس، بقیه‌اش با هوش مصنوعی</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="grid gap-6"
      >
        <div className="grid gap-2">
          <Label htmlFor="topic">موضوع ارائه *</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثلاً: نقش هوش مصنوعی در آموزش آینده — با تمرکز بر ابزارهای یادگیری شخصی‌سازی‌شده"
            className="min-h-24 bg-white/5 border-white/10 leading-8 resize-none text-[15px]"
            maxLength={400}
          />
        </div>

        {/* ── حالت تولید: آفلاین / دارای تصویر ── */}
        <div className="grid gap-2.5">
          <Label>حالت تولید اسلایدها</Label>
          <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="حالت تولید اسلایدها">
            <button
              type="button"
              role="radio"
              aria-checked={visualMode === 'offline'}
              onClick={() => setVisualMode('offline')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-right transition-all ${
                visualMode === 'offline'
                  ? 'border-[#8AB4F8]/60 bg-[#8AB4F8]/10 shadow-lg shadow-[#8AB4F8]/10'
                  : 'border-white/10 bg-white/[.03] hover:bg-white/[.06]'
              }`}
            >
              <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${visualMode === 'offline' ? 'bg-[#8AB4F8]/20 text-[#8AB4F8]' : 'bg-white/5 text-[#9AA0A6]'}`}>
                <WifiOff className="w-5 h-5" />
              </span>
              <span className="grid gap-1">
                <span className="font-black text-sm">متنی (آفلاین)</span>
                <span className="text-xs text-[#9AA0A6] leading-6">
                  آیکون، نمودار و اشکال گرافیکی — سبک، سریع و بدون هیچ تصویر خارجی
                </span>
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={visualMode === 'image'}
              onClick={() => setVisualMode('image')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-right transition-all ${
                visualMode === 'image'
                  ? 'border-[#8AB4F8]/60 bg-[#8AB4F8]/10 shadow-lg shadow-[#8AB4F8]/10'
                  : 'border-white/10 bg-white/[.03] hover:bg-white/[.06]'
              }`}
            >
              <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${visualMode === 'image' ? 'bg-[#8AB4F8]/20 text-[#8AB4F8]' : 'bg-white/5 text-[#9AA0A6]'}`}>
                <ImageIcon className="w-5 h-5" />
              </span>
              <span className="grid gap-1">
                <span className="font-black text-sm">دارای تصویر</span>
                <span className="text-xs text-[#9AA0A6] leading-6">
                  درج تصاویر مرتبط به‌صورت لینک داخل اسلایدها + امکان لینک عکس‌های خودتان
                </span>
              </span>
            </button>
          </div>

          {visualMode === 'image' && (
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-4 mt-1">
              <Label htmlFor="imageLinks" className="flex items-center gap-1.5 text-[13px]">
                <Link2 className="w-3.5 h-3.5 text-[#8AB4F8]" /> لینک تصاویر خودتان (اختیاری — یکی در هر خط)
              </Label>
              <Textarea
                id="imageLinks"
                value={imageLinksText}
                onChange={(e) => setImageLinksText(e.target.value)}
                placeholder={'https://example.com/photo1.jpg\nhttps://example.com/photo2.png'}
                className="min-h-20 bg-white/5 border-white/10 leading-7 resize-none text-[13px] font-mono"
                dir="ltr"
              />
              <p className="flex items-start gap-1.5 text-[11px] text-[#9AA0A6] leading-5">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                اگر لینکی وارد نکنید، هوش مصنوعی عکس‌های مرتبط با موضوع را انتخاب می‌کند. اگر لینک تصویری در مرورگر باز نشد، خروجی به‌صورت خودکار تصویر جایگزین نشان می‌دهد. حداکثر ۱۲ لینک.
              </p>
            </div>
          )}
        </div>

        {/* ── قالب طراحی (۱۲ قالب) + نوع اسلایدها — انتخاب دستی ویژه حرفه‌ای ── */}
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5"><LayoutTemplate className="w-3.5 h-3.5" /> قالب طراحی</Label>
              {!isPro && <ProBadge />}
            </div>
            <Select
              value={style}
              onValueChange={(v) => isPro && setStyle(v)}
              disabled={!isPro}
              dir="rtl"
            >
              <SelectTrigger className="bg-white/5 border-white/10 w-full text-[14px]" aria-disabled={!isPro}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E2127] border-white/10">
                <SelectItem value="auto">خودکار — هوشمند بر اساس موضوع</SelectItem>
                {STYLE_OPTIONS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label} — {s.desc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-[#9AA0A6] leading-5">
              {isPro
                ? 'قالب، کل زبان طراحی (پس‌زمینه، فونت، جلد و فرم کارت‌ها) را عوض می‌کند؛ رنگ غالب جداگانه اعمال می‌شود.'
                : 'در پلن رایگان قالب به‌صورت هوشمند و متناسب با موضوع انتخاب می‌شود — هر موضوع قالب متفاوتی می‌گیرد. انتخاب دستی ۱۲ قالب ویژه حرفه‌ای است.'}
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> نوع اسلایدها (حداکثر ۴)</Label>
              {!isPro && <ProBadge />}
            </div>
            <div className={`flex flex-wrap gap-1.5 rounded-2xl border p-3 ${isPro ? 'border-white/10 bg-white/[.03]' : 'border-white/5 bg-white/[.015] opacity-70'}`}>
              {DECK_LAYOUT_TYPES.map((l) => {
                const on = layouts.includes(l.key)
                return (
                  <button
                    type="button"
                    key={l.key}
                    onClick={() => toggleLayout(l.key)}
                    disabled={!isPro}
                    aria-pressed={on}
                    className={`h-8 rounded-full px-3 text-xs font-bold transition-all ${
                      on
                        ? 'bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F]'
                        : isPro
                          ? 'bg-white/5 text-[#C4C7CC] border border-white/10 hover:bg-white/10'
                          : 'bg-white/[.03] text-[#9AA0A6] border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {l.label}
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-[#9AA0A6] leading-5">
              {isPro
                ? layouts.length
                  ? `هوش مصنوعی این انواع را در ارائه می‌گنجاند: ${layouts.map((k) => DECK_LAYOUT_TYPES.find((l) => l.key === k)?.label).join('، ')}.`
                  : 'چیزی انتخاب نکردید — ترکیب اسلایدها هوشمندانه و متناسب با موضوع چیده می‌شود.'
                : 'در پلن رایگان ترکیب انواع اسلاید هوشمندانه و متناسب با موضوع انتخاب می‌شود؛ انتخاب دستی ویژه حرفه‌ای است.'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="grid gap-2">
            <Label htmlFor="audience" className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> مخاطب (اختیاری)</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="مثلاً: مدیران استارتاپ‌ها"
              className="bg-white/5 border-white/10 text-[15px]"
              maxLength={80}
            />
          </div>
          <div className="grid gap-2">
            <Label>لحن ارائه</Label>
            <Select value={tone} onValueChange={(v) => setTone(v)} dir="rtl">
              <SelectTrigger className="bg-white/5 border-white/10 w-full text-[15px]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1E2127] border-white/10">
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── تهیه‌شده توسط / نام اعضا — روی جلد و اسلاید پایانی درج می‌شود ── */}
        <div className="grid gap-2">
          <Label htmlFor="authors" className="flex items-center gap-1.5">
            <UserSquare className="w-3.5 h-3.5" /> تهیه‌شده توسط / نام اعضا (اختیاری)
          </Label>
          <Textarea
            id="authors"
            value={authorsText}
            onChange={(e) => setAuthorsText(e.target.value)}
            placeholder={'هر خط یک نام — مثلاً:\nآرشام رضایی\nسارا محمدی'}
            className="min-h-20 bg-white/5 border-white/10 leading-7 resize-none text-[14px]"
            maxLength={400}
          />
          <p className="flex items-start gap-1.5 text-[11px] text-[#9AA0A6] leading-5">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            این نام‌ها به‌صورت خودکار روی اسلاید جلد و اسلاید پایانی ارائه درج می‌شود. حداکثر ۶ نام.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 items-start">
          <div className="grid gap-3">
            <Label htmlFor="slides">تعداد اسلاید: <span className="text-[#8AB4F8] font-bold">{faNum(effSlides)}</span></Label>
            {/* جهت اسلایدر عمداً LTR است: کم سمت چپ، زیاد سمت راست و
                کشیدن به سمت راست یعنی اسلاید بیشتر — کنوانسیون آشنا
                همه اسلایدرهای عددی (حتی در رابط‌های فارسی). برچسب‌های
                زیر نوار هم با همین ترتیب هم‌راستا شده‌اند تا نوار
                هیچ‌وقت «برعکس» دیده نشود. سقف بر اساس پلن: رایگان
                ۱ تا ۱۰، حرفه‌ای ۱ تا ۱۴ (منبع مشترک plan-limits). */}
            <Slider
              id="slides"
              dir="ltr"
              value={[effSlides]}
              onValueChange={(v) => setSlideCount(v[0])}
              min={MIN_SLIDES}
              max={maxSlides}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-[#9AA0A6]" dir="ltr"><span>{faNum(MIN_SLIDES)}</span><span>{faNum(maxSlides)}</span></div>
            {!isPro && (
              <p className="text-[11px] text-[#9AA0A6] leading-5 flex items-start gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#F9AB00] shrink-0 mt-0.5" />
                <span>در پلن رایگان تا {faNum(maxSlides)} اسلاید؛ با پلن حرفه‌ای تا {faNum(MAX_SLIDES_PRO)} اسلاید بسازید.</span>
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>زبان پرزنتیشن</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as 'fa' | 'en')} dir="rtl">
              <SelectTrigger className="bg-white/5 border-white/10 w-full text-[15px]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1E2127] border-white/10">
                <SelectItem value="fa">فارسی (راست‌چین)</SelectItem>
                <SelectItem value="en">English (LTR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── رنگ غالب: طیف فشرده (مناسب موبایل) ── */}
        <div className="grid gap-2.5">
          <Label className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> رنگ غالب
            {accentLabel && <span className="text-[#8AB4F8] font-bold text-xs">— {accentLabel}</span>}
          </Label>
          <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="رنگ غالب ارائه">
            {ACCENTS.map((a) => {
              const on = accent === a.key
              return (
                <button
                  type="button"
                  key={a.key}
                  role="radio"
                  aria-checked={on}
                  title={a.label}
                  aria-label={a.label}
                  onClick={() => setAccent(a.key)}
                  className={`w-8 h-8 rounded-full shrink-0 transition-all ${on ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                  style={{
                    background: a.color,
                    boxShadow: on ? `0 0 0 3px rgba(255,255,255,.85), 0 0 12px ${a.ring}` : `0 0 0 1.5px rgba(255,255,255,.12)`,
                  }}
                />
              )
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={!valid || busy}
          className="h-12 text-base font-black bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90 rounded-2xl"
        >
          {busy ? (
            <><Loader2 className="w-5 h-5 animate-spin ml-1" /> در حال تولید…</>
          ) : (
            <><Wand2 className="w-5 h-5 ml-1" /> {visualMode === 'image' ? 'تولید پرزنتیشن با تصویر' : 'تولید پرزنتیشن با هوش مصنوعی'}</>
          )}
        </Button>
      </form>
    </section>
  )
}

/* نشان «ویژه حرفه‌ای» روی کنترل‌های قفل‌شده — با پیوند ارتقا */
function ProBadge() {
  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1 rounded-full bg-[#FDD663]/10 border border-[#FDD663]/30 text-[#FDD663] text-[10.5px] font-black px-2.5 py-1 hover:bg-[#FDD663]/20 transition-colors shrink-0"
    >
      <Crown className="w-3 h-3" /> ویژه حرفه‌ای — ارتقا
    </Link>
  )
}

export function GeneratingOverlay({ topic, withImages }: { topic: string; withImages?: boolean }) {
  const steps = withImages
    ? ['تحلیل موضوع', 'انتخاب قالب طراحی', 'ساختاردهی اسلایدها', 'انتخاب و درج تصاویر', 'نوشتن محتوا', 'رندر HTML']
    : ['تحلیل موضوع', 'انتخاب قالب طراحی', 'ساختاردهی اسلایدها', 'نوشتن محتوا', 'رندر HTML']
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 backdrop-blur-md p-6" dir="rtl">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#15171C] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-[#8AB4F8]/15 text-[#8AB4F8]">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </span>
          <div>
            <h3 className="font-black text-lg">هوش مصنوعی مشغول ساخت ارائه است</h3>
            <p className="text-xs text-[#9AA0A6] mt-0.5 line-clamp-1">{topic}</p>
          </div>
        </div>
        <div className="grid gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <style>{`@keyframes stepPulse{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#8AB4F8]"
                style={{ animation: `stepPulse 1.4s ${i * 0.35}s ease-in-out infinite` }}
              />
              <span className="text-sm text-[#C4C7CC]">{s}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#9AA0A6] mt-6 leading-6">
          تولید محتوای باکیفیت معمولاً بین ۲۰ تا ۶۰ ثانیه طول می‌کشد. لطفاً صفحه را نبندید.
        </p>
      </div>
    </div>
  )
}
