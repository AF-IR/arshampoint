import type { DeckIcon } from '@/lib/deck-types'

/* ═══════════════════════════════════════════════════════════════
 * ۱۲ قالب طراحی ارائه — لایه‌ای مستقل از «رنگ غالب».
 *
 * هر قالب = زبان طراحی کامل: جنس پس‌زمینه، فونت تیترها، فرم کارت‌ها،
 * ترکیب‌بندی جلد (۵ واریانت) و الگوی تزئینی اسلایدها. نتیجه: دو ارائه
 * با یک رنگ هم دیگر شبیه نیستند و بسته به موضوع، قالب متفاوتی انتخاب
 * می‌شود (pickStyleForTopic). انتخاب دستی قالب ویژه پلن حرفه‌ای است.
 * ═══════════════════════════════════════════════════════════════ */

export type DeckCoverVariant = 'center' | 'split' | 'band' | 'frame' | 'minimal'
export type DeckDecor = 'glow' | 'grid' | 'stripes' | 'frame' | 'corner' | 'dots' | 'flat'
export type DeckShape = 'xl' | 'md' | 'sm' | 'sharp'

export interface DeckStyleDef {
  label: string
  desc: string
  cover: DeckCoverVariant
  decor: DeckDecor
  shape: DeckShape
  /** فونت تیترها (Google Fonts) — پیش‌فرض Vazirmatn */
  headFont?: { family: string; google?: string; weight?: number }
  /** تیترهای درشت‌تر (سبک پوستر) */
  bigType?: boolean
  /** حذف خط تزئینی زیر عنوان اسلایدها */
  noRule?: boolean
  /** نماد بزرگ پنل جلد در واریانت split */
  panelIcon?: DeckIcon
  /** بازنویسی توکن‌های CSS (تیره/روشن) */
  tokDark?: Record<string, string>
  tokLight?: Record<string, string>
}

export type DeckStyle =
  | 'modern' | 'minimal' | 'midnight' | 'academic' | 'editorial' | 'startup'
  | 'glass' | 'classic' | 'bigtype' | 'nature' | 'corporate' | 'persian'

export const DECK_STYLES: Record<DeckStyle, DeckStyleDef> = {
  modern: {
    label: 'مدرن',
    desc: 'پیش‌فرض — کارت‌های نرم و درخشش ملایم',
    cover: 'center', decor: 'glow', shape: 'xl',
  },
  minimal: {
    label: 'مینیمال',
    desc: 'ساده و تخت، بدون شلوغی',
    cover: 'minimal', decor: 'flat', shape: 'sharp', noRule: true,
    tokDark: { '--shadow': 'none', '--shadow-lg': 'none' },
    tokLight: { '--shadow': 'none', '--shadow-lg': 'none' },
  },
  midnight: {
    label: 'شب نئون',
    desc: 'تیره و عمیق با شبکه‌ی زمینه',
    cover: 'band', decor: 'grid', shape: 'xl',
    tokDark: { '--bg': '#0A0D16', '--bg-tint': '#101422', '--surface': '#141928', '--page': '#05070D' },
  },
  academic: {
    label: 'اکادمیک',
    desc: 'کاغذ کرم و تیتر سریف — کلاس و پژوهش',
    cover: 'frame', decor: 'frame', shape: 'sm',
    headFont: { family: "'Markazi Text','Vazirmatn',serif", google: 'Markazi+Text:wght@400..700', weight: 700 },
    tokLight: { '--bg': '#FBF8F1', '--bg-tint': '#F3EDE0', '--surface': '#FFFDF8', '--page': '#EFE8D8' },
  },
  editorial: {
    label: 'مجله‌ای',
    desc: 'چیدمان نشریه‌ای با تیتر سریف',
    cover: 'split', decor: 'flat', shape: 'sm', noRule: true,
    headFont: { family: "'Markazi Text','Vazirmatn',serif", google: 'Markazi+Text:wght@400..700', weight: 700 },
  },
  startup: {
    label: 'استارتاپ',
    desc: 'پرانرژی با نوارهای مورب و فونت نمایشی',
    cover: 'split', decor: 'stripes', shape: 'xl', bigType: true, panelIcon: 'zap',
    headFont: { family: "'Lalezar','Vazirmatn',sans-serif", google: 'Lalezar', weight: 400 },
    tokDark: { '--bg': '#0B0E17', '--page': '#070910' },
  },
  glass: {
    label: 'شیشه‌ای',
    desc: 'سطوح شفاف و مات (Glassmorphism)',
    cover: 'center', decor: 'glow', shape: 'xl',
    tokDark: { '--surface': 'rgba(30,33,39,.55)' },
    tokLight: { '--surface': 'rgba(255,255,255,.66)' },
  },
  classic: {
    label: 'کلاسیک رسمی',
    desc: 'حاشیه قاب و فونت نسخ — جلسات رسمی',
    cover: 'band', decor: 'frame', shape: 'md',
    headFont: { family: "'Amiri','Vazirmatn',serif", google: 'Amiri:wght@400;700', weight: 700 },
  },
  bigtype: {
    label: 'تایپوگرافی درشت',
    desc: 'حرف اول؛ تیترهای خیلی بزرگ و تخت',
    cover: 'minimal', decor: 'flat', shape: 'sharp', bigType: true, noRule: true,
    headFont: { family: "'Lalezar','Vazirmatn',sans-serif", google: 'Lalezar', weight: 400 },
    tokDark: { '--shadow': 'none', '--shadow-lg': 'none' },
    tokLight: { '--shadow': 'none', '--shadow-lg': 'none' },
  },
  nature: {
    label: 'طبیعت',
    desc: 'سبک و آرام با هاله‌های نرم',
    cover: 'split', decor: 'corner', shape: 'md', panelIcon: 'globe',
    tokLight: { '--bg': '#F4F8F2', '--bg-tint': '#E9F2E6', '--surface': '#FDFEFB', '--page': '#E4EDE1' },
  },
  corporate: {
    label: 'شرکتی',
    desc: 'منظم و شبکه‌ای — گزارش و جلسه کاری',
    cover: 'band', decor: 'grid', shape: 'sm', panelIcon: 'briefcase',
  },
  persian: {
    label: 'خط فارسی',
    desc: 'قاب ایرانی و فونت لاله‌زار — فرهنگ و هنر',
    cover: 'frame', decor: 'corner', shape: 'md', bigType: true, panelIcon: 'star',
    headFont: { family: "'Lalezar','Vazirmatn',sans-serif", google: 'Lalezar', weight: 400 },
    tokLight: { '--bg': '#FCF6EA', '--bg-tint': '#F4EAD5', '--surface': '#FFFCF5', '--page': '#F1E7D2' },
  },
}

export const DECK_STYLE_KEYS = Object.keys(DECK_STYLES) as DeckStyle[]

export const STYLE_OPTIONS = DECK_STYLE_KEYS.map((key) => ({
  key,
  label: DECK_STYLES[key].label,
  desc: DECK_STYLES[key].desc,
}))

export function isDeckStyle(v: unknown): v is DeckStyle {
  return typeof v === 'string' && (DECK_STYLE_KEYS as string[]).includes(v)
}

/* ── انتخاب هوشمند قالب بر اساس موضوع ──
 * کلیدواژه‌های پرتکرار فارسی/انگلیسی → قالب هم‌خوان؛
 * در غیر این صورت هش قطعی موضوع از میان هر ۱۲ قالب انتخاب می‌کند
 * تا دو موضوع متفاوت، دو قالب متفاوت بگیرند (تنوع پاورها). */
const TOPIC_RULES: [RegExp, DeckStyle][] = [
  [/هوش مصنوعی|فناوری|تکنولوژی|نرم\s?افزار|برنامه‌نویسی|داده|ربات|امنیت سایبری|بلاکچین|\bai\b|\btech\b|software|\bdata\b|robot|cyber/i, 'midnight'],
  [/استارتاپ|بازاریابی|فروش|رشد|تبلیغات|برند|محصول|مشتری|درآمدزایی|\bseo\b|startup|marketing|sales|growth|brand|product/i, 'startup'],
  [/آموزش|تدریس|دانشگاه|مدرسه|دبستان|دبیرستان|دانش‌آموز|دانشجو|درس|پژوهش|یادگیری|معلم|استاد|کلاس|educa|school|university|student|research|learning|teaching/i, 'academic'],
  [/مدیریت|کسب‌وکار|کارآفرینی|مالی|حسابداری|بانک|سرمایه|بورس|اقتصاد|بازار|قرارداد|business|finance|management|economy|invest|market(?!ing)/i, 'corporate'],
  [/طبیعت|محیط\s?زیست|سلامت|پزشک|بهداشت|درمان|گیاه|حیوانات|کشاورزی|انرژی خورشیدی| تغذیه|nature|health|medic|environment|green energy|farm|plant/i, 'nature'],
  [/هنر|فرهنگ|تاریخ|ادبیات|شعر|شاعر|سینما|میراث|کتاب|نویسنده|art|culture|history|litera|poetry|cinema|heritage|book/i, 'persian'],
  [/رسانه|خبر|مجله|روزنامه|انتشار|رونوشت|مقاله|ژورنال|news|media|magazine|journal|press|publish/i, 'editorial'],
  [/معماری|مهندسی|ساختمان|پروژه|صنعت|تولید|نقشه|engineering|architect|construction|industr|manufactur/i, 'minimal'],
]

export function pickStyleForTopic(topic: string): DeckStyle {
  const t = topic ?? ''
  for (const [re, style] of TOPIC_RULES) {
    if (re.test(t)) return style
  }
  /* هش قطعی — همان موضوع همیشه همان قالب، موضوع جدید قالب جدید */
  let h = 0
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
  return DECK_STYLE_KEYS[h % DECK_STYLE_KEYS.length]
}

/* ── CSS قالب — بعد از accentCss تزریق می‌شود (specificity بالاتر) ── */

const SHAPE_RADIUS: Record<DeckShape, string> = { xl: '20px', md: '13px', sm: '9px', sharp: '5px' }

const DECOR_BG: Record<DeckDecor, string> = {
  /* پیش‌فرض فعلی — بازنویسی نمی‌شود */
  glow: '',
  flat: 'none',
  grid: 'linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px),radial-gradient(900px 420px at 85% -10%,var(--slide-g1),transparent 60%),radial-gradient(700px 380px at 0% 110%,var(--slide-g2),transparent 60%)',
  stripes: 'repeating-linear-gradient(135deg,var(--a-glow) 0 2px,transparent 2px 30px),radial-gradient(900px 420px at 85% -10%,var(--slide-g1),transparent 60%)',
  frame: 'radial-gradient(700px 380px at 0% 110%,var(--slide-g2),transparent 60%)',
  corner: 'radial-gradient(620px 460px at 100% 0%,var(--a-tint),transparent 62%),radial-gradient(460px 340px at 0% 100%,var(--a-glow),transparent 58%)',
  dots: 'radial-gradient(var(--a-tintB) 1.4px,transparent 1.5px),radial-gradient(900px 420px at 85% -10%,var(--slide-g1),transparent 60%)',
}

export function styleCss(key: DeckStyle, light: boolean): string {
  const s: DeckStyleDef = DECK_STYLES[key]
  /* توکن‌های تیره/روشن باید بر html.light پایه (specificity برابر) غلبه کنند:
   * تیره → :not(.light) و روشن → .light */
  const sel = `html.st-${key}`
  const tokSel = light ? `${sel}.light` : `${sel}:not(.light)`
  const parts: string[] = []

  const tok = (light ? s.tokLight : s.tokDark) ?? {}
  const tokStr = Object.entries(tok).map(([k, v]) => `${k}:${v}`).join(';')
  if (tokStr) parts.push(`${tokSel}{${tokStr}}`)

  if (s.shape !== 'xl') {
    const r = SHAPE_RADIUS[s.shape]
    parts.push(`${sel} .card,${sel} .card-tint,${sel} .card-soft{border-radius:${r}}`)
  }
  if (s.headFont) {
    const w = s.headFont.weight
    parts.push(`${sel} h1,${sel} h2{font-family:${s.headFont.family}}`)
    if (w) parts.push(`${sel} h1,${sel} h2{font-weight:${w}!important}`)
  }
  if (s.bigType) {
    parts.push(`${sel} h1.title{font-size:44px}${sel} h1{letter-spacing:-.01em}`)
  }
  if (s.noRule) parts.push(`${sel} .head .rule{display:none}`)

  const bg = DECOR_BG[s.decor]
  if (bg) {
    const sizes = s.decor === 'grid' ? 'auto,auto,auto,auto' : s.decor === 'dots' ? '30px 30px,auto' : 'auto'
    parts.push(`${sel} .slide{background-image:${bg};background-size:${sizes}}`)
  }
  if (s.decor === 'frame') {
    parts.push(
      `${sel} .slide::after{content:'';position:absolute;inset:22px;border:1.5px solid var(--a-tintB);border-radius:${SHAPE_RADIUS[s.shape]};pointer-events:none}`
    )
  }
  if (key === 'glass') {
    parts.push(
      `${sel} .card,${sel} .card-tint{backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}`,
      `${sel} .card{background:rgba(255,255,255,.05)}`,
      `${sel}.light .card{background:rgba(255,255,255,.62)}`
    )
  }
  return parts.join('\n')
}

/** خانواده‌های فونت اضافی که این قالب لازم دارد (برای تگ link گوگل‌فونت) */
export function styleGoogleFamilies(key: DeckStyle): string[] {
  const g = DECK_STYLES[key].headFont?.google
  return g ? [g] : []
}
