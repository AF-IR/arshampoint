import type { Metadata } from 'next'
import { SITE_URL, BRAND, PRO_PLAN } from '@/components/arsham/content'
import {
  SeoHeader, SeoFooter, PageHero, JsonLd, breadcrumbLd,
} from '@/components/arsham/seo-shell'
import { CheckoutReview } from '@/components/arsham/checkout'

export const metadata: Metadata = {
  title: 'بررسی سفارش — خرید اشتراک ۳۰ روزه پلن حرفه‌ای',
  description:
    'قبل از پرداخت، سفارش خود را مرور کنید: اشتراک حرفه‌ای آرشام پوینت، دوره دقیقاً ۳۰ روزه، ۱۴۹٬۰۰۰ تومان با درگاه امن زرین‌پال، فعال‌سازی آنی و بدون تمدید خودکار.',
  alternates: { canonical: '/checkout' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'بررسی سفارش — اشتراک حرفه‌ای آرشام پوینت',
    description:
      'مرور جزئیات خرید (مبلغ، دوره ۳۰ روزه، امکانات و شرایط) و سپس پرداخت امن با زرین‌پال؛ فعال‌سازی بلافاصله پس از پرداخت.',
    url: `${SITE_URL}/checkout`,
    images: ['/og.png'],
  },
}

/* Product/Offer — داده ساختاریافته برای موتورهای جست‌وجو */
const OFFER_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `${BRAND} — اشتراک ۳۰ روزه پلن حرفه‌ای`,
  description:
    'ارائه نامحدود با هوش مصنوعی در دوره ۳۰ روزه، انتخاب دستی قالب طراحی و انواع اسلاید، خروجی بدون نشان برند و پشتیبانی ایمیلی.',
  brand: { '@type': 'Brand', name: BRAND },
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/checkout`,
    priceCurrency: 'IRR',
    price: PRO_PLAN.priceRials,
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2027-01-01',
  },
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <PageHero
          kicker="گام ۱ از ۲ — بررسی سفارش"
          title="اول مرور کنید، بعد پرداخت"
          lead="اینجا همه جزئیات خرید را می‌بینید: چه می‌خرید، چقدر است و چه شرایطی دارد. فقط وقتی مطمئن شدید، به درگاه امن زرین‌پال می‌روید."
        />
        <section className="pb-14">
          <CheckoutReview />
        </section>
      </main>
      <SeoFooter />
      <JsonLd data={breadcrumbLd(SITE_URL, 'بررسی سفارش', '/checkout')} />
      <JsonLd data={OFFER_LD} />
    </div>
  )
}
