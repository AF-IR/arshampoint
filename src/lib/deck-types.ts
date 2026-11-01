/* ── DeckJSON — the structured AI output format ──
   The AI generates this; deck-generator.ts renders it as a
   standalone single-file HTML presentation (RTL, dual-theme). */

export type DeckLanguage = 'fa' | 'en'

export interface DeckCoverSlide {
  type: 'cover'
  badge?: string
  title: string
  subtitle?: string
  author?: string
  date?: string
  /* حالت دارای تصویر — لینک تصویر پس‌زمینه/کنار عنوان */
  image?: string
  imageCaption?: string
}

export interface DeckAgendaSlide {
  type: 'agenda'
  kicker?: string
  title: string
  items: string[]
}

export interface DeckBulletsSlide {
  type: 'bullets'
  kicker?: string
  title: string
  items: { title?: string; text: string; image?: string; icon?: string }[]
}

/* اسلاید جداکننده بخش — برای عریض‌های ۸ اسلاید به بالا ریتم بصری می‌سازد */
export interface DeckSectionSlide {
  type: 'section'
  kicker?: string
  title: string
  subtitle?: string
}

/* مقایسه دو ستونی با نماد تیک/ضربدر — مزایا و معایب، روش ۱ در برابر روش ۲ */
export interface DeckComparisonSlide {
  type: 'comparison'
  kicker?: string
  title: string
  left: { heading: string; points: string[] }
  right: { heading: string; points: string[] }
}

export interface DeckTwoColumnSlide {
  type: 'two-column'
  kicker?: string
  title: string
  columns: { heading: string; items: string[] }[]
}

export interface DeckStatsSlide {
  type: 'stats'
  kicker?: string
  title: string
  stats: { value: string; label: string; hint?: string }[]
  footnote?: string
}

export interface DeckQuoteSlide {
  type: 'quote'
  quote: string
  author?: string
  role?: string
}

export interface DeckTimelineSlide {
  type: 'timeline'
  kicker?: string
  title: string
  steps: { label: string; title: string; text: string }[]
}

export interface DeckConclusionSlide {
  type: 'conclusion'
  title: string
  points: string[]
  cta?: string
}

/* اسلاید تصویر تمام‌عرض — فقط در حالت «دارای تصویر» تولید می‌شود */
export interface DeckImageSlide {
  type: 'image'
  kicker?: string
  title: string
  image: string
  caption?: string
  text?: string
}

export type DeckSlide =
  | DeckCoverSlide
  | DeckAgendaSlide
  | DeckBulletsSlide
  | DeckTwoColumnSlide
  | DeckStatsSlide
  | DeckQuoteSlide
  | DeckTimelineSlide
  | DeckConclusionSlide
  | DeckImageSlide
  | DeckSectionSlide
  | DeckComparisonSlide

export interface DeckJSON {
  title: string
  subtitle?: string
  author?: string
  language: DeckLanguage
  slides: DeckSlide[]
  /* نام اعضا/تهیه‌کنندگان ارائه — «تهیه‌شده توسط:» روی جلد و اسلاید پایانی.
     این فیلد از ورودی کاربر می‌آید (نه از خروجی هوش مصنوعی). */
  authors?: string[]
}

export const DECK_ACCENTS = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'teal',
  'indigo',
  'gold',
  'rose',
  'lime',
  'bronze',
  'slate',
] as const
export type DeckAccent = (typeof DECK_ACCENTS)[number]

export const ACCENT_LABELS: Record<DeckAccent, string> = {
  blue: 'آبی گوگلی',
  green: 'سبز',
  orange: 'نارنجی',
  purple: 'بنفش',
  red: 'قرمز پرانرژی',
  teal: 'فیروزه‌ای',
  indigo: 'نیلی مدرن',
  gold: 'طلایی لوکس',
  rose: 'گلگون',
  lime: 'لیمویی',
  bronze: 'برنزی',
  slate: 'طوسی مینیمال',
}

/* ── نمادهای غیرتصویری (SVG داخلی — بدون هیچ فایل خارجی) ──
   هوش مصنوعی می‌تواند برای آیتم‌های bullets یکی از این کلیدها را
   انتخاب کند؛ رندرکننده آن را به SVG درون‌خطی تبدیل می‌کند. */
export const DECK_ICONS = [
  'target',
  'chart',
  'trend',
  'lightbulb',
  'shield',
  'clock',
  'users',
  'zap',
  'star',
  'globe',
  'search',
  'book',
  'flag',
  'briefcase',
  'heart',
  'pin',
  'mail',
  'calendar',
] as const
export type DeckIcon = (typeof DECK_ICONS)[number]

export function isDeckIcon(v: unknown): v is DeckIcon {
  return typeof v === 'string' && (DECK_ICONS as readonly string[]).includes(v)
}

/* ── انواع اسلاید قابل انتخاب دستی (ویژه پلن حرفه‌ای) ──
 * کاربر حرفه‌ای می‌تواند بگوید کدام انواع اسلاید در ارائه استفاده شود؛
 * cover و conclusion همیشه خودکار هستند. */
export const DECK_LAYOUT_TYPES = [
  { key: 'agenda', label: 'فهرست مطالب' },
  { key: 'bullets', label: 'نکات کلیدی' },
  { key: 'two-column', label: 'دو ستونی' },
  { key: 'comparison', label: 'مقایسه' },
  { key: 'stats', label: 'آمار و ارقام' },
  { key: 'quote', label: 'نقل‌قول' },
  { key: 'timeline', label: 'گام زمانی' },
  { key: 'section', label: 'جداکننده بخش' },
  { key: 'image', label: 'تصویر تمام‌عرض' },
] as const

export type DeckLayoutKey = (typeof DECK_LAYOUT_TYPES)[number]['key']

export function isDeckLayout(v: unknown): v is DeckLayoutKey {
  return typeof v === 'string' && DECK_LAYOUT_TYPES.some((l) => l.key === v)
}

export function isValidDeck(value: unknown): value is DeckJSON {
  if (!value || typeof value !== 'object') return false
  const deck = value as DeckJSON
  return (
    typeof deck.title === 'string' &&
    deck.title.trim().length > 0 &&
    Array.isArray(deck.slides) &&
    deck.slides.length > 0 &&
    deck.slides.every((s) => s && typeof s === 'object' && typeof s.type === 'string')
  )
}
