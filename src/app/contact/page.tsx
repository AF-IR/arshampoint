import type { Metadata } from 'next'
import { Mail, Phone, Clock, MapPin, MessageSquareWarning, Lightbulb, Bug } from 'lucide-react'
import { SITE_URL, CREATOR } from '@/components/arsham/content'
import {
  SeoHeader, SeoFooter, PageHero, Prose, H2, H3, RelatedLinks, JsonLd, breadcrumbLd,
} from '@/components/arsham/seo-shell'

export const metadata: Metadata = {
  title: 'تماس با ما — ارتباط با سازنده آرشام پوینت',
  description:
    'راه‌های ارتباط با آرشام فاضل سازنده آرشام پوینت: ایمیل arsham.fazel@gmail.com و تلفن ۰۹۹ ۴۴۸۲ ۵۲۵۱ — پشتیبانی، پیشنهاد قابلیت و گزارش اشکال، همه از یک مسیر.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'تماس با آرشام پوینت',
    description: 'ایمیل و تلفن مستقیم سازنده؛ پاسخ در روزهای کاری حداکثر ظرف ۲۴ ساعت.',
    url: `${SITE_URL}/contact`,
    images: ['/og.png'],
  },
}

const CHANNELS = [
  {
    icon: Mail,
    title: 'ایمیل',
    value: CREATOR.email,
    href: `mailto:${CREATOR.email}`,
    hint: 'بهترین مسیر برای سوال‌های فنی و همکاری',
  },
  {
    icon: Phone,
    title: 'تلفن و پیامک',
    value: CREATOR.phoneFa,
    href: CREATOR.phoneHref,
    hint: 'برای موضوعات فوری — به‌صورت لاتین: ' + CREATOR.phoneDisplay,
  },
  {
    icon: Clock,
    title: 'زمان پاسخ',
    value: 'حداکثر ۲۴ ساعت',
    hint: 'روزهای کاری؛ تعطیلات رسمی ممکن است کمی طول بکشد',
  },
  {
    icon: MapPin,
    title: 'موقعیت',
    value: 'تهران، ایران',
    hint: 'تیم کاملاً ریموت است؛ جلسه آنلاین ترجیح داده می‌شود',
  },
]

const TOPICS = [
  {
    icon: MessageSquareWarning,
    title: 'پشتیبانی و رفع مشکل',
    desc: 'اگر در ورود، تولید ارائه یا دانلود فایل به خطایی خوردید، ما سریع پیگیری می‌کنیم.',
  },
  {
    icon: Lightbulb,
    title: 'پیشنهاد قابلیت',
    desc: 'ایده‌های شما نقشه راه محصول را می‌سازد؛ بسیاری از بهبودهای اخیر از همین پیشنهادها آمده‌اند.',
  },
  {
    icon: Bug,
    title: 'گزارش اشکال',
    desc: 'متن دقیق خطا، نام مرورگر و زمان رخداد را بنویسید تا چند برابر سریع‌تر رسیدگی شود.',
  },
]

export default function ContactSeoPage() {
  const contactLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'تماس با آرشام پوینت',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'آرشام پوینت',
      alternateName: 'Arsham Point',
      url: SITE_URL,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: CREATOR.email,
          telephone: CREATOR.phoneDisplay,
          availableLanguage: ['fa', 'en'],
          areaServed: 'IR',
        },
      ],
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <PageHero
          kicker="تماس با ما"
          title="حرف یا سوالی دارید؟ بشنویم"
          lead="پشتیبانی، پیشنهاد قابلیت جدید یا همکاری — همه از یک مسیر. پیام‌ها مستقیماً به آرشام فاضل، سازنده محصول، می‌رسد."
        />

        {/* contact cards */}
        <section aria-label="راه‌های ارتباطی" className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4 pb-12">
          {CHANNELS.map((c) => {
            const inner = (
              <>
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#8AB4F8]/15 text-[#8AB4F8] shrink-0">
                  <c.icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-xs text-[#9AA0A6] mb-0.5">{c.title}</span>
                  <span className="block text-sm font-bold" dir={c.href ? 'ltr' : undefined}>
                    {c.value}
                  </span>
                  <span className="block text-[11px] text-[#9AA0A6] leading-5 mt-1">{c.hint}</span>
                </span>
              </>
            )
            const cls =
              'flex items-start gap-3 rounded-2xl border border-white/10 bg-[#12141A] p-4 text-right ' +
              (c.href ? 'hover:border-[#8AB4F8]/40 transition-colors' : '')
            return c.href ? (
              <a key={c.title} href={c.href} className={cls}>{inner}</a>
            ) : (
              <div key={c.title} className={cls}>{inner}</div>
            )
          })}
        </section>

        <Prose>
          <H2>برای هر موضوع، مسیر درست</H2>
          <p>
            پیام‌تان را کوتاه‌تر و پاسخ را دقیق‌تر می‌کند اگر موضوع را از ابتدا مشخص کنید. سه مسیر
            رایج این است:
          </p>
          <div className="grid gap-3">
            {TOPICS.map((t) => (
              <div key={t.title} className="flex gap-3 items-start rounded-2xl border border-white/10 bg-[#12141A] p-4">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#8AB4F8]/15 text-[#8AB4F8] shrink-0">
                  <t.icon className="w-5 h-5" />
                </span>
                <span>
                  <h3 className="font-black text-sm">{t.title}</h3>
                  <p className="text-[#9AA0A6] leading-7 mt-1">{t.desc}</p>
                </span>
              </div>
            ))}
          </div>

          <H2>پیش از ایمیل زدن</H2>
          <p>
            اگر مشکل فنی دارید (مثلاً خطا هنگام تولید ارائه یا ورود به حساب)، لطفاً متن دقیق پیام خطا،
            مرورگر و زمان رخداد را در ایمیل ذکر کنید؛ رسیدگی چند برابر سریع‌تر می‌شود. برای پیشنهاد
            قابلیت جدید هم خوشحال می‌شویم بدانیم چه گردش‌کاری برای شما مهم است — بسیاری از بهبودهای
            اخیر محصول از همین پیشنهادها آمده‌اند. پاسخ همه پیام‌ها را می‌خوانیم و روزهای کاری حداکثر
            ظرف ۲۴ ساعت برمی‌گردانیم.
          </p>
        </Prose>
        <RelatedLinks
          current="/contact"
          items={[
            { href: '/faq', label: 'سوالات متداول', desc: 'شاید پاسخ سوال‌تان همین‌جا باشد' },
            { href: '/about', label: 'درباره ما', desc: 'داستان محصول و سازنده' },
            { href: '/features', label: 'امکانات', desc: 'همه قابلیت‌های محصول' },
            { href: '/', label: 'صفحه اصلی', desc: 'ساخت پرزنتیشن با هوش مصنوعی' },
          ]}
        />
      </main>
      <SeoFooter />
      <JsonLd data={contactLd} />
      <JsonLd data={breadcrumbLd(SITE_URL, 'تماس با ما', '/contact')} />
    </div>
  )
}
