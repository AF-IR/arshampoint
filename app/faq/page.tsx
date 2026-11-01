import type { Metadata } from 'next'
import { SITE_URL, FAQS } from '@/components/arsham/content'
import {
  SeoHeader, SeoFooter, PageHero, RelatedLinks, JsonLd, breadcrumbLd,
} from '@/components/arsham/seo-shell'

export const metadata: Metadata = {
  title: 'سوالات متداول ساخت پاورپوینت فارسی با هوش مصنوعی',
  description:
    'پاسخ پرتکرارترین سوال‌ها درباره آرشام پوینت: فرمت خروجی HTML، تفاوت حالت متنی (آفلاین) و دارای تصویر، ویرایش ارائه‌ها، امنیت حساب کاربری، محل ذخیره داده‌ها و پشتیبانی از زبان فارسی و انگلیسی.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'سوالات متداول آرشام پوینت',
    description: 'هر سوالی که درباره ساخت پاورپوینت فارسی با هوش مصنوعی دارید، اینجا پاسخ دارد.',
    url: `${SITE_URL}/faq`,
    images: ['/og.png'],
  },
}

/* Native <details>/<summary> — the full Q&A is in the server HTML,
 * crawlable without JavaScript, and matches the FAQPage JSON-LD. */
export default function FaqSeoPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <PageHero
          kicker="سوالات متداول"
          title="هر سوالی که درباره آرشام پوینت دارید"
          lead="پاسخ پرتکرارترین سوال‌ها درباره خروجی، حساب کاربری، امنیت داده‌ها و زبان‌های پشتیبانی‌شده. پاسخ سوال‌تان را پیدا نکردید؟ از صفحه تماس بپرسید."
        />
        <div className="max-w-3xl mx-auto grid gap-3 pb-10">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group border border-white/10 bg-[#12141A] rounded-2xl px-5 open:border-[#8AB4F8]/30 transition-colors"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none py-4 [&::-webkit-details-marker]:hidden">
                <h3 className="font-bold text-sm leading-7">{f.q}</h3>
                <span
                  aria-hidden="true"
                  className="text-[#8AB4F8] text-2xl leading-none group-open:rotate-45 transition-transform shrink-0"
                >
                  +
                </span>
              </summary>
              <p className="text-sm text-[#9AA0A6] leading-8 pb-5">{f.a}</p>
            </details>
          ))}
        </div>
        <RelatedLinks
          current="/faq"
          items={[
            { href: '/features', label: 'امکانات', desc: 'همه قابلیت‌ها از تولید تا دانلود' },
            { href: '/contact', label: 'تماس با ما', desc: 'سوال دیگری دارید؟ بپرسید' },
            { href: '/', label: 'صفحه اصلی', desc: 'همین حالا اولین پرزنتیشن را بسازید' },
            { href: '/privacy', label: 'حریم خصوصی', desc: 'داده‌های شما کجا و چگونه ذخیره می‌شود' },
          ]}
        />
      </main>
      <SeoFooter />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd(SITE_URL, 'سوالات متداول', '/faq')} />
    </div>
  )
}
