import type { DeckJSON, DeckSlide } from '@/lib/deck-types'
import { isValidDeck } from '@/lib/deck-types'
import { aiMode, ZAI_HTTP_BASE, ZAI_HTTP_MODEL } from '@/lib/mode'

/* ─────────────────────────────────────────────────────────────
 * Two AI transports, chosen automatically by env:
 *  - "http": real Z.ai API with ZAI_API_KEY (Vercel / production)
 *            OpenAI-compatible endpoint, e.g.
 *            https://api.z.ai/api/paas/v4/chat/completions (glm-4.6)
 *  - "sdk" : bundled z-ai-web-dev-sdk (zero-config dev sandbox)
 * ───────────────────────────────────────────────────────────── */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionResult {
  content: string
}

async function callZaiHttp(messages: ChatMessage[]): Promise<CompletionResult> {
  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY تنظیم نشده است.')
  const res = await fetch(`${ZAI_HTTP_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: ZAI_HTTP_MODEL,
      messages,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      `خطای سرویس Z.ai (کد ${res.status}). کلید API و اعتبار حساب را بررسی کنید. ${detail.slice(0, 160)}`
    )
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return { content: data.choices?.[0]?.message?.content ?? '' }
}

async function callZaiSdk(messages: ChatMessage[]): Promise<CompletionResult> {
  const { default: ZAI } = await import('z-ai-web-dev-sdk')
  const zai = await ZAI.create()
  const completion = await zai.chat.completions.create({
    messages: messages as unknown as Parameters<typeof zai.chat.completions.create>[0]['messages'],
    thinking: { type: 'disabled' },
  })
  return { content: completion.choices[0]?.message?.content ?? '' }
}

async function chat(messages: ChatMessage[]): Promise<string> {
  const result = aiMode() === 'http' ? await callZaiHttp(messages) : await callZaiSdk(messages)
  const content = result.content
  if (!content || !content.trim()) throw new Error('پاسخ خالی از مدل هوش مصنوعی.')
  return content
}

export interface GenerateOptions {
  topic: string
  audience?: string
  slideCount: number
  tone: string // رسمی، آموزشی، خلاقانه، ...
  language: 'fa' | 'en'
}

/* ── Prompt engineering ── */

function systemPrompt(lang: 'fa' | 'en'): string {
  const fa = `تو یک طراح حرفه‌ای ارائه (پرزنتیشن) هستی که محتوای ساختاریافته برای اسلایدهای HTML تولید می‌کنی.
خروجی تو باید «فقط و فقط» یک شیء JSON معتبر باشد — بدون هیچ متن اضافه، بدون markdown، بدون بک‌تیک.
قوانین محتوایی:
- زبان محتوا: فارسی روان و حرفه‌ای.
- اسلاید اول حتماً type آن "cover" و اسلاید آخر حتماً "conclusion" باشد.
- عنوان‌ها کوتاه و قدرتمند (حداکثر ۶۰ کاراکتر)، متن‌ها مختصر و مناسب اسلاید باشند (هر متن حداکثر ۲۴۰ کاراکتر).
- از اعداد و آمار واقع‌گرایانه استفاده کن و در اسلاید stats مقدارها کوتاه باشند (مثل ۷۵٪ یا ۱.۲ میلیون).
- بین ۵ تا ۸ آیتم در هر لیست قرار بده (نه بیشتر).

ساختار دقیق JSON:
{
  "title": "عنوان کل ارائه",
  "subtitle": "زیرعنوان یک‌خطی",
  "author": "نام ارائه‌دهنده یا خالی",
  "language": "fa",
  "slides": [
    { "type": "cover", "badge": "برچسب کوتاه بالای عنوان", "title": "عنوان اصلی بزرگ", "subtitle": "توضیح یک تا دو خطی", "author": "نام", "date": "تاریخ یا سال" },
    { "type": "agenda", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "items": ["موضوع ۱", "موضوع ۲"] },
    { "type": "bullets", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "items": [{ "title": "تیتر آیتم", "text": "توضیح ۱-۲ جمله‌ای" }] },
    { "type": "two-column", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "columns": [{ "heading": "سرستون", "items": ["آیتم"] }, { "heading": "سرستون", "items": ["آیتم"] }] },
    { "type": "stats", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "stats": [{ "value": "۷۵٪", "label": "برچسب", "hint": "توضیح کوتاه" }], "footnote": "جمع‌بندی کوتاه" },
    { "type": "quote", "quote": "نقل‌قول تاثیرگذار مرتبط با موضوع", "author": "گوینده", "role": "سمت" },
    { "type": "timeline", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "steps": [{ "label": "۱", "title": "عنوان مرحله", "text": "توضیح کوتاه" }] },
    { "type": "conclusion", "title": "عنوان پایانی", "points": ["نکته کلیدی ۱", "نکته کلیدی ۲"], "cta": "دعوت به اقدام کوتاه" }
  ]
}
انواع اسلاید را متنوع و هوشمندانه انتخاب کن؛ برای موضوعات آماری از stats، برای مقایسه از two-column و برای روند تاریخی از timeline استفاده کن. فقط JSON برگردان.`
  const en = `You are a professional presentation designer producing structured content for HTML slides.
Return ONLY a valid JSON object — no extra text, no markdown, no backticks.
Rules: short powerful titles (max 60 chars), concise slide copy (max 240 chars per text), 5-8 items per list, realistic statistics.
First slide must be type "cover", last must be "conclusion".
JSON shape:
{ "title": "...", "subtitle": "...", "author": "...", "language": "en", "slides": [ { "type": "cover" | "agenda" | "bullets" | "two-column" | "stats" | "quote" | "timeline" | "conclusion", ... } ] }
Slide type fields: cover{badge,title,subtitle,author,date}, agenda{kicker,title,items[]}, bullets{kicker,title,items[{title,text}]}, two-column{kicker,title,columns[{heading,items[]}]}, stats{kicker,title,stats[{value,label,hint}],footnote}, quote{quote,author,role}, timeline{kicker,title,steps[{label,title,text}]}, conclusion{title,points[],cta}.
Return JSON only.`
  return lang === 'fa' ? fa : en
}

function userPrompt(opts: GenerateOptions): string {
  const audience = opts.audience?.trim()
  const fa = `موضوع ارائه: «${opts.topic}»
تعداد اسلایدها: دقیقاً ${opts.slideCount} اسلاید.
${audience ? `مخاطب: ${audience}.` : ''}
لحن ارائه: ${opts.tone}.
برای این موضوع یک ارائه کامل و حرفه‌ای طراحی کن.`
  const en = `Presentation topic: "${opts.topic}"
Number of slides: exactly ${opts.slideCount}.
${audience ? `Audience: ${audience}.` : ''}
Tone: ${opts.tone}.
Design a complete professional deck.`
  return opts.language === 'fa' ? fa : en
}

/* ── Robust JSON extraction ── */

export function extractJSON(text: string): unknown {
  let t = text.trim()
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  // 1) whole text might be pure JSON
  try {
    return JSON.parse(t)
  } catch {
    /* fall through */
  }
  // 2) slice the outermost braces
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('پاسخ مدل JSON معتبر نبود.')
  const slice = t.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    // 3) last resort: progressively try balanced-object candidates
    for (let i = start; i < end; i++) {
      if (t[i] !== '{') continue
      const cand = t.slice(i, end + 1)
      try {
        return JSON.parse(cand)
      } catch {
        /* keep looking */
      }
    }
    throw new Error('پاسخ مدل JSON معتبر نبود.')
  }
}

/* ── Normalization: keep AI output within safe layout bounds ── */

const MAX_TEXT = 260

function cut(v: unknown, max: number = MAX_TEXT): string {
  return String(v ?? '').trim().slice(0, max)
}

function normSlide(raw: Record<string, unknown>): DeckSlide | null {
  const type = String(raw.type ?? '')
  switch (type) {
    case 'cover':
      return {
        type: 'cover',
        badge: cut(raw.badge, 40) || undefined,
        title: cut(raw.title, 90),
        subtitle: cut(raw.subtitle, 200) || undefined,
        author: cut(raw.author, 60) || undefined,
        date: cut(raw.date, 40) || undefined,
      }
    case 'agenda':
      return {
        type: 'agenda',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        items: Array.isArray(raw.items) ? raw.items.slice(0, 8).map((i) => cut(i, 90)).filter(Boolean) : [],
      }
    case 'bullets':
      return {
        type: 'bullets',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        items: Array.isArray(raw.items)
          ? raw.items.slice(0, 6).map((it) => {
              const o = (it ?? {}) as Record<string, unknown>
              return { title: cut(o.title, 60) || undefined, text: cut(o.text, 240) }
            }).filter((i) => i.text)
          : [],
      }
    case 'two-column':
      return {
        type: 'two-column',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        columns: Array.isArray(raw.columns)
          ? raw.columns.slice(0, 2).map((c) => {
              const o = (c ?? {}) as Record<string, unknown>
              return {
                heading: cut(o.heading, 50),
                items: Array.isArray(o.items) ? o.items.slice(0, 6).map((i) => cut(i, 110)).filter(Boolean) : [],
              }
            })
          : [],
      }
    case 'stats':
      return {
        type: 'stats',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        stats: Array.isArray(raw.stats)
          ? raw.stats.slice(0, 4).map((st) => {
              const o = (st ?? {}) as Record<string, unknown>
              return { value: cut(o.value, 14), label: cut(o.label, 60), hint: cut(o.hint, 90) || undefined }
            }).filter((s) => s.value)
          : [],
        footnote: cut(raw.footnote, 170) || undefined,
      }
    case 'quote':
      return {
        type: 'quote',
        quote: cut(raw.quote, 240),
        author: cut(raw.author, 60) || undefined,
        role: cut(raw.role, 70) || undefined,
      }
    case 'timeline':
      return {
        type: 'timeline',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        steps: Array.isArray(raw.steps)
          ? raw.steps.slice(0, 5).map((st) => {
              const o = (st ?? {}) as Record<string, unknown>
              return { label: cut(o.label, 6) || '•', title: cut(o.title, 60), text: cut(o.text, 130) }
            }).filter((s) => s.title)
          : [],
      }
    case 'conclusion':
      return {
        type: 'conclusion',
        title: cut(raw.title, 80),
        points: Array.isArray(raw.points) ? raw.points.slice(0, 5).map((p) => cut(p, 120)).filter(Boolean) : [],
        cta: cut(raw.cta, 70) || undefined,
      }
    default:
      return null
  }
}

export function normalizeDeck(value: unknown, language: 'fa' | 'en'): DeckJSON | null {
  if (!isValidDeck(value)) return null
  const raw = value as DeckJSON
  const slides = raw.slides
    .map((s) => normSlide(s as unknown as Record<string, unknown>))
    .filter((s): s is DeckSlide => s !== null)
    .filter((s) => {
      if (s.type === 'agenda') return s.items.length >= 2
      if (s.type === 'bullets') return s.items.length >= 1
      if (s.type === 'two-column') return s.columns.length === 2 && s.columns.every((c) => c.items.length >= 1)
      if (s.type === 'stats') return s.stats.length >= 2
      if (s.type === 'quote') return s.quote.length > 0
      if (s.type === 'timeline') return s.steps.length >= 2
      if (s.type === 'conclusion') return s.points.length >= 1
      return true
    })
  if (slides.length < 2) return null
  const cover = slides[0].type === 'cover' ? slides[0] : null
  const title = cover && 'title' in cover ? cover.title : raw.title
  return {
    title: cut(title, 120) || (language === 'fa' ? 'ارائه بدون عنوان' : 'Untitled deck'),
    subtitle: cut(raw.subtitle, 200) || undefined,
    author: cut(raw.author, 80) || undefined,
    language: raw.language === 'en' ? 'en' : language,
    slides,
  }
}

/* ── Z.ai call ── */

export async function generateDeckWithAI(opts: GenerateOptions): Promise<DeckJSON> {
  let lastErr: unknown
  // one retry: LLM output can occasionally break JSON structure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const content = await chat([
        { role: 'system', content: systemPrompt(opts.language) },
        { role: 'user', content: userPrompt(opts) },
      ])

      let deck = normalizeDeck(extractJSON(content), opts.language)
      if (!deck) throw new Error('ساختار ارائه تولیدشده معتبر نبود. دوباره تلاش کنید.')

      // Ensure the count roughly matches the request (trim extras)
      if (deck.slides.length > opts.slideCount + 2) {
        deck = { ...deck, slides: deck.slides.slice(0, Math.max(3, opts.slideCount)) }
      }
      return deck
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('تولید پرزنتیشن ناموفق بود. لطفاً دوباره تلاش کنید.')
}
