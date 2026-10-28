import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BRAND, BRAND_EN, TAGLINE, FAQS, SUPPORT_EMAIL } from "@/components/arsham/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arshampoint.vercel.app";
const DESCRIPTION =
  "آرشام پوینت؛ با هوش مصنوعی Z.ai موضوع ارائه‌ات را به پرزنتیشن HTML کامل و راست‌چین تبدیل کن — اسلاید جلد، آمار، نقل‌قول و خط زمانی، با تم شبانه/روشن و خروجی تک‌فایلی قابل دانلود.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} | ${TAGLINE}`,
    template: `%s | ${BRAND}`,
  },
  description: DESCRIPTION,
  keywords: [
    "پرزنتیشن", "ساخت پرزنتیشن", "پاورپوینت آنلاین", "پرزنتیشن هوش مصنوعی",
    "اسلاید فارسی", "ارائه آنلاین", "هوش مصنوعی Z.ai", "GLM", "HTML پرزنتیشن",
    "آرشام پوینت", "Arsham Point",
  ],
  authors: [{ name: BRAND_EN }],
  creator: BRAND_EN,
  applicationName: BRAND,
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: BRAND,
    title: `${BRAND} | ${TAGLINE}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} | ${TAGLINE}`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* Structured data: WebApplication + FAQ (SEO) */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: BRAND,
      alternateName: BRAND_EN,
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "fa-IR",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList:
        "تولید خودکار محتوای پرزنتیشن با هوش مصنوعی، خروجی HTML تک‌فایلی، تم شبانه و روشن، کتابخانه اختصاصی کاربران",
      email: SUPPORT_EMAIL,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Self-hosted Vazirmatn — preloaded, zero third-party round-trips */}
        <link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/vazirmatn-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#0B0C10] text-[#E8EAED] font-[Vazirmatn,Tahoma,sans-serif]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
