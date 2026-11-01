/* تست ۱۲ قالب طراحی — یک ارائه یکسان با قالب‌های متفاوت رندر می‌شود
 * Run: npx tsx scripts/test-styles.ts */
import { writeFileSync } from 'fs'
import { generateDeckHTML } from '../src/lib/deck-generator'
import { DECK_STYLE_KEYS, pickStyleForTopic } from '../src/lib/deck-styles'
import type { DeckJSON } from '../src/lib/deck-types'

const deck: DeckJSON = {
  title: 'نقش هوش مصنوعی در آموزش آینده',
  language: 'fa',
  slides: [
    { type: 'cover', badge: 'ارائه تخصصی', title: 'نقش هوش مصنوعی در آموزش آینده', subtitle: 'از یادگیری شخصی‌سازی‌شده تا دستیارهای درسی', author: 'باید حذف شود', date: '۱۴۰۴' },
    { type: 'agenda', kicker: 'فهرست', title: 'مسیر ارائه', items: ['یادگیری شخصی‌سازی‌شده', 'دستیارهای هوشمند درسی', 'چالش‌ها و ملاحظات اخلاقی', 'نقشه راه آینده'] },
    { type: 'bullets', kicker: 'بخش یک', title: 'دستاورد های کلیدی', items: [
      { title: 'یادگیری تطبیقی', text: 'مسیر درسی هر دانش‌آموز بر اساس عملکرد او به‌صورت خودکار تنظیم می‌شود.', icon: 'target' },
      { title: 'بازخورد آنی', text: 'اصلاح خطا در لحظه، بدون انتظار برای جلسه بعدی کلاس.', icon: 'zap' },
      { title: 'دسترسی برابر', text: 'کیفیت آموزش یکسان در شهر و روستا با ابزارهای ابری.', icon: 'globe' },
    ] },
    { type: 'section', kicker: 'فصل دوم', title: 'چالش‌ها و ملاحظات اخلاقی', subtitle: 'حریم خصوصی داده‌ها و نقش معلم' },
    { type: 'comparison', kicker: 'تحلیل', title: 'کلاس سنتی در برابر کلاس هوشمند', left: { heading: 'کلاس هوشمند', points: ['بازخورد لحظه‌ای', 'تمرین شخصی‌سازی‌شده'] }, right: { heading: 'کلاس سنتی', points: ['وابستگی به تقویم ثابت', 'آزمون یکسان برای همه'] } },
    { type: 'stats', kicker: 'آمار', title: 'تأثیر بر یادگیری', stats: [{ value: '۴۲٪', label: 'بهبود ماندگاری مطالب' }, { value: '۳ برابر', label: 'سرعت اصلاح خطا' }], footnote: 'میانگین مطالعات ۲۰۲۳ تا ۲۰۲۵' },
    { type: 'conclusion', title: 'جمع‌بندی', points: ['هوش مصنوعی جای معلم را نمی‌گیرد، توانش را چند برابر می‌کند', 'شروع کوچک، ارزیابی مستمر'], cta: 'از امروز شروع کنید' },
  ],
}

/* ۱) صحت انتخاب هوشمند قالب بر اساس موضوع */
const picks: [string, string][] = [
  ['هوش مصنوعی و فناوری داده', ''],
  ['استراتژی بازاریابی و فروش', ''],
  ['روش‌های نوین تدریس ریاضی در دبستان', ''],
  ['گزارش مالی و مدیریت سرمایه', ''],
  ['پرورش گیاهان دارویی و کشاورزی پایدار', ''],
  ['تاریخ شعر و ادبیات فارسی', ''],
  ['آب و هوا و محیط زیست شهر تهران', ''],
  ['طراحی داخلی و معماری مسکن', ''],
  ['یک موضوع بی‌کلیدواژه خاص', ''],
]
console.log('── pickStyleForTopic ──')
for (const [t] of picks) console.log(`  ${pickStyleForTopic(t).padEnd(10)} ← ${t}`)
console.log(`  قالب‌های ثبت‌شده: ${DECK_STYLE_KEYS.length}`)

/* ۲) رندر نمونه برای هر قالب */
const accents: Record<string, string> = {
  modern: 'blue', minimal: 'slate', midnight: 'indigo', academic: 'bronze',
  editorial: 'rose', startup: 'orange', glass: 'teal', classic: 'gold',
  bigtype: 'red', nature: 'green', corporate: 'blue', persian: 'purple',
}
for (const key of DECK_STYLE_KEYS) {
  const html = generateDeckHTML(deck, { accent: (accents[key] ?? 'blue') as never, style: key as never })
  writeFileSync(`/tmp/style-${key}.html`, html)
  const hasAuthor = html.includes('باید حذف شود')
  console.log(`  ${key.padEnd(10)} → /tmp/style-${key}.html ${hasAuthor ? '✗ نام روی جلد!' : '✓ بدون نام'}`)
}
console.log('OK')
