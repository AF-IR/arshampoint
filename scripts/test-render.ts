/* تست مستقیم رندرکننده با قالب‌های جدید — بدون تماس با AI */
import { writeFileSync } from 'fs'
import { generateDeckHTML } from '../src/lib/deck-generator'
import type { DeckJSON } from '../src/lib/deck-types'

const deck: DeckJSON = {
  title: 'تست قالب‌های جدید',
  language: 'fa',
  slides: [
    { type: 'cover', badge: 'آزمون کیفیت', title: 'تست قالب‌های جدید و نمادها', subtitle: 'بررسی فشرده‌سازی، مقایسه و جداکننده بخش', author: 'تیم فنی', date: '۱۴۰۴' },
    { type: 'agenda', kicker: 'فهرست', title: 'موارد آزمون', items: ['نمادهای SVG', 'حالت فشرده', 'اسلاید مقایسه', 'جداکننده بخش'] },
    { type: 'bullets', kicker: 'بخش یک', title: 'پنج آیتم با نماد (حالت فشرده)', items: [
      { title: 'هدف‌گذاری دقیق', text: 'تعریف شاخص‌های کلیدی عملکرد برای سنجش پیشرفت پروژه در بازه سه‌ماهه.', icon: 'target' },
      { title: 'تحلیل داده', text: 'بررسی رفتار کاربران بر پایه داده‌های واقعی داشبورد تحلیلی.', icon: 'chart' },
      { title: 'ایده نو', text: 'خلق راه‌حل خلاقانه برای کاهش هزینه‌های عملیاتی.', icon: 'lightbulb' },
      { title: 'زمان‌بندی هوشمند', text: 'برنامه‌ریزی اسپرینت‌ها با احتساب مرخصی‌ها و تعطیلات رسمی.', icon: 'clock' },
      { title: 'کار تیمی', text: 'هماهنگی میان سه تیم فنی برای تحویل هم‌زمان ماژول‌ها.', icon: 'users' },
    ] },
    { type: 'section', kicker: 'فصل دوم', title: 'جداکننده بخش: معماری', subtitle: 'تست اسلاید section برای عریض‌های بلند' },
    { type: 'comparison', kicker: 'تحلیل', title: 'مزایا و معایب معماری جدید', left: { heading: 'مزایا', points: ['مقیاس‌پذیری افقی', 'هزینه نگهداری کمتر', 'استقرار سریع‌تر'] }, right: { heading: 'معایب', points: ['نیاز به بازآموزی تیم', 'هزینه مهاجرت اولیه'] } },
    { type: 'conclusion', title: 'جمع‌بندی', points: ['نمادهای SVG بدون تصویر خارجی کار می‌کنند', 'حالت فشرده از تداخل کارت‌ها جلوگیری می‌کند'], cta: 'شروع به استفاده کنید' },
  ],
}

writeFileSync('/tmp/test-render.html', generateDeckHTML(deck, { accent: 'indigo' }))
console.log('OK -> /tmp/test-render.html')
