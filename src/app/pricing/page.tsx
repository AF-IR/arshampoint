import Link from 'next/link'
import { SITE_URL } from '@/components/arsham/content'
import { seoMetadata } from '@/lib/seo'
import {
  SeoHeader, SeoFooter, PageHero, Prose, H2, RelatedLinks, JsonLd, breadcrumbLd,
} from '@/components/arsham/seo-shell'
import { PricingPlans } from '@/components/arsham/pricing'

export const metadata = seoMetadata({
  title: 'قیمت‌گذاری — پلن رایگان و حرفه‌ای ساخت پاورپوینت با هوش مصنوعی',
  description:
    'قیمت آرشام پوینت: پلن رایگان با روزانه ۳ ارائه، پلن حرفه‌ای با ارائه نامحدود و خروجی بدون نشان برند در دوره‌های ۳۰ روزه‌ی ۱۴۹ هزار تومانی با درگاه امن زرین‌پال، و پلن سازمانی سفارشی برای مدارس و شرکت‌ها.',
  path: '/pricing',
  ogTitle: 'قیمت‌گذاری آرشام پوینت — پلن رایگان و حرفه‌ای',
  ogDescription:
    'پاورپوینت هوش مصنوعی رایگان شروع کنید؛ حرفه‌ای شوید تا ارائه نامحدود و خروجی بدون برند داشته باشید.',
})

/* FAQPage JSON-LD — scoped to this page, matching the visible FAQ prose */
const PRICING_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'آرشام پوینت رایگان است؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'بله؛ پلن رایگان روزانه تا ۳ ارائه کامل با همه قالب‌های رنگی و دو حالت متنی و تصویری می‌دهد و هیچ کارت بانکی هم نمی‌خواهد.',
      },
    },
    {
      '@type': 'Question',
      name: 'پلن حرفه‌ای چه مزیتی دارد؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'در پلن حرفه‌ای سقف ارائه‌ها برداشته می‌شود، نشان «آرشام پوینت» از فایل خروجی حذف می‌شود و پشتیبانی ایمیلی با اولویت دریافت می‌کنید.',
      },
    },
    {
      '@type': 'Question',
      name: 'پرداخت چطور انجام می‌شود؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'با کلیک روی خرید اشتراک، اول صفحه «بررسی سفارش» با جزئیات مبلغ، دوره ۳۰ روزه و شرایط نمایش داده می‌شود و بعد با پذیرش شرایط به درگاه امن زرین‌پال می‌روید. اشتراک بلافاصله بعد از پرداخت فعال می‌شود.',
      },
    },
    {
      '@type': 'Question',
      name: 'فرق آرشام پوینت با ابزارهای خارجی مثل گاما یا کنوا چیست؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'آرشام پوینت برای فارسی و راست‌چین ساخته شده، با تومان و درگاه زرین‌پال پرداخت می‌شود و به کارت بین‌المللی و تحریم‌شکن نیاز ندارد. پلن رایگان آن نیز برخلاف اعتبار یک‌بارمصرف ابزارهای خارجی، هر روز تازه می‌شود: روزانه ۳ ارائه کامل.',
      },
    },
  ],
}

/* ── مقایسه با ابزارهای تجاری خارجی ──
 * قیمت‌ها تقریبی و بر اساس صفحات رسمی ابزارها (پاییز ۱۴۰۵) است. */
const COMPARISON_ROWS: {
  name: string
  price: string
  free: string
  rtl: string
  payment: string
  us?: boolean
}[] = [
  {
    name: 'آرشام پوینت',
    price: '۱۴۹٬۰۰۰ تومان / ۳۰ روز (≈ ۵ هزار تومان در روز)',
    free: '۳ ارائه در روز — همیشه و بدون کارت',
    rtl: 'بومی و کامل (راست‌چین واقعی)',
    payment: 'بله — زرین‌پال، تومان',
    us: true,
  },
  {
    name: 'Gamma',
    price: 'از حدود ۱۰ دلار در ماه (Plus)',
    free: '۴۰۰ اعتبار یک‌بارمصرف (حدود ۱۰ ارائه، شارژ نمی‌شود)',
    rtl: 'خروجی چپ‌چین؛ راست‌چین ضعیف',
    payment: 'کارت بین‌المللی لازم',
  },
  {
    name: 'Canva (AI ارائه)',
    price: 'حدود ۱۵ دلار در ماه (Pro)',
    free: 'استفاده محدود از ابزارهای AI',
    rtl: 'قالب‌ها چپ‌چین‌اند؛ فارسی دستی',
    payment: 'کارت بین‌المللی لازم',
  },
  {
    name: 'Beautiful.ai',
    price: 'از حدود ۱۲ دلار در ماه (سالانه؛ ماهانه تا ۴۵ دلار)',
    free: 'فقط ۱۴ روز آزمایشی',
    rtl: 'انگلیسی‌محور',
    payment: 'کارت بین‌المللی لازم',
  },
  {
    name: 'Copilot در پاورپوینت',
    price: 'حدود ۲۰ دلار در ماه + هزینه Microsoft 365',
    free: 'ندارد',
    rtl: 'متوسط؛ قالب فارسی ندارد',
    payment: 'کارت بین‌المللی لازم',
  },
]

function ComparisonSection() {
  return (
    <section aria-label="مقایسه با ابزارهای تجاری" className="max-w-4xl mx-auto grid gap-5 pb-12">
      <H2>مقایسه با ابزارهای تجاری خارجی</H2>
      <p className="text-sm text-[#9AA0A6] leading-7">
        ابزارهای خارجی خوبی هستند، اما برای کاربر ایرانی سه مشکل جدی دارند: کارت بین‌المللی می‌خواهند،
        برای فارسی و راست‌چین طراحی نشده‌اند و پلن رایگان‌شان یا یک‌بارمصرف است یا تقریباً وجود ندارد.
        جدول زیر وضعیت را شفاف مقایسه می‌کند:
      </p>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-right text-[12.5px] min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-white/5 text-[#E8EAED]">
              <th scope="col" className="p-3.5 font-black">ابزار</th>
              <th scope="col" className="p-3.5 font-black">شروع پلن پولی</th>
              <th scope="col" className="p-3.5 font-black">ارائه رایگان</th>
              <th scope="col" className="p-3.5 font-black">فارسی و راست‌چین</th>
              <th scope="col" className="p-3.5 font-black">پرداخت تومانی</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r) => (
              <tr
                key={r.name}
                className={`border-t border-white/8 align-top leading-6 ${
                  r.us ? 'bg-[#8AB4F8]/8 font-bold text-[#E8EAED]' : 'text-[#C7CBD1]'
                }`}
              >
                <th scope="row" className={`p-3.5 font-black whitespace-nowrap ${r.us ? 'text-[#8AB4F8]' : ''}`}>
                  {r.name}
                </th>
                <td className="p-3.5">{r.price}</td>
                <td className="p-3.5">{r.free}</td>
                <td className="p-3.5">{r.rtl}</td>
                <td className="p-3.5 whitespace-nowrap">{r.payment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[#9AA0A6] leading-6">
        * قیمت ابزارهای خارجی تقریبی و بر اساس صفحات رسمی آن‌ها در پاییز ۱۴۰۵ است و ممکن است تغییر کند؛
        نرخ تبدیل دلار هم متغیر است. حتی بدون احتساب نرخ ارز، در پلن رایگان آرشام پوینت هر روز ۳ ارائه
        کامل تازه می‌شود — چیزی که هیچ‌کدام از ابزارهای بالا نمی‌دهند.
      </p>
    </section>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <PageHero
          kicker="قیمت‌گذاری"
          title="رایگان شروع کنید؛ هر وقت خواستید حرفه‌ای شوید"
          lead="پلن رایگان آرشام پوینت همیشه رایگان است و قالب طراحی هوشمند و دو حالت تولید را دارد. با پلن حرفه‌ای، سقف روزانه برداشته می‌شود، انتخاب دستی ۱۲ قالب طراحی و نوع اسلایدها باز می‌شود و فایل خروجی کاملاً بدون نشان برند تحویل می‌گیرید."
        />

        <section className="mt-2">
          <PricingPlans />
        </section>

        <div className="mt-14">
          <ComparisonSection />
        </div>

        <Prose>
          <H2>سوال‌های پرتکرار درباره پلن‌ها</H2>
          <p>
            <strong>پلن رایگان چه سقفی دارد؟</strong> در هر ۲۴ ساعت می‌توانید تا ۳ ارائه کامل بسازید؛
            سهمیه روی «تولید» شمرده می‌شود نه نگه‌داری، پس حذف ارائه‌های قدیمی سهمیه جدید نمی‌سازد.
            محاسبه به تقویم گره نخورده است: پنجره لغزان ۲۴ ساعته است و هر ارائه دقیقاً ۲۴ ساعت پس از
            ساخت از سهمیه خارج می‌شود؛ یعنی هر روز ۳ ارائه تازه در اختیار دارید.
          </p>
          <p>
            <strong>خرید چطور انجام می‌شود؟</strong> با کلیک روی «خرید اشتراک»، اول صفحه{' '}
            <Link href="/checkout" className="text-[#8AB4F8] hover:underline">بررسی سفارش</Link> باز می‌شود:
            مبلغ دقیق، دوره ۳۰ روزه، امکانات و شرایط را آن‌جا می‌بینید و بعد از پذیرش شرایط، به درگاه
            امن زرین‌پال می‌روید. یعنی هیچ‌وقت مستقیم و بی‌اطلاع به درگاه پرت نمی‌شوید.
          </p>
          <p>
            <strong>نشان برند در خروجی چیست؟</strong> در پلن رایگان، یک دکمه کوچک «آرشام پوینت» گوشه نوار
            کنترل ارائه شما قرار می‌گیرد که به سایت ما پیوند دارد. در پلن حرفه‌ای این دکمه کامل حذف می‌شود و
            فایل خروجی ۱۰۰٪ متعلق به شماست — مناسب ارائه‌های رسمی و مشتری‌محور.
          </p>
          <p>
            <strong>اشتراک چگونه تمدید می‌شود؟</strong> هر دوره اشتراک حرفه‌ای دقیقاً ۳۰ روز است (نه
            یک ماه تقویمی) و پرداخت از طریق درگاه زرین‌پال انجام می‌شود؛ تمدید خودکار نداریم، پس هر
            زمان که بخواهید فقط برای همان ۳۰ روز پرداخت می‌کنید.
            برای پلن سازمانی (حساب تیمی، قالب اختصاصی با لوگوی سازمان و فاکتور رسمی) از صفحه تماس پیام بدهید.
          </p>
          <p>
            از صفحه <Link href="/features" className="text-[#8AB4F8] hover:underline">امکانات</Link> همه
            قابلیت‌های محصول را ببینید، یا صفحه{' '}
            <Link href="/faq" className="text-[#8AB4F8] hover:underline">سوالات متداول</Link> را برای جزئیات
            خروجی و حریم خصوصی بخوانید.
          </p>
        </Prose>

        <RelatedLinks
          current="/pricing"
          items={[
            { href: '/checkout', label: 'بررسی سفارش و خرید اشتراک', desc: 'مرور جزئیات خرید قبل از پرداخت' },
            { href: '/features', label: 'امکانات', desc: 'مقایسه کامل قابلیت‌های محصول' },
            { href: '/faq', label: 'سوالات متداول', desc: 'پاسخ سوال‌های پرتکرار درباره خروجی و حساب' },
            { href: '/contact', label: 'تماس با ما', desc: 'سوال درباره پلن سازمانی و فاکتور' },
          ]}
        />
      </main>
      <SeoFooter />
      <JsonLd data={breadcrumbLd(SITE_URL, 'قیمت‌گذاری', '/pricing')} />
      <JsonLd data={PRICING_FAQ_LD} />
    </div>
  )
}
