import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  BRAND, BRAND_EN, TAGLINE, SITE_URL, CREATOR, DESCRIPTION, KEYWORDS, SITE_DOMAIN,
} from "@/components/arsham/content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} | ${TAGLINE}`,
    template: `%s | ${BRAND}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: CREATOR.name, url: SITE_URL }],
  creator: CREATOR.name,
  publisher: `${BRAND} — ${CREATOR.name}`,
  applicationName: BRAND,
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: BRAND,
    title: `${BRAND} | ${TAGLINE}`,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${BRAND} — ${TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} | ${TAGLINE}`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0C10",
};

/* Structured data: Organization (with contact points) + WebApplication + FAQ (SEO) */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: BRAND,
      alternateName: [BRAND_EN, SITE_DOMAIN],
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
      founder: {
        "@type": "Person",
        name: CREATOR.name,
        alternateName: CREATOR.nameEn,
        email: CREATOR.email,
        telephone: CREATOR.phoneDisplay,
        jobTitle: CREATOR.role,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: CREATOR.email,
          telephone: CREATOR.phoneDisplay,
          contactType: "customer support",
          availableLanguage: ["fa", "en"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: BRAND,
      alternateName: [BRAND_EN, SITE_DOMAIN],
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/mag#blog`,
      name: `${BRAND} مگ`,
      url: `${SITE_URL}/mag`,
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
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
      email: CREATOR.email,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    /* FAQPage JSON-LD lives ONLY on pages that actually show the FAQ
     * (home: first 4 items, /faq: all items) per Google guidelines. */
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
