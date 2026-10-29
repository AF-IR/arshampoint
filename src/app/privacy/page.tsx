import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { SITE_URL, CREATOR } from '@/components/arsham/content'
import {
  SeoHeader, SeoFooter, PageHero, Prose, H2, RelatedLinks, JsonLd, breadcrumbLd,
} from '@/components/arsham/seo-shell'

export const metadata: Metadata = {
  title: 'سیاست حریم خصوصی',
  description:
    'سیاست حفظ حریم خصوصی آرشام پوینت: چه داده‌هایی ذخیره می‌شود، کجا نگه‌داری می‌شود، رمز عبور چگونه محافظت می‌شود و چگونه می‌توانید داده‌های خود را حذف کنید.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'حریم خصوصی در آرشام پوینت',
    description: 'شفاف بودن درباره داده‌ها: چه چیزی ذخیره می‌شود، کجا و چرا.',
    url: `${SITE_URL}/privacy`,
    images: ['/og.png'],
  },
}

export default function PrivacySeoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <PageHero
          kicker="حریم خصوصی"
          title="سیاست حفظ حریم خصوصی"
          lead="شفاف بودن درباره داده‌ها: چه چیزی ذخیره می‌شود، کجا و چرا."
        />
        <Prose>
          <div className="flex gap-3 items-start rounded-2xl border border-[#8AB4F8]/25 bg-[#8AB4F8]/10 p-4">
            <ShieldCheck className="w-5 h-5 text-[#8AB4F8] shrink-0 mt-1" />
            <p className="text-sm leading-7">
              خلاصه: ما فقط ایمیلی که با آن ثبت‌نام می‌کنید و پرزنتیشن‌هایی که خودتان می‌سازید را ذخیره
              می‌کنیم؛ نه می‌فروشیم، نه با کسی به اشتراک می‌گذاریم و نه برای تبلیغ استفاده می‌کنیم.
            </p>
          </div>

          <H2>چه داده‌هایی جمع‌آوری می‌شود؟</H2>
          <p>
            هنگام ثبت‌نام، ایمیل و در صورت تمایل نام شما ذخیره می‌شود. هنگام ساخت ارائه، موضوع،
            تنظیمات (لحن، تعداد اسلاید، پالت رنگ)، ساختار محتوایی تولیدشده (DeckJSON) و فایل HTML نهایی
            در حساب شما ذخیره می‌شود. اطلاعات ورود و رفتار کاربران در سرویس‌های شخص ثالث تبلیغاتی
            ردیابی نمی‌شود و ما از آنالیتیکس مزاحم یا کوکی‌های تبلیغاتی استفاده نمی‌کنیم.
          </p>

          <H2>داده‌ها کجا نگه‌داری می‌شوند؟</H2>
          <p>
            حساب کاربری و پرزنتیشن‌ها روی دیتابیس PostgreSQL سرویس Supabase (زیرساخت ابری با رمزنگاری
            در حال انتقال و در حالت سکون) ذخیره می‌شود. سیاست‌های Row Level Security تضمین می‌کند که
            هیچ کاربری حتی از مسیر مستقیم دیتابیس به داده کاربر دیگر دسترسی نداشته باشد. کلیدهای
            مدیریتی (service role) فقط در سرور استفاده می‌شوند و هرگز به مرورگر ارسال نمی‌شوند.
          </p>

          <H2>رمز عبور و نشست ورود چگونه محافظت می‌شود؟</H2>
          <p>
            رمزهای عبور توسط سرویس احراز هویت Supabase به‌صورت رمزنگاری‌شده نگه‌داری می‌شوند و هیچ‌کس —
            حتی ادمین سیستم — به مقدار خام آن‌ها دسترسی ندارد. نشست ورود با توکن‌های امضاشده و کوکی
            امن httpOnly با عمر ۳۰ روزه مدیریت می‌شود؛ یعنی با بستن مرورگر هم حساب شما باز نمی‌شود و
            لازم نیست هر بار دوباره وارد شوید. هر زمان که «خروج» را بزنید، هم توکن سمت مرورگر و هم
            کوکی امن باطل می‌شود.
          </p>

          <H2>دسترسی و حذف داده‌ها</H2>
          <p>
            هر زمان بخواهید می‌توانید ارائه‌های خود را از کتابخانه حذف کنید و با خروج از حساب، نشست
            شما در همه حالت‌ها پایان می‌یابد. برای حذف کامل حساب و داده‌های مرتبط، به {CREATOR.name}
            {' '}در <a href={`mailto:${CREATOR.email}`} className="text-[#8AB4F8] hover:underline" dir="ltr">{CREATOR.email}</a> درخواست
            دهید؛ حداکثر ظرف ۷ روز کاری انجام می‌شود.
          </p>

          <H2>به‌روزرسانی این سیاست</H2>
          <p>
            اگر تغییر مهمی در نحوه پردازش داده‌ها ایجاد شود، پیش از اعمال، از همین صفحه اطلاع‌رسانی
            می‌شود. تاریخ آخرین بازبینی: اکتبر ۲۰۲۵.
          </p>
        </Prose>
        <RelatedLinks
          current="/privacy"
          items={[
            { href: '/terms', label: 'قوانین استفاده', desc: 'شرایط استفاده از سرویس' },
            { href: '/contact', label: 'تماس با ما', desc: 'درخواست حذف حساب یا سوال درباره داده‌ها' },
            { href: '/faq', label: 'سوالات متداول', desc: 'سوال‌های پرتکرار درباره امنیت' },
            { href: '/', label: 'صفحه اصلی', desc: 'بازگشت به محصول' },
          ]}
        />
      </main>
      <SeoFooter />
      <JsonLd data={breadcrumbLd(SITE_URL, 'حریم خصوصی', '/privacy')} />
    </div>
  )
}
