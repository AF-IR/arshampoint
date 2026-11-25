import type { DeckJSON, DeckSlide } from '@/lib/deck-types'
import { isValidDeck, isDeckIcon, DECK_ICONS } from '@/lib/deck-types'
import { aiMode, aiApiKeys, ZAI_HTTP_BASE, ZAI_HTTP_MODEL } from '@/lib/mode'

/* ─────────────────────────────────────────────────────────────
 * Two AI transports, chosen automatically by env:
 *  - "http": real AI service API with ZAI_API_KEY (Vercel / production)
 *            OpenAI-compatible endpoint — ZAI_API_KEY accepts ONE key or
 *            a pool of keys separated by parentheses: "(k1)(k2)(k3)"
 *  - "sdk" : bundled z-ai-web-dev-sdk (zero-config dev sandbox)
 *
 * پیام‌های خطا همیشه نام «موتور هوش مصنوعی آرشام پوینت» یا «سرور» را
 * می‌بینند — نام سرویس زیرین به کاربر نهایی لو داده نمی‌شود.
 * ───────────────────────────────────────────────────────────── */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionResult {
  content: string
}

/* پیام فارسی برای خطای وضعیت HTTP — بدون نام سرویس زیرین؛ جزئیات فنی فقط در لاگ سرور */
function aiStatusError(status: number): Error {
  if (status === 429)
    return new Error('سرورهای موتور هوش مصنوعی آرشام پوینت در این لحظه شلوغ است؛ چند لحظه بعد دوباره امتحان کنید.')
  if (status === 401 || status === 402 || status === 403)
    return new Error('اعتبار سرویس هوش مصنوعی آرشام پوینت در دسترس نیست؛ لطفاً از صفحه «تماس با ما» به تیم خبر دهید.')
  return new Error(`ارتباط با موتور هوش مصنوعی آرشام پوینت برقرار نشد (کد ${status}). لطفاً دوباره تلاش کنید.`)
}

/* خطای قابل‌تلاش‌مجدد: کلید نامعتبر/باطل‌شده (۴۰۱)، محدودیت نرخ، سهمیه،
 * خطای سرور یا قطعی شبکه — در همه این حالت‌ها کلید بعدی استخر امتحان می‌شود
 * (رفتار مستند در README)؛ فقط خطاهای غیرکلیدی مثل ۴۰۰ همان‌جا شکست می‌خورد */
function retryableHttpError(status: number): Error & { retryable: boolean } {
  const e = aiStatusError(status) as Error & { retryable: boolean }
  e.retryable = status === 429 || status === 401 || status === 402 || status === 403 || status >= 500
  return e
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function callOnceHttp(apiKey: string, messages: ChatMessage[]): Promise<CompletionResult> {
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
      /* ارائه‌های ۹ تا ۱۴ اسلایدی JSON بزرگ می‌سازند؛ بدون این سقف،
       * خروجی وسط JSON قطع می‌شد و ساختار نامعتبر می‌شد (باگ «بیش از ۸ اسلاید کار نمی‌کند») */
      max_tokens: 8192,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    /* جزئیات فنی فقط در لاگ سرور — آخر کلید برای تشخیص کدام کلید مشکل داشت */
    console.error(`[deck-ai] HTTP ${res.status} با کلید …${apiKey.slice(-4)}: ${detail.slice(0, 300)}`)
    throw retryableHttpError(res.status)
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return { content: data.choices?.[0]?.message?.content ?? '' }
}

/* فراخوانی HTTP با استخر کلیدها: شروع از یک کلید رندوم (تقسیم بار بین
 * تیم‌های همزمان) و در خطای سهمیه/شلوغی/کلید باطل، کلید بعدی — تا آخر استخر.
 * (برای تست‌های واحد failover در scripts/test-key-pool.ts export شده است) */
export async function callZaiHttp(messages: ChatMessage[]): Promise<CompletionResult> {
  const keys = aiApiKeys()
  if (!keys.length)
    throw new Error('کلید سرویس هوش مصنوعی تنظیم نشده است — متغیر ZAI_API_KEY را در تنظیمات سرور پر کنید.')
  const start = Math.floor(Math.random() * keys.length)
  let lastErr: unknown
  for (let i = 0; i < keys.length; i++) {
    const key = keys[(start + i) % keys.length]
    try {
      return await callOnceHttp(key, messages)
    } catch (err) {
      lastErr = err
      const retryable = (err as { retryable?: boolean })?.retryable === true
      const network = err instanceof TypeError /* fetch failed / timeout */
      if (!retryable && !network) throw err
      if (i < keys.length - 1) await sleep(600 * (i + 1)) /* بک‌آف کوتاه قبل از کلید بعدی */
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('ارتباط با موتور هوش مصنوعی آرشام پوینت برقرار نشد. لطفاً دوباره تلاش کنید.')
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
  if (!content || !content.trim())
    throw new Error('موتور هوش مصنوعی آرشام پوینت پاسخ خالی برگرداند؛ لطفاً دوباره تلاش کنید.')
  return content
}

export interface GenerateOptions {
  topic: string
  audience?: string
  slideCount: number
  tone: string // رسمی، آموزشی، خلاقانه، ...
  language: 'fa' | 'en'
  /* حالت بصری: offline = بدون تصویر خارجی (آیکون/نمودار)،
   * image = درج تصویر به‌صورت لینک داخل اسلایدها */
  visualMode: 'offline' | 'image'
  /* لینک تصاویر اختیاری کاربر — در حالت image فقط از همین‌ها استفاده می‌شود */
  imageLinks?: string[]
  /* انواع اسلاید در اولویت (ویژه پلن حرفه‌ای — انتخاب دستی ترکیب اسلایدها) */
  preferredLayouts?: string[]
}

/* ── چیدمان قطعی اسلایدها (رفع باگ «بیش از ۸ اسلاید») ──
 * به‌جای اینکه فقط بگوییم «دقیقاً N اسلاید بساز»، خودمان دقیقاً N اسلاید را
 * تیپ‌به‌تیپ برنامه‌ریزی می‌کنیم و از مدل فقط محتوای هر اسلاید را می‌خواهیم.
 * مزیت‌ها:
 *   ۱) تعداد تضمین می‌شود (مدل نمی‌تواند کم یا زیاد کند)
 *   ۲) تنوع چیدمان تضمین می‌شود — هیچ دو اسلاید پشت‌سرِهم هم‌نوع نیستند
 *   ۳) با هش موضوع، ترکیب از نقطه‌ای متفاوت شروع می‌شود؛ دو موضوع متفاوت
 *      دو ساختار متفاوت می‌گیرند (ارائه‌ها شبیه هم نمی‌شوند)
 *   ۴) اولویت کاربر حرفه‌ای (preferredLayouts) در قلب چیدمان می‌نشیند */
export function topicSeed(topic: string): number {
  let h = 0
  const t = topic ?? ''
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
  return h
}

export function planSlideTypes(
  slideCount: number,
  visualMode: 'offline' | 'image',
  seed: number,
  preferredLayouts?: string[],
): string[] {
  const n = Math.max(1, Math.min(14, Math.floor(slideCount) || 8))
  const plan: string[] = ['cover']
  const hasAgenda = n >= 5
  if (hasAgenda) plan.push('agenda')
  const mid = n - 2 - (hasAgenda ? 1 : 0) /* تعداد اسلایدهای میانی */

  /* جداکننده بخش برای ارائه‌های بلند — ریتم بصری می‌سازد */
  const sections = mid >= 9 ? 2 : mid >= 6 ? 1 : 0
  /* اسلاید تصویر تمام‌عرض فقط در حالت تصویری */
  const images = visualMode === 'image' ? (mid >= 8 ? 2 : mid >= 5 ? 1 : 0) : 0
  const coreCount = Math.max(0, mid - sections - images)

  /* استخر چرخشی انواع میانی — bullets ستون فقرات است، انواع دیگر بین آن‌ها */
  const baseCore =
    visualMode === 'image'
      ? ['bullets', 'two-column', 'stats', 'comparison', 'bullets', 'timeline', 'stats', 'bullets', 'two-column', 'timeline', 'comparison', 'quote']
      : ['bullets', 'stats', 'two-column', 'bullets', 'comparison', 'timeline', 'stats', 'quote', 'bullets', 'two-column', 'timeline', 'comparison']

  /* اولویت کاربر (پلن حرفه‌ای): انواع انتخابی قلب چیدمان را می‌سازند.
   * با ۲ نوع و بیشتر، بین آن‌ها می‌چرخیم؛ با ۱ نوع، با bullets تناوب می‌کنیم. */
  const pref = (preferredLayouts ?? []).filter((t, i, arr) => arr.indexOf(t) === i)
  const core =
    pref.length >= 2
      ? Array.from({ length: Math.max(coreCount, 2) }, (_, i) => pref[i % pref.length])
      : pref.length === 1
        ? Array.from({ length: Math.max(coreCount, 2) }, (_, i) =>
            i % 2 === 0 ? pref[0] : pref[0] === 'bullets' ? 'two-column' : 'bullets'
          )
        : baseCore

  const picked: string[] = []
  let i = Math.abs(seed) % core.length
  let guard = 0
  while (picked.length < coreCount && guard < coreCount * 20 + 40) {
    guard++
    const t = core[i % core.length]
    i++
    if (picked.length && picked[picked.length - 1] === t) continue
    picked.push(t)
  }
  while (picked.length < coreCount) picked.push('bullets') /*Safety valve */

  /* درج جداکننده‌ها و اسلایدهای تصویری در موقعیت‌های نسبی —
   * از انتها درج می‌کنیم تا ایندکس‌های قبلی جابه‌جا نشوند؛
   * اگر همسایه هم‌نوع بود، یک جای جلوتر می‌نشینیم */
  const slots: [number, string][] = []
  if (sections >= 1) slots.push([Math.max(1, Math.floor(picked.length / 3)), 'section'])
  if (sections >= 2) slots.push([Math.max(3, Math.floor((picked.length * 2) / 3)), 'section'])
  if (images >= 1) slots.push([Math.max(0, Math.floor(picked.length * 0.55)), 'image'])
  if (images >= 2) slots.push([Math.max(1, Math.floor(picked.length * 0.85)), 'image'])
  slots.sort((a, b) => b[0] - a[0])
  for (const [pos, type] of slots) {
    let p = pos
    while (p < picked.length && (picked[p] === type || (p > 0 && picked[p - 1] === type))) p++
    picked.splice(Math.min(p, picked.length), 0, type)
  }

  plan.push(...picked)
  /* ارائه تک‌اسلایدی = فقط جلد؛ از ۲ اسلاید به بالا جمع‌بندی اضافه می‌شود */
  if (n >= 2) plan.push('conclusion')
  return plan
}

/* فهرست خوانا برای پرامپت — با راهنمای محتوای هر نوع */
const PLAN_HINTS_FA: Record<string, string> = {
  cover: 'جلد — badge کوتاه، title بزرگ، subtitle، date',
  agenda: 'فهرست مطالب — ۵ تا ۷ موضوع اصلی ارائه',
  bullets: 'نکات کلیدی — ۳ تا ۵ آیتم با تیتر، توضیح ۱-۲ جمله‌ای و نماد مفهومی',
  'two-column': 'دو ستونی — دو دسته مفهوم مکمل با سرستون و ۳ تا ۵ آیتم در هر ستون',
  comparison: 'مقایسه دو ستونی — مزایا/معایب یا روش ۱ در برابر روش ۲ (۳ تا ۴ نکته هر طرف)',
  stats: 'آمار و ارقام — ۳ تا ۴ عدد کلیدی با برچسب و توضیح مقیاس/بازه',
  quote: 'نقل‌قول تاثیرگذار مرتبط با موضوع + گوینده و سمت او',
  timeline: 'گام‌های زمانی — ۳ تا ۵ مرحله با شماره، عنوان و توضیح کوتاه',
  section: 'جداکننده بخش — عنوان بزرگ فصل بعد + یک جمله معرفی',
  image: 'تصویر تمام‌عرض — عنوان، لینک تصویر مرتبط و توضیح دو جمله‌ای',
  conclusion: 'جمع‌بندی — ۳ تا ۵ نکته اقدام‌پذیر + دعوت به اقدام',
}
const PLAN_HINTS_EN: Record<string, string> = {
  cover: 'cover — short badge, big title, subtitle, date',
  agenda: 'agenda — 5-7 main topics of the talk',
  bullets: 'key points — 3-5 items with a title, 1-2 sentence text and a semantic icon',
  'two-column': 'two columns — two complementary groups, heading + 3-5 items each',
  comparison: 'side-by-side comparison — pros/cons or option 1 vs option 2',
  stats: 'key numbers — 3-4 stats with labels and scale/timeframe',
  quote: 'an impactful topic-related quote with author and role',
  timeline: 'timeline — 3-5 numbered steps with title and short text',
  section: 'section divider — big title of the next chapter + one intro line',
  image: 'full-bleed image slide — title, topical image URL, short text',
  conclusion: 'wrap-up — 3-5 actionable takeaways + call to action',
}

function planListFa(plan: string[]): string {
  const fa = (x: number) => String(x).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
  return plan.map((t, i) => `${fa(i + 1)}. ${t} — ${PLAN_HINTS_FA[t] ?? t}`).join('\n')
}
function planListEn(plan: string[]): string {
  return plan.map((t, i) => `${i + 1}. ${t} — ${PLAN_HINTS_EN[t] ?? t}`).join('\n')
}

/* ── Prompt engineering ── */

const IMAGE_SCHEMA_FA = `
- در حالت تصویری، فیلد اختیاری "image" (لینک کامل تصویر https) برای اسلایدهای cover و bullets (هر آیتم) مجاز است و نوع اسلاید جدید "image" هم در دسترس است:
    { "type": "image", "kicker": "برچسب", "title": "عنوان", "image": "لینک تصویر", "caption": "زیرنویس تصویر", "text": "توضیح یک دو جمله‌ای" }
- لینک‌های تصویر باید از لیست لینک‌های داده‌شده انتخاب شوند؛ اگر لیست خالی بود، برای هر اسلاید لینکی مرتبط بساز: https://loremflickr.com/800/500/<کلیدواژه‌های انگلیسی> — کلیدواژه‌ها باید دقیقاً مرتبط با محتوای همان اسلاید باشند (۱ تا ۳ واژه انگلیسی عام و پرتکرار جدا با کاما، مثل technology,classroom یا solar,panels یا medical,hospital). برای ارائه ۸ اسلاید به بالا حداقل ۲ اسلاید از نوع image بساز.`

const ICON_SCHEMA_FA = `
- برای هر آیتم bullets می‌توانی فیلد اختیاری "icon" بگذاری؛ کلیدهای مجاز فقط این‌ها هستند: ${DECK_ICONS.join(', ')} — نماد باید با مفهوم همان آیتم هم‌خوان باشد (مثل clock برای زمان، users برای تیم، shield برای امنیت). در هر اسلاید حداقل نیمی از آیتم‌ها نماد داشته باشند.`

function systemPrompt(lang: 'fa' | 'en', visualMode: 'offline' | 'image' = 'offline'): string {
  const imageFa = visualMode === 'image' ? IMAGE_SCHEMA_FA : ''
  const iconFa = ICON_SCHEMA_FA
  const imageEn =
    visualMode === 'image'
      ? `\n- In image mode, an optional "image" field (full https image URL) is allowed on cover and bullets slides, and a new slide type "image" is available: { "type": "image", "kicker": "...", "title": "...", "image": "https://...", "caption": "...", "text": "..." }. Use ONLY the provided image links; if the list is empty build https://loremflickr.com/800/500/<english-keywords> URLs with 1-3 broad topical keywords per slide (comma-separated, e.g. technology,classroom). For decks of 8+ slides include at least 2 "image" slides.`
      : '\n- ABSOLUTELY NO external images, no "image" fields, no <img>, no image URLs — slides use text, inline SVG icons, shapes and charts only.'
  const iconEn = `\n- Each bullets item may carry an optional "icon" key chosen ONLY from: ${DECK_ICONS.join(', ')}. Match the icon to the item meaning; give icons to at least half the items of every bullets slide.`
  const fa = `تو یک طراح حرفه‌ای ارائه (پرزنتیشن) هستی که محتوای ساختاریافته برای اسلایدهای HTML تولید می‌کنی.
خروجی تو باید «فقط و فقط» یک شیء JSON معتبر باشد — بدون هیچ متن اضافه، بدون markdown، بدون بک‌تیک.
قوانین محتوایی:
- زبان محتوا: فارسی روان و حرفه‌ای.
- اسلاید اول حتماً type آن "cover" و اسلاید آخر حتماً "conclusion" باشد.
- عنوان‌ها کوتاه و قدرتمند (حداکثر ۶۰ کاراکتر)، متن‌ها مختصر و مناسب اسلاید باشند (هر متن حداکثر ۲۴۰ کاراکتر) و جمله کامل باشند.
- از اعداد و آمار واقع‌گرایانه استفاده کن و در اسلاید stats مقدارها کوتاه باشند (مثل ۷۵٪ یا ۱.۲ میلیون). آمار باید با موضوع سازگار و قابل دفاع باشد و مقیاس/بازه زمانی داشته باشد.
- محتوا باید عمیق، تخصصی و غیرکلیشه‌ای باشد؛ هر اسلاید زاویه جدیدی از موضوع را پوشش دهد، نه تکرار اسلاید قبلی. از جملات کلی و توخالی مثل «نقش مهمی دارد» پرهیز کن.
- در bullets، متن هر آیتم یک تا دو جمله کامل و اطلاع‌رسان باشد و جزئیات مشخص بیاورد (مکانیزم، مثال، عدد یا کاربرد) — نه تکرار تیتر در جمله بلندتر.
- kicker هر اسلاید نام واقعی همان بخش ارائه است (مثل «تعریف و مفاهیم پایه» یا «چالش‌ها»)، نه تکرار عنوان اسلاید.
- در conclusion، نکات جمع‌بندی باید اقدام‌پذیر و مخصوص همین موضوع باشند و cta یک دعوت مشخص و عملی.
- بین ۵ تا ۸ آیتم در هر لیست قرار بده (نه بیشتر).${iconFa}${imageFa}

انتخاب انواع اسلاید:
- ترکیب انواع اسلاید را «متناسب با موضوع» انتخاب کن: موضوع آماری → stats، موضوع دو قطبی یا مزایا/معایب → comparison، روند تاریخی یا مراحل → timeline، فهرست محور → agenda + bullets.
- دو اسلاید پشت سر هم هم‌نوع نباشند و از کل منوی انواع (agenda, bullets, two-column, comparison, section, stats, quote, timeline) بهره ببر تا ارائه یکنواخت نشود.

ساختار دقیق JSON:
{
  "title": "عنوان کل ارائه",
  "subtitle": "زیرعنوان یک‌خطی",
  "language": "fa",
  "slides": [
    { "type": "cover", "badge": "برچسب کوتاه بالای عنوان", "title": "عنوان اصلی بزرگ", "subtitle": "توضیح یک تا دو خطی", "date": "تاریخ یا سال" },
    { "type": "agenda", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "items": ["موضوع ۱", "موضوع ۲"] },
    { "type": "bullets", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "items": [{ "title": "تیتر آیتم", "text": "توضیح ۱-۲ جمله‌ای", "icon": "کلید نماد" }] },
    { "type": "two-column", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "columns": [{ "heading": "سرستون", "items": ["آیتم"] }, { "heading": "سرستون", "items": ["آیتم"] }] },
    { "type": "comparison", "kicker": "برچسب بخش", "title": "عنوان مقایسه", "left": { "heading": "مزایا", "points": ["نکته ۱", "نکته ۲"] }, "right": { "heading": "معایب", "points": ["نکته ۱", "نکته ۲"] } },
    { "type": "section", "kicker": "برچسب فصل", "title": "عنوان بزرگ بخش", "subtitle": "یک جمله معرفی بخش" },
    { "type": "stats", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "stats": [{ "value": "۷۵٪", "label": "برچسب", "hint": "توضیح کوتاه" }], "footnote": "جمع‌بندی کوتاه" },
    { "type": "quote", "quote": "نقل‌قول تاثیرگذار مرتبط با موضوع", "author": "گوینده", "role": "سمت" },
    { "type": "timeline", "kicker": "برچسب بخش", "title": "عنوان اسلاید", "steps": [{ "label": "۱", "title": "عنوان مرحله", "text": "توضیح کوتاه" }] },
    { "type": "conclusion", "title": "عنوان پایانی", "points": ["نکته کلیدی ۱", "نکته کلیدی ۲"], "cta": "دعوت به اقدام کوتاه" }
  ]
}
انواع اسلاید را متنوع و هوشمندانه انتخاب کن؛ برای موضوعات آماری از stats، برای مقایسه یا مزایا/معایب از comparison، برای روند تاریخی از timeline، و در ارائه‌های ۹ اسلاید به بالا یکی دو اسلاید section برای جدا کردن فصل‌ها بگذار. نام تهیه‌کنندگان یا اعضا را از خودت نساز — اگر کاربر نام اعضا داده باشد، سیستم به‌صورت خودکار روی جلد و اسلاید پایانی درج می‌کند. فقط JSON برگردان.`
  const en = `You are a professional presentation designer producing structured content for HTML slides.
Return ONLY a valid JSON object — no extra text, no markdown, no backticks.
Rules: short powerful titles (max 60 chars), concise slide copy (max 240 chars per text), 5-8 items per list, realistic statistics with scale/timeframe, non-repetitive coverage. Avoid generic filler; every bullets item must be 1-2 full informative sentences with concrete details (mechanism, example, figure or use case), never a restatement of its title. Kickers name the real section of the talk (e.g. "Key concepts", "Challenges"). Conclusion points must be actionable and topic-specific. Do not invent presenter or member names — the system adds them automatically when provided.${iconEn}${imageEn}
Slide-type mix: choose types that fit the topic (stats for numbers, comparison for pros/cons, timeline for history); never place two consecutive slides of the same type; draw from the full menu.
JSON shape:
{ "title": "...", "subtitle": "...", "language": "en", "slides": [ { "type": "cover" | "agenda" | "bullets" | "two-column" | "comparison" | "section" | "stats" | "quote" | "timeline" | "conclusion" | "image", ... } ] }
Slide type fields: cover{badge,title,subtitle,date}, agenda{kicker,title,items[]}, bullets{kicker,title,items[{title,text,icon}]}, two-column{kicker,title,columns[{heading,items[]}]}, comparison{kicker,title,left{heading,points[]},right{heading,points[]}}, section{kicker,title,subtitle}, stats{kicker,title,stats[{value,label,hint}],footnote}, quote{quote,author,role}, timeline{kicker,title,steps[{label,title,text}]}, conclusion{title,points[],cta}, image{kicker,title,image,caption,text}.
Use comparison for pros/cons, timeline for history, section dividers for 9+ slide decks. Return JSON only.`
  return lang === 'fa' ? fa : en
}

function userPrompt(opts: GenerateOptions, plan: string[]): string {
  const audience = opts.audience?.trim()
  const layoutsFa = opts.preferredLayouts?.length
    ? `انواع اسلاید در اولویت کاربر: ${opts.preferredLayouts.join('، ')} — این انواع در چیدمان قطعی پایین از پیش گنجانده شده‌اند و باید با محتوای واقعی و عمیق پر شوند.`
    : ''
  const layoutsEn = opts.preferredLayouts?.length
    ? `User-priority slide types: ${opts.preferredLayouts.join(', ')} — they are already baked into the definitive plan below; fill them with real, deep content.`
    : ''
  const imageNoteFa =
    opts.visualMode === 'image'
      ? opts.imageLinks && opts.imageLinks.length > 0
        ? `حالت تصویری فعال است. فقط از این لینک‌های تصویر استفاده کن (به ترتیب، هر لینک حداکثر یک‌بار):
${opts.imageLinks.map((u, i) => `${i + 1}. ${u}`).join('\n')}`
        : 'حالت تصویری فعال است؛ برای اسلایدهای cover، image و بخشی از bullets لینک تصویر مرتبط بساز.'
      : 'حالت آفلاین/متنی فعال است: هیچ تصویر خارجی درج نکن.'
  const imageNoteEn =
    opts.visualMode === 'image'
      ? opts.imageLinks && opts.imageLinks.length > 0
        ? `Image mode is ON. Use ONLY these image links (in order, each at most once):
${opts.imageLinks.map((u, i) => `${i + 1}. ${u}`).join('\n')}`
        : 'Image mode is ON; build topical image URLs for cover, image and some bullets slides.'
      : 'Offline/text mode is ON: include NO external images.'
  const fa = `موضوع ارائه: «${opts.topic}»
تعداد اسلایدها: دقیقاً ${plan.length} اسلاید.
چیدمان قطعی اسلایدها — تعداد، نوع و ترتیب اسلایدها عیناً مطابق این فهرست باشد و هیچ اسلایدی کم یا زیاد نشود:
${planListFa(plan)}
${audience ? `مخاطب: ${audience}.` : ''}
لحن ارائه: ${opts.tone}.
${imageNoteFa}
${layoutsFa}
برای هر اسلاید از این فهرست محتوای کامل و حرفه‌ای بنویس؛ نوع و ترتیب هیچ اسلایدی را عوض نکن. فقط JSON برگردان.`
  const en = `Presentation topic: "${opts.topic}"
Number of slides: exactly ${plan.length}.
Definitive slide plan — the count, type and order of slides MUST follow this list exactly; do not add or drop any slide:
${planListEn(plan)}
${audience ? `Audience: ${audience}.` : ''}
Tone: ${opts.tone}.
${imageNoteEn}
${layoutsEn}
Write complete professional content for every slide in the plan; never change a slide's type or position. Return JSON only.`
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

/* لینک تصویر امن — فقط http(s)، حداکثر ۵۰۰ کاراکتر، بدون نویسه خطرناک */
function safeImageUrl(v: unknown): string | undefined {
  const s = String(v ?? '').trim()
  if (!s || s.length > 500) return undefined
  if (!/^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/i.test(s)) return undefined
  return s
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
        /* نام ارائه‌دهنده/اعضا دیگر پذیرفته نمی‌شود */
        date: cut(raw.date, 40) || undefined,
        image: safeImageUrl(raw.image),
        imageCaption: cut(raw.imageCaption ?? raw.caption, 120) || undefined,
      }
    case 'image': {
      const img = safeImageUrl(raw.image)
      if (!img) return null // image slide without a valid image is useless
      return {
        type: 'image',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        image: img,
        caption: cut(raw.caption, 140) || undefined,
        text: cut(raw.text, 220) || undefined,
      }
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
              return {
                title: cut(o.title, 60) || undefined,
                text: cut(o.text, 240),
                image: safeImageUrl(o.image),
                icon: isDeckIcon(o.icon) ? o.icon : undefined,
              }
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
    case 'section':
      return {
        type: 'section',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 90),
        subtitle: cut(raw.subtitle, 160) || undefined,
      }
    case 'comparison': {
      /* مدل ممکن است points یا items بنویسد — هر دو پذیرفته می‌شود */
      const side = (v: unknown): { heading: string; points: string[] } | null => {
        const o = (v ?? {}) as Record<string, unknown>
        const heading = cut(o.heading, 40)
        const rawPoints = Array.isArray(o.points) ? o.points : Array.isArray(o.items) ? o.items : []
        const points = rawPoints.slice(0, 5).map((p) => cut(p, 110)).filter(Boolean)
        if (!heading || points.length < 1) return null
        return { heading, points }
      }
      const left = side(raw.left)
      const right = side(raw.right)
      if (!left || !right) return null
      return {
        type: 'comparison',
        kicker: cut(raw.kicker, 40) || undefined,
        title: cut(raw.title, 80),
        left,
        right,
      }
    }
    default:
      return null
  }
}

export function normalizeDeck(
  value: unknown,
  language: 'fa' | 'en',
  visualMode: 'offline' | 'image' = 'image',
): DeckJSON | null {
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
      if (s.type === 'section') return s.title.trim().length > 0
      if (s.type === 'comparison') return s.left.points.length >= 1 && s.right.points.length >= 1
      return true
    })
    /* حالت آفلاین: هیچ تصویر خارجی نباید در فایل بماند */
    .map((s) => {
      if (visualMode !== 'offline') return s
      if (s.type === 'image') return null
      if (s.type === 'cover') return { ...s, image: undefined, imageCaption: undefined }
      if (s.type === 'bullets')
        return { ...s, items: s.items.map((it) => ({ ...it, image: undefined })) }
      return s
    })
    .filter((s): s is DeckSlide => s !== null)
  /* ارائه تک‌اسلایدی (فقط جلد) هم معتبر است — MIN_SLIDES = ۱ */
  if (slides.length < 1) return null
  const cover = slides[0].type === 'cover' ? slides[0] : null
  const title = cover && 'title' in cover ? cover.title : raw.title
  return {
    title: cut(title, 120) || (language === 'fa' ? 'ارائه بدون عنوان' : 'Untitled deck'),
    subtitle: cut(raw.subtitle, 200) || undefined,
    language: raw.language === 'en' ? 'en' : language,
    slides,
  }
}

/* اصلاح ساختاری خروجی مدل: cover اول، conclusion آخر، و برش هوشمند
 * تعداد اضافه (به‌جای بریدن از انتها، از میان اسلایدها کم می‌کنیم
 * تا cover و conclusion همیشه سالم بمانند) */
export function fixStructure(deck: DeckJSON, want: number): DeckJSON {
  let slides = [...deck.slides]
  const ci = slides.findIndex((s) => s.type === 'cover')
  if (ci > 0) slides = [slides[ci], ...slides.slice(0, ci), ...slides.slice(ci + 1)]
  const ei = slides.findIndex((s) => s.type === 'conclusion')
  if (ei >= 0 && ei !== slides.length - 1) {
    const [c] = slides.splice(ei, 1)
    slides.push(c)
  }
  /* ارائه تک‌اسلایدی = فقط جلد؛ هر چیز اضافه بریده می‌شود */
  if (want === 1) return { ...deck, slides: slides.slice(0, 1) }
  if (slides.length > want && slides.length >= 3) {
    const first = slides[0]
    const last = slides[slides.length - 1]
    const mid = slides.slice(1, -1)
    /* want=۲ → mid بریده می‌شود تا دقیقاً cover+conclusion بماند */
    slides = [first, ...mid.slice(0, Math.max(0, want - 2)), last]
  }
  return { ...deck, slides }
}

/* ── AI call ── */

/* پرامپت مکمل‌سازی: فقط اسلایدهای میانی جاافتاده از مدل خواسته می‌شود —
 * فراخوانی کوچک و سریع که ارائه‌ی ناقص (مثلاً ۱۰ از ۱۴) را کامل می‌کند.
 * این تورِ ایمنی، باگ «بالای ۱۰ اسلاید ساخته نمی‌شود» را حتی وقتی خروجی
 * مدل کوتاه بیاید یا وسط کار قطع شود، جمع می‌کند. */
function topUpPrompt(opts: GenerateOptions, missing: { type: string; index: number }[], existingTitles: string[]): string {
  const fa = opts.language === 'fa'
  const faNum = (n: number) => (fa ? String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]) : String(n))
  const list = missing
    .map(({ type, index }) => `${faNum(index)}. ${type} — ${fa ? PLAN_HINTS_FA[type] ?? type : PLAN_HINTS_EN[type] ?? type}`)
    .join('\n')
  const done = existingTitles.slice(-6).map((t) => `- ${t}`).join('\n')
  const wantsConclusion = missing.some((m) => m.type === 'conclusion')
  if (fa) {
    return `موضوع ارائه: «${opts.topic}»
${opts.audience ? `مخاطب: ${opts.audience}.` : ''}
لحن: ${opts.tone}.
این اسلایدها قبلاً ساخته شده‌اند (برای جلوگیری از تکرار):
${done}
حالا «فقط» اسلایدهای میانی باقی‌مانده را به همین ترتیب بساز:
${list}
خروجی: فقط یک JSON معتبر به شکل {"slides":[...]} با دقیقاً ${missing.length} اسلاید، به همین ترتیب و با همان انواع. ${wantsConclusion ? 'هیچ اسلاید cover اضافه نکن؛ آخرین اسلاید باید conclusion باشد.' : 'هیچ اسلاید cover یا conclusion اضافه نکن.'}`
  }
  return `Presentation topic: "${opts.topic}"
${opts.audience ? `Audience: ${opts.audience}.` : ''}
Tone: ${opts.tone}.
These slides already exist (avoid repeating them):
${done}
Now generate ONLY the remaining middle slides, in this exact order:
${list}
Output: a single valid JSON {"slides":[...]} with exactly ${missing.length} slides, same order and same types. ${wantsConclusion ? 'No cover slide; the LAST slide must be the conclusion.' : 'No cover, no conclusion.'}`
}

/* تزریق اسلایدهای مکمل قبل از conclusion + اصلاح ساختاری نهایی */
async function topUpSlides(opts: GenerateOptions, plan: string[], current: DeckJSON): Promise<DeckJSON | null> {
  const have = current.slides.length
  if (have >= plan.length) return null /* کامل — نیازی به مکمل نیست */
  const last = current.slides[current.slides.length - 1]
  const lastIsConclusion = last?.type === 'conclusion'
  /* اسلایدهای جاافتاده: از انتهای بخش موجود تا آخر برنامه —
   * اگر conclusion هم غایب باشد، در همین فراخوانی خواسته می‌شود */
  const missing = plan
    .slice(have - (lastIsConclusion ? 1 : 0))
    .map((type, i) => ({ type, index: i + 1 }))
  if (!missing.length) return null
  const content = await chat([
    { role: 'system', content: systemPrompt(opts.language, opts.visualMode) },
    {
      role: 'user',
      content: topUpPrompt(
        opts,
        missing,
        current.slides.map((s) => ('title' in s ? s.title : s.type))
      ),
    },
  ])
  const deck = normalizeDeck(extractJSON(content), opts.language, opts.visualMode)
  if (!deck || !deck.slides.length) return null
  /* cover هرگز از مکمل پذیرفته نمی‌شود؛ conclusion وقتی خواسته شده بود
   * باید نگه داشته شود (fixStructure جایش را به انتها می‌برد) */
  const mids = deck.slides.filter((s) => s.type !== 'cover')
  if (!mids.length) return null
  const head = lastIsConclusion ? current.slides.slice(0, -1) : current.slides
  const tail = lastIsConclusion ? [last] : []
  const merged: DeckJSON = { ...current, slides: [...head, ...mids, ...tail] }
  return fixStructure(merged, plan.length)
}

export async function generateDeckWithAI(opts: GenerateOptions): Promise<DeckJSON> {
  /* چیدمان قطعی: تعداد و نوع هر اسلاید از قبل برنامه‌ریزی می‌شود تا
   * «بیش از ۸ اسلاید» هم دقیقاً رعایت شود و ترکیب انواع متنوع بماند */
  const plan = planSlideTypes(opts.slideCount, opts.visualMode, topicSeed(opts.topic), opts.preferredLayouts)
  const want = plan.length

  let best: DeckJSON | null = null
  let lastErr: unknown
  // two attempts: LLM output can occasionally break JSON structure or come up short
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const content = await chat([
        { role: 'system', content: systemPrompt(opts.language, opts.visualMode) },
        { role: 'user', content: userPrompt(opts, plan) },
      ])

      let deck = normalizeDeck(extractJSON(content), opts.language, opts.visualMode)
      if (!deck) throw new Error('ساختار ارائه تولیدشده معتبر نبود. دوباره تلاش کنید.')
      deck = fixStructure(deck, want)

      /* فقط تعداد دقیق پذیرفته می‌شود؛ کمبود با تلاش دوم و سپس
       * مکمل‌سازی (top-up) جبران می‌شود تا خروجی همیشه دقیق باشد */
      if (deck.slides.length === want) return deck
      // کمتر از درخواست — بهترین تلاش را نگه دار و یک‌بار دیگر بخواه
      if (!best || deck.slides.length > best.slides.length) best = deck
    } catch (err) {
      lastErr = err
    }
  }
  /* تور ایمنی نهایی برای ارائه‌های بلند (بالای ۱۰ اسلاید): اگر بهترین تلاش
   * هنوز کوتاه است، فقط اسلایدهای جاافتاده را در یک فراخوانی کوچک بگیر */
  if (best) {
    try {
      const topped = await topUpSlides(opts, plan, best)
      if (topped && topped.slides.length >= best.slides.length) return topped
    } catch {
      /* مکمل‌سازی best-effort است — در بدترین حالت بهترین تلاش برمی‌گردد */
    }
    return best
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('تولید پرزنتیشن با خطا مواجه شد؛ لطفاً دوباره تلاش کنید.')
}
