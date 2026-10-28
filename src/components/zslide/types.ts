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
  language: 'fa' | 'en'
  accent: string
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
