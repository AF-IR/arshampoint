export interface SessionUser {
  id: string
  email: string
  name: string | null
}

export interface DeckMeta {
  id: string
  title: string
  topic: string
  theme: string
  slideCount: number
  language: string
  createdAt: string
  updatedAt?: string
}

export interface GeneratePayload {
  topic: string
  audience?: string
  tone: string
  slideCount: number
  /* نام تهیه‌کنندگان/اعضا — روی جلد و اسلاید پایانی درج می‌شود (ویژگی رایگان) */
  authors?: string[]
  language: 'fa' | 'en'
  accent: string
  /* حالت بصری:
   *  - offline: فقط متن، آیکون و نمودار (بدون هیچ تصویر خارجی)
   *  - image  : تصاویر مرتبط به‌صورت لینک داخل اسلایدها درج می‌شود */
  visualMode: 'offline' | 'image'
  /* لینک تصاویر اختیاری کاربر (یک لینک در هر خط) — فقط در حالت image */
  imageLinks?: string[]
  /* قالب طراحی — «auto» یعنی انتخاب هوشمند بر اساس موضوع (رایگان)؛
   * انتخاب دستی یکی از ۱۲ قالب ویژه پلن حرفه‌ای است */
  style?: string
  /* انواع اسلاید در اولویت — انتخاب دستی ویژه پلن حرفه‌ای */
  layouts?: string[]
}

export const TONES = [
  'حرفه‌ای و رسمی',
  'آموزشی و ساده',
  'خلاقانه و الهام‌بخش',
  'فروش‌محور و متقاعدکننده',
  'دانشجویی و آکادمیک',
] as const

export const ACCENTS: { key: string; label: string; color: string; ring: string }[] = [
  { key: 'blue', label: 'آبی گوگلی', color: '#8AB4F8', ring: 'rgba(138,180,248,.4)' },
  { key: 'green', label: 'سبز', color: '#81C995', ring: 'rgba(129,201,149,.4)' },
  { key: 'orange', label: 'نارنجی', color: '#FFB75F', ring: 'rgba(255,183,95,.4)' },
  { key: 'purple', label: 'بنفش', color: '#C58AF9', ring: 'rgba(197,138,249,.4)' },
  { key: 'red', label: 'قرمز پرانرژی', color: '#F28B82', ring: 'rgba(242,139,130,.4)' },
  { key: 'teal', label: 'فیروزه‌ای', color: '#78D9EC', ring: 'rgba(120,217,236,.4)' },
  { key: 'indigo', label: 'نیلی مدرن', color: '#A3B0F7', ring: 'rgba(163,176,247,.4)' },
  { key: 'gold', label: 'طلایی لوکس', color: '#FDD663', ring: 'rgba(253,214,99,.4)' },
  { key: 'rose', label: 'گلگون', color: '#F7A8C4', ring: 'rgba(247,168,196,.4)' },
  { key: 'lime', label: 'لیمویی', color: '#C8E06E', ring: 'rgba(200,224,110,.4)' },
  { key: 'bronze', label: 'برنزی', color: '#E0A878', ring: 'rgba(224,168,120,.4)' },
  { key: 'slate', label: 'طوسی مینیمال', color: '#BDC5CF', ring: 'rgba(189,197,207,.4)' },
]

export const faDate = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}

export const faNum = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
