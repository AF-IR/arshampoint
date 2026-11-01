import type { Metadata } from 'next'
import { Mail, Phone } from 'lucide-react'
import { SITE_URL, CREATOR } from '@/components/arsham/content'
import {
  SeoHeader, SeoFooter, PageHero, Prose, H2, H3, RelatedLinks, JsonLd, breadcrumbLd,
} from '@/components/arsham/seo-shell'

export const metadata: Metadata = {
  title: 'درباره ما — داستان آرشام پوینت',
  description:
    'آرشام پوینت وب‌اپلیکیشن فارسی ساخت پرزنتیشن با هوش مصنوعی است؛ ساخته آرشام فاضل. داستان محصول، ماموریت، زیرساخت فنی (Next.js، Supabase، مدل GLM) و چشم‌انداز ما.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'درباره آرشام پوینت',
    description: 'داستان ساخت ابزار فارسی تولید پرزنتیشن با هوش مصنوعی.',
    url: `${SITE_URL}/about`,
    images: ['/og.png'],
  },
}

export default function AboutSeoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent" dir="rtl">
      <SeoHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-5">
        <PageHero
          kicker="درباره ما"
          title="آرشام پوینت چیست و چرا ساخته شد؟"
          lead="ما باور داریم ساختن ارائه نباید ساعت‌ها وقت بگیرد؛ ایده مهم است، نه چیدمان جعبه‌های متنی."
        />
        <Prose>
          <p>
            آرشام پوینت (Arsham Point) یک وب‌اپلیکیشن فارسی برای تولید خودکار پرزنتیشن است که با هوش
            مصنوعی روی موتور اختصاصی آرشام پوینت کار می‌کند. کاربر فقط موضوع، مخاطب هدف، لحن و تعداد اسلایدها را
            مشخص می‌کند و سیستم در چند ده ثانیه یک ارائه کامل شامل اسلاید جلد، دستور جلسه، نکات کلیدی،
            آمار، نقل‌قول، خط زمانی و اسلاید جمع‌بندی تحویل می‌دهد. نتیجه، یک فایل HTML مستقل است که روی
            هر مرورگری اجرا می‌شود و مالکیت آن کاملاً در اختیار کاربر است.
          </p>

          <H2>ماموریت ما</H2>
          <p>
            میلیون‌ها نفر هر هفته ساعت‌هایی از وقت‌شان را صرف قالب‌بندی اسلایدها می‌کنند، در حالی که ارزش
            واقعی ارائه در محتواست. ماموریت ما حذف بار فنی و طراحی از دوش کاربر است: معلمی که درس
            فردایش را آمار می‌کند، دانشجویی که پروژه‌اش را دفاع می‌کند، یا مدیر محصولی که نتایج فصلی را
            گزارش می‌دهد — همه باید در کمترین زمان به ارائه‌ای برسند که از نظر ساختار حرفه‌ای است و از
            نظر بصری یکدست. راست‌چین بودن کامل و پشتیبانی درست از زبان فارسی هم چیزی است که ابزارهای
            خارجی کمتر به آن اهمیت می‌دهند و ما آن را هسته محصول قرار داده‌ایم.
          </p>

          <H2>زیرساخت فنی</H2>
          <p>
            محصول روی Next.js و React ساخته شده؛ رابط کاربری با Tailwind CSS و کامپوننت‌های shadcn/ui
            پیاده شده و برای همه صفحات طراحی واکنش‌گرا در نظر گرفته شده است. تولید محتوا با مدل‌های
            زبانی موتور آرشام پوینت انجام می‌شود و ساختار هر ارائه به‌صورت JSON ساخت‌یافته ذخیره می‌شود تا
            خروجی همیشه قابل بازتولید باشد. احراز هویت کاربران و ذخیره‌سازی داده‌ها روی PostgreSQL سرویس
            Supabase است و استقرار نسخه اصلی روی Vercel پشتیبانی می‌شود. خروجی نهایی، HTML تک‌فایلی با
            فونت وزیرمتن، دو تم روشن/تاریک و کنترل کیبورد است.
          </p>

          <H2>سازنده محصول</H2>
          <p>
            آرشام پوینت توسط <strong className="text-[#E8EAED]">{CREATOR.name}</strong> ({CREATOR.nameEn})
            ساخته و نگه‌داری می‌شود؛ توسعه‌دهنده فول‌استک با تمرکز روی محصول‌های فارسی‌دوست. برای
            پیشنهاد همکاری، سوال فنی یا بازخورد درباره محصول می‌توانید مستقیماً با ایشان در ارتباط
            باشید:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 not-italic">
            <a
              href={`mailto:${CREATOR.email}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12141A] p-4 hover:border-[#8AB4F8]/40 transition-colors group"
            >
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#8AB4F8]/15 text-[#8AB4F8] shrink-0">
                <Mail className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-xs text-[#9AA0A6]">ایمیل</span>
                <span className="block text-sm font-bold group-hover:text-[#8AB4F8]" dir="ltr">{CREATOR.email}</span>
              </span>
            </a>
            <a
              href={CREATOR.phoneHref}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12141A] p-4 hover:border-[#8AB4F8]/40 transition-colors group"
            >
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#8AB4F8]/15 text-[#8AB4F8] shrink-0">
                <Phone className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-xs text-[#9AA0A6]">تلفن تماس</span>
                <span className="block text-sm font-bold group-hover:text-[#8AB4F8]" dir="ltr">{CREATOR.phoneDisplay}</span>
              </span>
            </a>
          </div>

          <H3>چشم‌انداز</H3>
          <p>
            نقشه راه ما افزودن قالب‌های تخصصی رشته‌ها، ویرایشگر محتوای هوشمند برای بازنویسی اسلایدها،
            خروجی PDF و تصویر، و امکان هم‌ویرایش تیمی است. اگر ایده‌ای دارید که می‌توانید ارائه‌اش را
            تصور کنید، آرشام پوینت بقیه مسیر را کوتاه می‌کند.
          </p>
        </Prose>
        <RelatedLinks
          current="/about"
          items={[
            { href: '/features', label: 'امکانات', desc: 'قابلیت‌های فنی محصول را ببینید' },
            { href: '/contact', label: 'تماس با ما', desc: 'راه‌های ارتباطی با سازنده' },
            { href: '/faq', label: 'سوالات متداول', desc: 'پاسخ سوال‌های پرتکرار' },
            { href: '/', label: 'صفحه اصلی', desc: 'شروع ساخت پرزنتیشن' },
          ]}
        />
      </main>
      <SeoFooter />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'درباره آرشام پوینت',
          url: `${SITE_URL}/about`,
          mainEntity: {
            '@type': 'Organization',
            name: 'آرشام پوینت',
            alternateName: 'Arsham Point',
            url: SITE_URL,
            founder: {
              '@type': 'Person',
              name: CREATOR.name,
              alternateName: CREATOR.nameEn,
              email: CREATOR.email,
              telephone: CREATOR.phoneDisplay,
              jobTitle: CREATOR.role,
            },
          },
        }}
      />
      <JsonLd data={breadcrumbLd(SITE_URL, 'درباره ما', '/about')} />
    </div>
  )
}
