# Worklog

---
Task ID: 1
Agent: Main Agent (Z.ai)
Task: ساخت وب‌اپلیکیشن «اسلاید هوشمند» — تولید پرزنتیشن HTML با هوش مصنوعی Z.ai، ورود کاربران و کتابخانه ذخیره‌سازی

Work Log:
- بارگذاری اسکیل‌های fullstack-dev و LLM؛ راه‌اندازی محیط با init-fullstack.sh
- تحلیل قالب نمونه کاربر (NotebookLM deck): بوم 1280x720، RTL فارسی، فونت Vazirmatn/Outfit، پالت گوگل دو تمه، ناوبری کیبورد
- Prisma schema: مدل User (email/passwordHash) + Presentation (deckJson, html, theme, ...) و db:push
- src/lib/auth.ts: هش رمز scrypt + JWT HS256 بدون وابستگی خارجی + کوکی httpOnly
- API routes: auth/register, auth/login, auth/logout, auth/me, presentations (GET/POST), presentations/[id] (GET/DELETE), presentations/[id]/html (inline + download)
- src/lib/deck-types.ts: قرارداد DeckJSON با ۸ نوع اسلاید (cover/agenda/bullets/two-column/stats/quote/timeline/conclusion)
- src/lib/deck-ai.ts: پرامپت سیستمی فارسی + استخراج JSON مقاوم + نرمال‌سازی ایمن چیدمان
- src/lib/deck-generator.ts: موتور رندر HTML تک‌فایلی (۴ تم رنگی × دو تم روشن/تیره، ناوبری کیبورد/لمسی، dots، شمارنده فارسی، overview با کلید O، fullscreen، print CSS)
- src/app/page.tsx + کامپوننت‌های zslide: SPA فارسی RTL با نمای ورود/داشبورد/فرم ساخت/اورلی تولید/پیش‌نمایش iframe/کتابخانه
- تست curl: ثبت‌نام، session، تولید ۴ اسلایدی (۸.۴ ثانیه)، هدر دانلود attachment با نام فارسی
- تست Agent Browser: ورود، داشبورد، پیش‌نمایش iframe، ناوبری اسلاید (۲/۴)، تم روشن، overview، تولید از UI (۸ اسلاید بنفش)، موبایل ۳۹۰px، فوتر چسبیده
- lint بدون خطا؛ dev.log بدون خطای runtime

Stage Summary:
- اپلیکیشن کامل و تست‌شده روی پورت ۳۰۰۰ (تنها مسیر /)
- دو پرزنتیشن دمو در کتابخانه کاربر test@zslide.ir (رمز: test123456)
- نکته Supabase: احراز هویت با Prisma/SQLite پیاده‌سازی شد تا در سندباکس کار کند؛ اسکیما سازگار با Postgres سوپابیس است و برای مهاجرت کافی است provider به postgresql تغییر کند و DATABASE_URL به کانکشن سوپابیس اشاره کند.

---
Task ID: 2
Agent: Main Agent (Z.ai)
Task: ارتقا به نسخه اصلی (Production) — احراز هویت Supabase، دیتابیس Supabase Postgres، کلید ZAI_API_KEY، آماده‌سازی استقرار Vercel + راهنمای کامل فارسی

Work Log:
- نصب @supabase/supabase-js@2.118.0
- src/lib/mode.ts: تشخیص خودکار حالت (supabase در صورت تنظیم ۳ متغیر، وگرنه local) + حالت AI (http با ZAI_API_KEY یا sdk سندباکس)
- src/lib/supabase-server.ts: کلاینت service_role سمت سرور + verifySupabaseToken
- src/lib/store.ts: لایه انتزاعی داده با دو پیاده‌سازی (Supabase Postgres جدول presentations / Prisma SQLite محلی با import تنبل)
- src/lib/deck-ai.ts: دو ترنسپورت هوش مصنوعی — HTTP سازگار با OpenAI روی api.z.ai با Bearer ZAI_API_KEY (glm-4.6) یا SDK داخلی
- src/lib/auth.ts: getUserFromRequest با پشتیبانی Bearer توکن سوپابیس + fallback کوکی
- بازنویسی همه API routes (register/login/logout/me/presentations/[id]/html) + route جدید /api/status
- src/lib/client-auth.ts: احراز هویت مرورگری supabase-js با refresh خودکار + apiFetch با هدر Authorization + پیام‌های خطای فارسی + resolveMode
- UI: auth-view (نشان حالت + پیام تأیید ایمیل)، page (نشان وضعیت هدر + پیل موتور AI)، preview-overlay و deck-grid (دانلود و پیش‌نمایش مبتنی بر Blob — سازگار با Bearer)، دیالوگ «راهنمای استقرار» سه‌تبی درون‌برنامه‌ای
- فایل‌های استقرار: supabase/schema.sql (جدول + RLS)، .env.example، README-DEPLOY.md (فارسی، در ریشه و download/)
- تست curl: status/local login/list/generate (۵ اسلاید، ~۱۸ ثانیه)/html (28KB)/delete — همه 200
- تست Agent Browser: ورود، داشبورد، دیالوگ راهنما (۳ تب)، پیش‌نمایش Blob iframe، ناوبری کیبورد اسلاید ۳/۴، موبایل ۳۹۰px با فوتر چسبیده، بدون خطای کنسول
- lint: 0 error

Stage Summary:
- معماری دوحالته: تنظیم ۳ متغیر Supabase → پروداکشن کامل؛ بدون متغیر → دموی محلی سندباکس
- کلیدها: SUPABASE (URL/anon/service_role) + ZAI_API_KEY — همگی در Vercel → Settings → Environment Variables
- راهنمای استقرار فارسی: README-DEPLOY.md + راهنمای درون‌برنامه‌ای در دیالوگ «راهنمای استقرار»
- supabase/schema.sql برای SQL Editor سوپابیس آماده است

---
Task ID: 3
Agent: Main Agent (Z.ai)
Task: تبدیل به محصول کامل «آرشام پوینت» — صفحات چندگانه، حساب آزمایشی، پنل و حساب من، صفحات SEO

Work Log:
- ریبرند کامل از «اسلاید هوشمند» به «آرشام پوینت» (layout metadata، auth-view، صفحه، فوتر، README، schema.sql)
- src/components/arsham/content.ts: برند + ویژگی‌ها + مراحل + FAQ + آمار به‌عنوان منبع واحد
- src/hooks/use-hash-route.ts: روتر هش SPA با useSyncExternalStore (محدودیت سندباکس: فقط مسیر / دیده می‌شود؛ روی Vercel قابل تبدیل به مسیر واقعی)
- src/components/arsham/site-chrome.tsx: PublicHeader + AppHeader + SiteFooter با منوی موبایل همبرگری
- landing.tsx: هیرو + آمار + ۶ ویژگی + ۳ مرحله + showcase زنده (iframe /samples/showcase.html) + آکاردئون FAQ + CTA
- static-pages.tsx: درباره/امکانات/سوالات/حریم خصوصی/قوانین/تماس با محتوای غنی فارسی
- dashboard.tsx: پنل کاربر (تب ساخت + کتابخانه)؛ PresentationsPage با initialTab=library
- account.tsx: پروفایل + آمار (تعداد ارائه/اسلاید/آخرین فعالیت) + وضعیت زیرساخت + خروج
- page.tsx: روتر کامل با محافظت مسیرهای app/presentations/account
- auth-view: کارت حساب آزمایشی با ورود یک‌کلیکی (فقط حالت local) + بازگشت به خانه
- scripts/seed-demo.ts: کاربر demo@arshampoint.ir / 123456 + ۲ ارائه نمونه AI + public/samples/showcase.html
- deck-ai.ts: extractJSON سه‌لایه + retry یک‌باره برای خروجی شکسته LLM
- SEO: metadataBase/openGraph/twitter/robots + JSON-LD (WebApplication + FAQPage) + robots.txt
- رفع ۲ خطای lint (setState-in-effect) — نهایی: 0 error
- تست مرورگر: landing، showcase iframe، about، auth، ورود دمو، داشبورد (کتابخانه ۲ ارائه)، حساب من، خروج→landing، موبایل ۳۹۰px — بدون خطای کنسول

Stage Summary:
- ۱۱ نما (route) فعال: خانه/auth/app/presentations/account/about/features/faq/privacy/terms/contact
- حساب آزمایشی: demo@arshampoint.ir / 123456 (ورود یک‌کلیکی در صفحه ورود)
- نمونه زنده در صفحه خانه از public/samples/showcase.html سرو می‌شود

---
Task ID: 4
Agent: Main Agent (Z.ai)
Task: بهبود ساختار و سرعت + بیلد و اجرای موفق نسخه پروداکشن

Work Log:
- فونت وزیرمتن سلف‌هاست شد (۳ سابست woff2 متغیر ۱۰۰-۹۰۰ در public/fonts)؛ حذف لینک رندربلاک‌کننده Google Fonts از layout و جایگزینی با preload محلی — بدون درخواست third-party در زمان اجرا
- client-auth: supabase-js به import پویا منتقل شد (~۳۰KB از باندل اولیه کم شد؛ در حالت دمو اصلاً لود نمی‌شود) + کش module-level برای /api/status (یک درخواست در هر بارگذاری صفحه)
- SessionProvider جدید (components/arsham/session.tsx): state مرکزی نشست با resolve موازی mode+session (Promise.all) — حذف prop-drilling و حذف fetch تکراری status در صفحه حساب
- page.tsx: جدول مسیر اعلایی + next/dynamic برای همه نماها — code splitting سطح مسیر (لندینگ دیگر داشبورد/صفحات استاتیک را حمل نمی‌کند) + document.title همگام با هر مسیر
- SEO: لندینگ حالا در SSR کامل رندر می‌شود (به‌جای اسپینر بوت) — محتوای HTML خزیدنی برای خزنده‌ها
- رفع ۳ خطای تایپ پنهان زیر ignoreBuildErrors: DeckLanguage import در deck-generator، guard خروجی null signUp در client-auth
- next.config: distDir از env قابل override است (NEXT_DIST_DIR) برای بیلد ایزوله بدون آسیب به سرور dev
- بیلد پروداکشن موفق: NEXT_DIST_DIR=.next-build bunx next build → ✓ Compiled in 10.2s، ۱۱ مسیر (۱ استاتیک + ۱۰ داینامیک)
- اجرای موفق سرور standalone روی پورت ۳۱۰۰: / و /api/status و /api/auth/login همه 200 + فونت 200
- تست Agent Browser: لندینگ، بارگذاری فونت محلی (document.fonts.check=true)، features/about با چانک پویا، ورود دمو، داشبورد (کتابخانه ۲)، حساب من (status از context)، خروج→لندینگ، گارد مسیر محافظت‌شده (app→auth)، موبایل ۳۹۰px فوتر طبیعی — بدون خطای کنسول
- lint نهایی: 0 error؛ tsc روی src/: 0 error

Stage Summary:
- سرعت: باندل اولیه سبک‌تر (فونت محلی + حذف supabase-js + تقسیم چانک)، بوت موازی، یک درخواست status
- ساختار: SessionProvider مرکزی + جدول مسیر اعلایی + تایپ‌های سالم
- بیلد و اجرای پروداکشن تأیید شد؛ در Vercel همان «next build» استاندارد استفاده می‌شود

---
Task ID: 5
Agent: Main Agent (Z.ai)
Task: مراحل نهایی + بسته زیپ آماده آپلود به ریپازیتوری

Work Log:
- README.md کامل فارسی ساخته شد (امکانات، تکنولوژی، اجرای سریع، جدول متغیرها، اتصال Supabase، استقرار Vercel، ساختار پروژه)
- .env.example با ۸ متغیر + کامنت فارسی نوشته شد (قبلاً وجود نداشت/خالی بود)
- .gitignore اصلاح شد: !.env.example + بستن /db، /.next-build، /download، /upload، /worklog.md، /agent-ctx
- package.json: نام → arsham-point، نسخه → 1.0.0، اسکریپت postinstall: prisma generate
- scripts/make-repo-zip.sh: ساخت زیپ تمیز با staging — بدون node_modules/.next/db/.env/log/پوشه‌های سندباکس
- خروجی: download/arsham-point.zip (356KB، ۱۳۲ فایل، شامل src کامل + کانفیگ‌ها + bun.lock + فونت‌ها + نمونه + اسکیماها + داکیومنت‌ها)
- تست یکپارچگی zip: OK — lint نهایی: 0 error

Stage Summary:
- بسته ریپازیتوری آماده است: extract → git init → commit → push → Import در Vercel

---
Task ID: 5
Agent: main
Task: آخرین مراحل — ساخت فایل zip آماده آپلود به ریپازیتوری (repo-ready zip)

Work Log:
- بازبینی .gitignore: پوشش کامل node_modules/.next*/.env*/db/logs/download/worklog تأیید شد
- scripts/make-repo-zip.sh اجرا شد؛ zip از نو ساخته شد تا همه تغییرات Task 4 (فونت‌های self-host، session.tsx، page.tsx و…) داخل آن باشد
- اسکن امنیتی محتویات zip: بدون .env، بدون *.db، بدون log، بدون node_modules/.next، بدون worklog
- .env.example فقط placeholder خالی دارد (بدون کلید واقعی)
- unzip -t صحت آرشیو → OK

Stage Summary:
- خروجی نهایی: /home/z/my-project/download/arsham-point.zip (356KB، 132 فایل، پوشه ریشه arsham-point/)
- آماده آپلود مستقیم به GitHub؛ مراحل بعدی: unzip → git init/push → تنظیم Environment Variables طبق README-DEPLOY.md

---
Task ID: 6
Agent: main
Task: صفحه «حساب شما با موفقیت ساخته شد» برای ریدایرکت ایمیل تأیید Supabase

Work Log:
- public/account-confirmed.html ساخته شد (RTL، دارک تم #0B0C10، گرادیان برند 4285F4→8AB4F8، فونت self-host وزیرمتن)
- تیک SVG انیمیشنی + دکمه «ورود به حساب» (href=/#/auth) + «بازگشت به صفحه اصلی»
- اسکریپت hygiene: پاک کردن توکن‌های یک‌بارمصرف Supabase (code/access_token) از URL با history.replaceState
- رندر تستی با agent-browser روی http.server: ✓ بدون خطای کنسول، اسکرین‌شات در download/account-confirmed-preview.png
- zip بازسازی شد (133 فایل شامل صفحه جدید)

Stage Summary:
- آدرس نهایی پس از دیپلوی: /account-confirmed.html → باید در Supabase → Authentication → URL Configuration → Site URL ست شود

---
Task ID: 7
Agent: main
Task: حفظ لاگین (کوکی پشتیبان ۳۰ روزه) — رفع پریدن سشن بعد از بستن مرورگر

Investigation (روی پروداکشن کاربر با agent-browser):
- /api/status: mode=supabase, ai=http (glm-4.7-flash فعال) ✓
- /api/auth/me بدون توکن: 200 {"user":null} — مسیر سرور سالم ✓
- ورود با demo@arshampoint.ir → 400 invalid_credentials ← کاربر دمو در Supabase ساخته نشده!
- ثبت‌نام → نیاز به تأیید ایمیل (Confirm email روشن است)؛ دامنه arshampoint.ir در Supabase «invalid email» رد می‌شود (نبود MX)

Fix (session cookie mirror):
- auth.ts: بدون Prisma (serverless-safe)، JWT دارای name، کوکی secure روی Vercel، TTL 30 روز
- api/auth/me: با Bearer معتبر → setSessionCookie (آینه کوکی)
- client-auth.ts restoreSession: اول localStorage سپس fallback کوکی
- login/register: name در توکن؛ .env.example: AUTH_SECRET اضافه شد
- tsc src=0 خطا، lint=0

Stage Summary:
- zip بازسازی شد؛ پس از دیپلوی، لاگین با کوکی ۳۰ روزه پشتیبان می‌ماند
- یادآوری به کاربر: ساخت demo@arshampoint.ir در Supabase Auth + بررسی تنظیم پاک‌شدن site data در مرورگر

═══════════════════════════════════════════════════════
Task 7 — Session Persistence Fix + SEO Overhaul (2026-10-29)
═══════════════════════════════════════════════════════
User report: «لاگین با بستن و دوباره باز کردن برنامه می‌پره — حفظ لاگین کوکی»
+ درخواست: لوگو، سئو (متا/هدینگ/لینک داخلی)، صفحات سئو، تماس با سازنده
(آرشام فاضل — arsham.fazel@gmail.com — 00989944825251)، حذف دمو، تست سلامت سایت.

A) PERSISTENT LOGIN — root causes found & fixed:
1. auth.ts getUserFromRequest: bearer نامعتبر/منقضی → return null (fallback کوکی اجرا نمی‌شد!)
   → اکنون: bearer fail → getSessionUser() (کوکی آینه‌ای ۳۰ روزه)
2. api/auth/me: کوکی آینه فقط با Bearer ست می‌شد → اکنون با هر احراز موفق (Bearer یا کوکی)
   ست/تمدید می‌شود = sliding session ۳۰ روزه
3. client-auth.ts authLogin/authRegister: syncSessionCookie() بلافاصله بعد از ورود
   سوپابیس → «انتقال کوکی» در لحظه لاگین (قبلاً فقط در بوت بعدی ست می‌شد)
4. restoreSession: اگر access_token منقضی بود → refreshSession() صریح قبل از /api/auth/me

Verify (local mode):
- Set-Cookie: Max-Age=2592000 + HttpOnly + SameSite=lax ✓
- /me با کوکی → user ✓ / بدون کوکی → null ✓
- Browser E2E: login → close → state restore → reopen → header «پنل من» ✓
- click پنل من → /#/app + GET /api/presentations 200 با داده کاربر ✓

B) SEO:
- layout.tsx: canonical, OG image (/og.png 1200×630), twitter image, icons محلی
  (icon.svg + favicon-32.png + apple-touch-icon.png), themeColor, keywords+
  JSON-LD graph: Organization (founder آرشام فاضل + ContactPoint) + WebSite +
  WebApplication + FAQPage
- ۶ صفحه سئوی واقعی SSR: /features /faq /about /contact /privacy /terms
  هر کدام: metadata + canonical + OG + H1/H2/H3(/H4) + breadcrumb JSON-LD +
  FAQ JSON-LD (faq) + ContactPage JSON-LD (contact) + بلوک «بخش‌های مرتبط»
  (لینک‌سازی داخلی دوطرفه با فوتر)
- seo-shell.tsx: پوسته سرور-رندر (header/footer با <Link> واقعی، بدون JS)
- site-chrome.tsx: ناوبری عمومی از button+navigate → <Link href="/features">…
  فوتر: لینک‌های واقعی + ایمیل/تلفن (mailto/tel) + اعتبار سازنده + fix «BRAND &&»
  → BRAND_EN
- sitemap.ts: ۷ مسیر + robots.txt: Disallow /api/
- landing.tsx: دکمه امکانات → <Link href="/features">، FAQ → لینک /faq،
  متن دمو از CTA حذف شد (دمو فقط در حالت local می‌ماند)
- brand-logo.tsx: نشان SVG اختصاصی (نمایشگر + نمودار رشد + ستاره AI) —
  در هدر، فوتر، صفحه ورود و صفحات سئو یکدست
- public/: logo.svg، icon.svg، og.png (تصویر اشتراک)، apple-touch-icon.png،
  favicon-32.png (ساخته‌شده با اسکرین‌شات مرورگر)
- static-pages.tsx: کارت تلفن در تماس (نسخه hash برای سازگاری لینک‌های قدیمی)

Verify: lint 0 خطا | / و ۶ صفحه → 200 | SSR: /features = 1×H1 6×H2 3×H3 4×H4 |
canonical/og absolute | sitemap.xml OK | صفر خطای کنسول مرورگر
zip بازسازی شد (152 فایل، 524K) — push به GitHub = Redeploy خودکار Vercel

## 1405/08/07 — سئوی عمیق + مجله + دو حالت تولید + UI پویا (v4)

**SEO (درخواست: «سئو هنوز خیلی پایینه»):**
- content.ts: TAGLINE → «ساخت پاورپوینت فارسی با هوش مصنوعی»؛ KEYWORDS (۲۲ کلیدواژه:
  ساخت پاورپوینت فارسی با هوش مصنوعی، اسلاید ساز هوش مصنوعی، پاورپوینت آنلاین رایگان، …)
  + FOOTER_KEYWORDS + MAG_SEO_INTRO؛ DESCRIPTION بازنویسی برند-محور؛ FEATURES+STATS دو حالت
- layout.tsx: keywords=KEYWORDS؛ JSON-LD: + Blog (@id /mag#blog)
- کاهش نام Z.ai در متن کاربر: هدر/فوتر هر دو نسخه، landing badge، auth-view،
  about/features (نسخه hash و SSR)، account status → «موتور هوش مصنوعی آرشام پوینت»
  (تنها در کامنت‌ها/راهنمای deploy و خطای فنی deck-ai باقی است)
- deck-generator: meta generator فایل خروجی → «آرشام پوینت (Arsham Point) — …»

**آرشام پوینت مگ (سایت‌مپ + روباتس + مقالات):**
- src/lib/mag.ts: ۶ مقاله بلند سئویی (~۴۵۰۰ کلمه) با بلوک‌های h2/h3/p/list/steps/
  quote/callout/links و پیوند داخلی هدفمند:
  1) persian-powerpoint-with-ai (مقاله کلیدی) 2) online-vs-offline-presentation-tools
  3) standard-presentation-structure 4) student-presentation-with-ai
  5) 7-business-presentation-tips 6) html-vs-pptx
- /mag (فهرست + Blog JSON-LD) و /mag/[slug] (generateStaticParams + generateMetadata +
  BlogPosting JSON-LD + breadcrumb ناوبری + مقالات مرتبط + H2/H3 سمانتیک)
- sitemap.ts: + /mag و ۶ مقاله (priority 0.8-0.9)
- لینک‌سازی داخلی: nav هر دو هدر «مجله»، ستون مگ در فوترها، سطر کلیدواژه‌های فوتر
  (FOOTER_KEYWORDS)، بخش راهنما + تازه‌ترین مقاله‌ها در landing (8 پیوند داخلی)
- not-found.tsx (۴۰۴ برندشده با پیوندها)

**دو حالت ساخت (درخواست: «آفلاین و دارای تصویر»):**
- types.ts: visualMode 'offline'|'image' + imageLinks[] در GeneratePayload
- deck-types.ts: image/imageCaption برای cover، image برای bullets آیتم،
  نوع اسلاید جدید image{kicker,title,image,caption,text}
- deck-ai.ts: systemPrompt(visualMode) — تصویری: schema image + قاعده لینک؛
  آفلاین: ممنوعیت صریح تصویر؛ userPrompt: تزریق لینک‌های کاربر/کلیدواژه
  loremflickr؛ safeImageUrl (فقط http(s)≤۵۰۰)؛ normalizeDeck(visualMode) —
  آفلاین: حذف کامل image fields
- deck-generator: imgTag (loading=lazy + referrerpolicy=no-referrer +
  onerror→picsum seed) + رندر cover دونیمه تصویری + thumbnail بولت‌ها +
  renderImage (تصویر + پنل متن گرادیانی)
- api/presentations POST: parse visualMode/imageLinks (≤۱۲ لینک معتبر)
- create-panel: رادیو دو حالته (متنی آفلاین / دارای تصویر) + تکست‌اریای
  لینک تصاویر (اختیاری، یکی در هر خط، حداکثر ۱۲) + label دکمه داینامیک +
  GeneratingOverlay با مرحله «انتخاب و درج تصاویر»

**UI (درخواست: «فونت بزرگتر، پس‌زمینه پویا»):**
- globals.css: html 17.5px (بزرگ‌شدن یکپارچه همه متن‌ها) + line-height 1.8 +
  ::selection برند؛ پس‌زمینه aurora دو لایه fixed (radial آبی/بنفش/سبز/نارنجی،
  drift + rotate 30s/46s alternate، GPU transform) + prefers-reduced-motion
- رپرهای صفحه‌ای bg-[#0B0C10] → bg-transparent (هدرها /85 و بادی کانواس باقی)
- فرم‌های create-panel: text-[15px] و leading-8

**لوگو اختصاصی (درخواست: «لوگو اختصاصی و کلیدواژه آرشام پوینت»):**
- brand-logo.tsx: مونوگرام A + نقطه درخشان «پوینت» + کراس‌بار رشدی +
  جرقه AI، گرادیان آبی→بنفش، رینگ نور بالایی
- public/logo.svg = icon.svg (بازنویسی) + favicon-32/apple-touch/icon-192
  (regen با sharp — scripts/regen-icons.cjs) + og.png (اسکرین‌شات og-card.html
  جدید: badge کلیدواژه + تیتر آرشام پوینت) + icons در layout metadata

Verify: lint 0 خطا | مرورگر: / و /mag و /mag/[slug] و #/auth رندر کامل |
لاگین دمو OK | تولید تصویری: ۸ اسلاید، ۳ img واقعی loremflickr با
fallback picsum + اسلاید image | تولید آفلاین: ۸ اسلاید، صفر img |
hydration warning رادیکس = از قبل موجود (با stash کد قدیمی تایید شد)
zip بازسازی شد (162 فایل، 560K) — push به GitHub = Redeploy خودکار Vercel

## 1405/08/08 — راست‌چین شدن سوال FAQ + سخت‌سازی سئو (v4.1)

**باگ گزارش‌شده کاربر («این جمله را راست چین کن»):**
- accordion.tsx (shadcn): کلاس پایه `text-left` → `text-right` — سوال بلند
  «حالت متنی (آفلاین) با حالت دارای تصویر چه فرقی دارد؟» موقع شکستن خط
  چپ‌چین دیده می‌شد؛ اکنون در لندینگ و #/faq کاملاً راست‌چین است
- تأیید بصری با مرورگر (موبایل ۴۸۰px، بازکردن آکاردئون): راست‌چین کامل ✓ صفر خطای کنسول

**نکته مهم: سایت زنده قدیمی است!** بررسی curl سایت زنده: تایتل قدیمی
(«ساخت پرزنتیشن…»)، بدون canonical/JSON-LD، sitemap.xml = 404، روباتس تک‌خطی
→ کارشناس رباتی نسخه دیپلوی‌شده قبلی را دیده؛ همه موارد بحرانی گزارش او
هم‌اکنون در کد موجود است — با Redeploy بعدی برطرف می‌شود.

**بهبودهای سئو (اجرا کردن ایده‌ها):**
- layout.tsx: حذف FAQPage JSON-LD از گراف سراسری (دستورالعمل گوگل: مارک‌آپ
  FAQ فقط باید در صفحه‌ای باشد که سوالات دیده می‌شوند)
- page.tsx: FAQPage JSON-LD مخصوص خانه (دقیقاً ۴ سوال نمایان لندینگ)
- /faq: تایتل متا → «سوالات متداول ساخت پاورپوینت فارسی با هوش مصنوعی» + ذکر
  تفاوت دو حالت در description (تقویت کلیدواژه هدف)
- manifest.ts جدید (PWA): نام/توضیح فارسی، dir=rtl، lang=fa-IR، آیکون‌های
  ۱۹۲/۵۱۲ + maskable + SVG → /manifest.webmanifest (نصب‌پذیری + سیگنال موبایل)
- regen-icons.cjs: خروجی جدید icon-512.png (۶۱K)

**فیکس فنی:**
- site-chrome.tsx: key={n.route} → key={n.href} (خطای TS واقعی — با
  ignoreBuildErrors از چشم build پنهان بود؛ tsc اکنون src=0 خطا)
- seed-demo.ts: visualMode:'offline' (سازگاری با GenerateOptions جدید)

**Verify (build تولیدی NEXT_DIST_DIR=.next-build + next start:3100):**
- /sitemap.xml → 200 application/xml با ۱۴ URL | /robots.txt استاندارد چندخطی
- /manifest.webmanifest → 200
- خانه: تایتل «آرشام پوینت | ساخت پاورپوینت فارسی با هوش مصنوعی» + canonical
  + Organization/WebSite/Blog/WebApplication/FAQPage(۴ سوال) ✓
- /faq: canonical + FAQPage + BreadcrumbList ✓
- /mag/[slug]: canonical + BlogPosting + BreadcrumbList (بدون FAQPage اضافی) ✓
- tsc src=0 | مرورگر: صفر خطای کنسول
zip بازسازی شد (۱۶۴ فایل، 616K)

## 1405/08/08 — دامنه Apoint.ir + لوگوی نسل ۲ + مقاله فونت + دیباگ کامل (v5)

**دامنه جدید Apoint.ir (درخواست: «با همان نام اما دامنه Apoint.ir»):**
- content.ts: SITE_URL پیش‌فرض → https://apoint.ir + SITE_DOMAIN='Apoint.ir'
- robots.txt → Sitemap: https://apoint.ir/sitemap.xml | .env.example → NEXT_PUBLIC_SITE_URL=https://apoint.ir
- JSON-LD: alternateName سازمان و وب‌سایت → ["Arsham Point","Apoint.ir"] | og-card → «Apoint.ir»
- کلیدواژه‌ها: + Apoint.ir، apoint، به هم ریختن فونت پاورپوینت، فونت فارسی پرزنتیشن

**لوگوی نسل ۲ (درخواست: «لوگو رو زیبا تر کن»):**
- brand-logo.tsx + icon.svg بازطراحی: گرادیان چهارمرحله‌ای فیروزه‌ای→آبی→بنفش،
  هایلایت شیشه‌ای بالا-چپ، سایه عمق پایین، رینگ دوتایی پرمیوم، هاله درخشان دور
  نقطه «پوینت» (filter feGaussianBlur)، جرقه AI سفید
- regen-icons: favicon-32 / apple-touch / 192 / 512 بازتولید | og.png جدید (۱۲۰K
  با Apoint.ir — اسکرین‌شات og-card با networkidle)

**چیپ دامنه کنار لوگو (ماندگار در همه صفحات):**
- DomainChip جدید در brand-logo.tsx؛ کنار نام برند در: هدر hash-SPA (Logo) +
  هدر و فوتر صفحات SSR (SeoHeader/SeoFooter) + صفحه ورود (auth-view) + سطر
  کپی‌رایت هر دو فوتر («— Apoint.ir —»)

**مقاله جامع فونت (درخواست: «مگ چگونه پاورپوینت بدون به هم ریختن فونت در ورژن‌ها»):**
- /mag/powerpoint-font-fix (~۱۱۰۰ کلمه، ۱۰ دقیقه): چرا فونت می‌پرد (۳ عامل)،
  Embed قدم‌به‌قدم + محدودیت‌های TTF/مک، تبدیل متن به شکل، PDF پشتیبان، تست
  دستگاه دوم، جدول ریسک فونت‌های فارسی (بی‌نازانین/ایران‌سنس/وزیرمتن/Tahoma)،
  راه ریشه‌ای HTML تک‌فایلی، چک‌لیست ۶ موردی + callout اعداد
- FAQ نهم: «آیا خروجی روی ورژن‌ها به هم نمی‌ریزد؟» (خانه slice(0,4) و /faq خودکار)
- لینک‌سازی داخلی: FOOTER_KEYWORDS + کارت لندینگ (۶ کارت شد) + «تازه‌ترین
  مقاله‌ها» لندینگ حالا sort بر اساس تاریخ (جدیدترین اول)
- sitemap خودکار → ۱۵ URL

**دیباگ کامل + تست (درخواست: «دیباگ کامل و یه تست»):**
- باگ واقعی پیدا شد: site-chrome key={n.route} → key={n.href} (TS2309 — با
  ignoreBuildErrors از دید build پنهان بود) | seed-demo visualMode فیکس قبلی
- نکته استقرار: next start با output:standalone پایدار نیست — محلی باید
  node .next-build/standalone/server.js (Vercel بی‌تأثیر است)
- tsc src=0 | eslint 0 | build تمیز (۲۰ صفحه استاتیک، ۷ مقاله SSG)
- Verify تولیدی (standalone:3100): هر ۱۶ مسیر 200 | canonical=apoint.ir در
  همه | sitemap 15 URL | robots apoint.ir | manifest 200 | BlogPosting/FAQPage
  مقاله فونت | alternateName ["Arsham Point","Apoint.ir"]
- مرورگر E2E: خانه (لوگو ۲ + چیپ + پس‌زمینه aurora، صفر خطای کنسول) | مقاله
  فونت (1H1/8H2/3H3) | #/auth (چیپ کنار H1) | ورود دمو → فرم دو حالته →
  تولید واقعی «حفظ فونت در پاورپوینت» → دیک ۸ اسلایدی رندر شد با ناوبری کامل ✓
zip بازسازی شد — push = Redeploy خودکار

## v4.4 — 2026-10-31 | فیکس ریدایرکت ایمیل + قالب‌های جدید + نمادهای SVG + تصاویر هوشمند

**۱) ریدایرکت تأیید ایمیل (باگ اصلی):**
- ریشه: authRegister در client-auth.ts به supabase.auth.signUp هیچ emailRedirectTo
  نمی‌داد → سوپابیس به Site URL (خانه) برمی‌گشت و تنظیم Redirect URLs داشبورد
  نادیده می‌ماند
- فیکس: options.signUp حالا emailRedirectTo = origin + '/account-confirmed.html'
  (داینامیک → vercel.app و apoint.ir هر دو) + fallback استاتیک apoint.ir
- نکته استقرار: Authentication → URL Configuration باید دقیقاً
  https://arshampoint.vercel.app/account-confirmed.html و بعداً
  https://apoint.ir/account-confirmed.html در Redirect URLs باشد
- صفحه account-confirmed.html از قبل آماده (تیک انیمیشنی + پاک‌سازی توکن از URL)

**۲) قالب‌ها از ۴ به ۸:**
- ۴ پالت جدید dark+light کامل: red (گوگل‌رد)، teal (فیروزه‌ای)، indigo (نیلی)،
  gold (طلایی) — deck-types + ACCENTS جنریتور + ACCENTS UI (سواچ رنگی)
- لیبل UI: «تم رنگی» → «قالب رنگی ارائه»

**۳) دو نوع اسلاید جدید:**
- comparison: مقایسه دوستونی مزایا/معایب با نماد تیک سبز/ضربدر قرمز (تمام SVG،
  نوار رنگی بالا) — نرمال‌ساز points و items را هر دو می‌پذیرد
- section: جداکننده فصل برای عریض‌های ۹+ اسلاید
- پرامپت FA/EN هدایت می‌کند: آماری→stats، مقایسه/مزایا-معایب→comparison،
  تاریخی→timeline، ۹+ اسلاید→section

**۴) نمادهای غیرتصویری (SVG درون‌خطی):**
- کتابخانه ۱۸ نماد استروک ۲۴×۲۴ (target/chart/trend/lightbulb/shield/clock/
  users/zap/star/globe/search/book/flag/briefcase/heart/pin/mail/calendar)
- AI برای آیتم‌های bullets فیلد icon می‌دهد → چیپ رنگی SVG (آفلاین هم کار می‌کند)
- isDeckIcon/DECK_ICONS در deck-types مشترک بین AI و رندرکننده

**۵) تصاویر مرتبط‌تر (حالت دارای تصویر):**
- پرامپت لینک‌ساز: ۱-۳ کلیدواژه انگلیسی دقیق هر اسلاید (جدا با کاما) +
  حداقل ۲ اسلاید image برای عریض‌های ۸+ — تست واقعی: solar,iran,desert /
  iran,sun,energy / solar,farm,iran برای «انرژی خورشیدی در ایران»

**۶) کیفیت:**
- حالت فشرده bullets (۵+ آیتم): پدینگ/گپ/فونت کوچک‌تر — باگ تداخل کارت پنجم
  با فوتر (دیده‌شده در E2E) رفع شد
- آمار قابل دفاع + جمله کامل + محتوای غیرتکراری در پرامپت

**تست:**
- tsc src=0 | build تمیز (۲۰ صفحه) | /api/status ok
- تولید واقعی AI (sdk): عریض ۹ اسلایدی دورکاری — comparison با ۱۲ تیک/ضربدر،
  ۳۱ نماد SVG، gold تیره/روشن، صفر <img> در حالت آفلاین ✓
- عریض ۸ اسلایدی انرژی خورشیدی — ۳ تصویر تاپیکال + teal ✓
- رندر سنتیتک (test-render.ts): tight-mode/section/comparison/indigo ✓
- مرورگر: جلد/نمای کلی/مقایسه/جداکننده/فشرده همگی اسکرین‌شات تأیید | ۸ قالب در
  پنل ساخت ۲×۴ | هدر با چیپ Apoint.ir سالم | کنسول بدون خطا

---
Task ID: N (تجاری‌سازی)
Agent: Main Agent (Z.ai)
Task: تجاری‌سازی آرشام پوینت — قالب‌های بیشتر (۱۲)، پلن‌ها و سهمیه ماهانه، درگاه زرین‌پال، صفحه قیمت‌گذاری، نشان برند ویروسی و ارتقای کیفیت

Work Log:

**۱) قالب‌های رنگی: ۸ → ۱۲**
- deck-types: DECK_ACCENTS + rose/lime/bronze/slate با ACCENT_LABELS فارسی
- deck-generator: پالت کامل dark+light برای ۴ قالب جدید (رندر و grad سازگار)
- zslide/types: چیپ‌های انتخابگر UI (۱۲ گزینه) — تست مرورگر: ۱۲ دکمه در پنل ساخت

**۲) پلن‌ها و سهمیه ماهانه (lib/plan.ts)**
- PlanId free/pro + FREE_MONTHLY_QUOTA env (پیش‌فرض ۵)
- getPlan/monthlyUsage/getUsage/activatePro با دو پیاده‌سازی (Supabase سرویس‌رول / Prisma SQLite) و fallback امن به free
- مدل Prisma Subscription + جدول Supabase در supabase-subscriptions.sql (RLS: کاربر فقط اشتراک خودش)
- /api/usage (GET): plan/used/quota/remaining/unlimited
- POST /api/presentations: سهمیه قبل از تولید؛ ۴۰۲ + quotaExceeded با پیام فارسی

**۳) درگاه پرداخت زرین‌پال**
- lib/zarinpal.ts: URLها + zarinpalAmount (ZARINPAL_AMOUNT_RIALS، پیش‌فرض ۱٬۴۹۰٬۰۰۰ ریال = ۱۴۹ هزار تومان) + امضای HMAC callback (AUTH_SECRET)
- /api/billing/zarinpal/request: مرچنت الزامی؛ بدون مرچنت → ۵۰۳ با پیام «به‌زودی + تماس با پشتیبانی» (تست شد)
- /api/billing/zarinpal/verify: وریفای کد ۱۰۰/۱۰۱ → activatePro یک‌ماهه → ریدایرکت /pricing?payment=success|failed؛ sig نامعتبر → failed

**۴) نشان برند ویروسی در خروجی**
- generateDeckHTML(opts.branding): دکمه «✨ آرشام پوینت» با لینک apoint.ir در نوار کنترل خروجی (رایگان)؛ pro بدون نشان
- API بر اساس plan تصمیم می‌گیرد — تست دو طرفه: free → #credit موجود؛ pro → #credit حذف

**۵) صفحه /pricing + سیم‌کشی تجاری**
- pricing/page.tsx (متادیتا + FAQPage JSON-LD scoped) + pricing.tsx (۳ کارت پلن، دکمه زرین‌پال، بنر success/failed از query)
- nav «قیمت‌ها» + فوتر محصول + sitemap (priority 0.8) + کلیدواژه‌های قیمت‌گذاری در content.ts
- landing: سکشن تیزر ۳ پلن + چیپ‌های هیرو (۱۲ قالب) + CTA به /pricing
- account: کارت پلن (تاج طلایی pro / پیشرفت مصرف رایگان «۱ از ۵») + CTA ارتقا
- content: ۲ FAQ تجاری جدید (رایگان بودن + نشان برند)؛ STATS=۱۱ چیدمان/۱۲ قالب
- یکسان‌سازی متن‌ها: «چهار پالت/هشت چیدمان» → «۱۲ قالب/۱۱ چیدمان» در features، static-pages و mag

**تست:**
- tsc src=۰ خطا | eslint تمیز | build ایزوله تمیز (۲۱ مسیر شامل /pricing و /api/usage و billing/*)
- مرورگر E2E: ثبت‌نام «تست تجاری» → پنل (۱۲ قالب) → تولید گلگون ۸ اسلایدی (۲۵ SVG، #credit✓، primary #F7A8C4) → حساب (۱/۵ + CTA) → زرین‌پال بدون مرچنت: ۵۰۳ پیام دوستانه ✓
- جریان pro: اشتراک دستی → «پلن حرفه‌ای/فعال ✓» → تولید gold بدون نشان (#credit=false) ✓
- اسکرین‌شات‌ها: pricing، account، landing-teaser، preview گلگون — همگی سالم

Stage Summary:
- محصول حالا چرخه درآمدی کامل دارد: رایگان محدود (۵/ماه + نشان برند) → حرفه‌ای نامحدود (۱۴۹ هزار تومان/ماه زرین‌پال) → سازمانی (تماس)
- برای فعال‌سازی پرداخت در پروداکشن: ZARINPAL_MERCHANT_ID و ZARINPAL_AMOUNT_RIALS در Vercel + اجرای supabase-subscriptions.sql در SQL Editor
- پرداخت‌های واقعی با تأیید کد ۱۰۰/۱۰۱ خودکار یک‌ماهه اشتراک می‌سازد؛ تمدید دستی بدون خودکار تمدید

---
Task ID: N+1 (تجاری‌سازی — سهمیه روزانه)
Agent: Main Agent (Z.ai)
Task: تغییر مبناي سهمیه و اشتراک از ماه میلادی به دوره‌های شماره‌دار — رایگان ۳ ارائه در روز (پنجره ۲۴ ساعته لغزان)، حرفه‌ای دوره دقیقاً ۳۰ روزه

Work Log:

**۱) هسته تجاری (lib/plan.ts)**
- FREE_MONTHLY_QUOTA (۵/ماه میلادی) → FREE_DAILY_QUOTA = ۳ در هر ۲۴ ساعت (env: FREE_DAILY_QUOTA)
- monthlyUsage (truncate اول ماه UTC) → dailyUsage با پنجره لغزان ۲۴ ساعته — صفر وابستگی به تقویم
- activatePro: setMonth(+1) → now + periods × PRO_PERIOD_DAYS × ۲۴h (env: PRO_PERIOD_DAYS، پیش‌فرض ۳۰) — خطای پرش ماه میلادی (۳۱ ژانویه → ۳ مارس) ریشه‌کن شد
- UsageInfo جدید: periodEnd (پایان دوره pro برای نمایش در حساب) + nextFreeAt (وقتی سهمیه پر است، قدیمی‌ترین ارائه + ۲۴h)
- quotaExceededMessage با ارقام فارسی (toFa)

**۲) متن‌های تجاری (۷ فایل)**
- pricing.tsx: «روزانه تا ۳ ارائه» / «تومان / ۳۰ روز» / «ارائه نامحدود در دوره ۳۰ روزه» / بنر موفقیت «به مدت ۳۰ روز»
- pricing/page.tsx: متادیتا + FAQ — «پنجره لغزان ۲۴ ساعته، مستقل از ماه میلادی» / «هر دوره دقیقاً ۳۰ روز (نه یک ماه تقویمی)»
- landing.tsx: تیزر «۳ ارائه در روز» + «۱۴۹ هزار تومان / ۳۰ روز» | content.ts: FAQ اصلی
- account.tsx: «مصرف روزانه (۲۴ ساعت گذشته)» + هشدار با ساعت دقیق آزاد شدن اسلات + pro نشان «تا {تاریخ فارسی}»
- zarinpal request/verify: توضیح تراکنش «اشتراک ۳۰ روزه»

**۳) مستندات (README-DEPLOY.md)**
- بخش جدید «تجاری‌سازی — پلن‌ها، سهمیه و درگاه پرداخت»: جدول subscriptions، ۴ متغیر env (ZARINPAL_MERCHANT_ID / ZARINPAL_AMOUNT_RIALS / FREE_DAILY_QUOTA / PRO_PERIOD_DAYS) + ۲ FAQ جدید

**۴) اسکریپت‌های تست (scripts/)**
- test-quota-logic.ts: ۸ تست سبز — پنجره ۲۴h (۲۳h داخل / ۲۵h خارج)، ۳۰d ≠ ماه میلادی (اثبات باگ setMonth: Jan31→Mar3)، periodEnd دقیقاً ۳۰.۰۰۰۰ روز، اشتراک منقضی → free
- activate-pro-test.ts: فعال‌سازی دستی pro برای تست

**تست E2E (سرور production روی 3100):**
- ثبت‌نام → ۳ ارائه (۲۰۰×۳) → چهارم: HTTP 402 + «سهمیه روزانه پلن رایگان (۳ ارائه در هر ۲۴ ساعت) تمام شد» + nextFreeAt = اولین ارائه + ۲۴h ✓
- فعال‌سازی pro → /api/usage: unlimited + periodEnd (+۳۰ روز دقیق) → ارائه چهارم ۲۰۰ + صفر #credit (برند حذف) ✓
- مرورگر: /pricing (۳ کارت با مبنا ۳۰ روز) + حساب («۳ از ۳» نوار قرمز + ساعت آزادسازی ۲۱:۰۰) ✓
- نکته رفع اشکال: سرور کهنه جلسه قبل روی پورت 3100 (EADDRINUSE) خروجی بیلد کهنه می‌داد — pkill و راه‌اندازی مجدد
- tsc src=0 | eslint=0 | build ایزوله ۲۱ صفحه ✓ | zip بازسازی: 784KB / 178 فایل ✓

Stage Summary:
- مدل تجاری نهایی: رایگان = ۳ ارائه در هر ۲۴ ساعت (لغزان، بی‌تقویم) + نشان برند | حرفه‌ای = نامحدود + بدون برند، هر دوره دقیقاً ۳۰ روز (۱۴۹ هزار تومان، زرین‌پال) | سازمانی = تماس
- برای پروداکشن: اجرای supabase-subscriptions.sql + ZARINPAL_MERCHANT_ID در Vercel (اختیاری: FREE_DAILY_QUOTA / PRO_PERIOD_DAYS)

---
Task ID: N+2 (۱۲ قالب طراحی + انتخاب دستی حرفه‌ای)
Agent: Main Agent (Z.ai)
Task: واگرایی واقعی پاورها — ۱۲ قالب طراحی متمایز (نه فقط رنگ)، انتخاب هوشمند قالب بر اساس موضوع، انتخاب دستی قالب/نوع اسلاید ویژه حرفه‌ای، حذف «تهیه شده توسط»، رنگ‌فشرده موبایل

Work Log:

**۱) موتور ۱۲ قالب طراحی (lib/deck-styles.ts — فایل جدید)**
- هر قالب = زبان طراحی کامل: توکن‌های رنگ زمینه، فونت تیتر (Vazirmatn/Markazi Text/Lalezar/Amiri از Google Fonts)، فرم کارت (۴ سطح گردی)، ۵ واریانت جلد (center/split/band/frame/minimal) و ۷ الگوی تزئینی (.slide background-image: glow/flat/grid/stripes/frame/corner/dots)
- قالب‌ها: مدرن، مینیمال، شب نئون، اکادمیک، مجله‌ای، استارتاپ، شیشه‌ای، کلاسیک رسمی، تایپوگرافی درشت، طبیعت، شرکتی، خط فارسی
- pickStyleForTopic: ۸ قانون کلیدواژه فارسی/انگلیسی (فناوری→شب نئون، بازاریابی→استارتاپ، آموزش→اکادمیک، مالی→شرکتی، …) + هش قطعی موضوع برای بقیه — هر موضوع یک قالب
- باگ specificity رفع شد: BASE_CSS از html.light (0,1,1) استفاده می‌کند که با html.st-x برابر بود؛ توکن تیره حالا html.st-x:not(.light) و روشن html.st-x.light — شب نئون در تم روشن دیگر تیره نمی‌ماند
- ۱۲ قالب در generator تزریق می‌شود: class="st-*" روی html + styleCss تیره/روشن + فونت اضافی در لینک Google Fonts

**۲) رندر (deck-generator.ts)**
- renderCover: ۵ واریانت ساختاری — split (متن + پنل گرافیکی با نماد SVG بزرگ و دایره‌های تزئینی)، band (نوار گرادیانی دور عنوان)، frame (قاب با ۴ نقطه نورانی گوشه)، minimal (تایپ درشت هم‌تراز لبه)، center
- renderSection هم واریانت band/frame گرفت
- «تهیه شده توسط» و نام ارائه‌دهنده/اعضا کامل حذف شد (فقط عنوان/زیرعنوان/تاریخ)

**۳) هوشمندی AI (deck-ai.ts)**
- قوانین جدید پرامپت: ترکیب انواع اسلاید متناسب با موضوع، دو اسلاید متوالی هم‌نوع نباشند، استفاده از کل منوی ۸ نوع
- preferredLayouts (انتخاب دستی pro): اولویت انواع در پرامپت فارسی/انگلیسی
- نام ارائه‌دهنده از schema و normalize حذف شد + دستور صریح «نام اعضا را نیاور»

**۴) گیت تجاری (presentations/route.ts)**
- body.style + body.layouts پارس و اعتبارسنجی می‌شود؛ اگر دستی بود و پلن free → 402 + proFeature:true با پیام ارتقا
- قالب نهایی: دستی (pro) یا pickStyleForTopic — در generateDeckHTML اعمال

**۵) UI (create-panel.tsx بازطراحی)**
- رنگ غالب: ۱۲ دکمه بلند → طیف فشرده ۱۲ دایره‌ای (۲ ردیف موبایل) با حلقه انتخاب + برچسب انتخاب فعلی
- قالب طراحی: منوی کشویی (خودکار + ۱۲ قالب با توضیح) — free: قفل با نشان طلایی «ویژه حرفه‌ای — ارتقا» (لینک /pricing)
- نوع اسلایدها: چیپ‌های toggle (حداکثر ۴ از ۹ نوع) — free: قفل + نشان
- پلن از /api/usage در mount خوانده می‌شود؛ استایل/لی‌آوت فقط برای pro در payload

**۶) متن‌ها**: pricing (رایگان: قالب هوشمند؛ pro: انتخاب دستی ۱۲ قالب و نوع اسلاید)، landing teaser، pricing/page lead، content FAQ+STATS، features و static-pages («کنترل کامل روی ظاهر» بازنویسی)

**تست:**
- tsc src=0 | eslint src=0 | build ایزوله تمیز
- test-styles.ts: ۱۲ قالب رندر + صفر «تهیه» + نگاشت موضوع→قالب (۸ قانون + هش)
- مرورگر: استارتاپ (split/نوار مورب/Lalezar) ✓، اکادمیک (قاب/سریف) ✓، فارسی روشن (کرم/لاله‌زار/قاب) ✓، شب نئون تم روشن بعد از fix ✓
- E2E API: free + دستی → 402 proFeature ✓ | free خودکار «هوش مصنوعی در آموزش پزشکی» → st-midnight ✓ | pro دستی startup + layouts stats/comparison/timeline → st-startup + Lalezar + stripes + هر ۳ نوع در خروجی ✓
- موبایل ۳۹۰px: منوی کشویی قالب + چیپ‌های جمع‌شده + طیف رنگ ۲ ردیفی ✓ | free: ۲ نشان ارتقا + کنترل قفل (بعد از hard reload — ناوبری hash-only رفرش نمی‌کند)
- zip: 792KB / 179 فایل ✓

Stage Summary:
- پاورها دیگر شبیه هم نیستند: ۱۲ قالب × ۱۲ رنگ × ۱۱ چیدمان؛ قالب به‌صورت هوشمند از موضوع انتخاب می‌شود
- کنترل دستی قالب + نوع اسلاید = انگیزه ارتقای جدید در پلن حرفه‌ای (402 با proFeature)
- «تهیه شده توسط» از جلد حذف شد

---
Task ID: next
Agent: Main Agent (Z.ai)
Task: رفع دو باگ گزارش کاربر («بیش از ۸ اسلاید کار نمی‌کند» + «نوار تعداد اسلاید برعکس است») + تکمیل «تهیه‌شده توسط» + ارتقای کیفیت چیدمان

Work Log:
- باگ نوار اسلایدر: Radix useDirection از سند rtl نمی‌خواند (localDir||globalDir||'ltr') → نوار LTR می‌ماند و برچسب‌های ۴/۱۴ برعکس دیده می‌شدند؛ fix با dir="rtl" روی Slider در create-panel؛ تأیید هندسی (fill از راست، thumb ۴۰٪ از راست برای ۸) + کیبورد (ArrowLeft→۹، Home→۴، End→۱۴) در موبایل ۳۹۰px
- باگ تعداد اسلاید: سه عامل هم‌زمان — (۱) سقف خروجی پیش‌فرض مدل JSON بلند ۹-۱۴ اسلایدی را قطع می‌کرد → max_tokens: 8192 روی فراخوانی HTTP Z.ai؛ (۲) پرامپت فقط مکالمه‌ای بود («دقیقاً N اسلاید») و مدل به ۸ اسلاید تمایل داشت → تابع planSlideTypes چیدمان قطعی Nتایی می‌سازد (cover/agenda/…/conclusion) با هیچ دو اسلاید پشت‌سرِهم هم‌نوع، درج جداکننده بخش برای ≥۹ اسلاید، اسلاید image فقط در حالت تصویری، چرخش استخر انواع با هش موضوع (دو موضوع = دو ساختار)، و جای‌گذاری انواع اولویت کاربر حرفه‌ای در قلب چیدمان؛ (۳) هیچ اعتبارسنجی تعداد نبود → generateDeckWithAI دو تلاش می‌کند، اگر تعداد < want-1 باشد بهترین تلاش را نگه می‌دارد و دوباره می‌خواهد؛ fixStructure ترتیب cover/conclusion را تضمین و تعداد اضافه را هوشمند (حفظ جلد و پایان) برش می‌زند
- «تهیه‌شده توسط» کامل شد: ورودی Textarea در فرم (هر خط یک نام، حداکثر ۶) → GeneratePayload.authors → پارس در API (پاک‌سازی طول/تعداد) → deck.authors → authorsLine در deck-generator روی همه ۶ واریانت جلد + اسلاید conclusion، دوزبانه (فارسی/انگلیسی) با نماد users؛ مدل همچنان ممنوع ساخت نام
- تست واحد scripts/test-slide-plan.ts: ۵۰+ چک سبز (تعداد ۴..۱۴ در دو حالت، ساختار، بدون هم‌جوارِ هم‌نوع، تنوع بین موضوعی، image فقط در حالت تصویری، اولویت‌های pro، fixStructure)
- E2E واقعی: ۱۲ اسلاید در ۲۲.۹ ثانیه و ۱۴ اسلاید در ۲۷.۱ ثانیه — هر دو دقیقاً همان تعداد؛ «تهیه‌شده توسط» روی جلد و پایان؛ ناوبری ۱۲ dots
- مرور مرورگر: فرم موبایل (فیلد نام اعضا + طیف فشرده ۱۲ رنگ در دو ردیف)، جلد و overview و conclusion ارائه ۱۲ اسلایدی اسکرین‌شات و تأیید شد
- tsc تمیز (src)، eslint تمیز، build ایزوله موفق

Stage Summary:
- دو باگ کاربر رفع و با تست واقعی تأیید شد؛ ارائه ۹ تا ۱۴ اسلایدی حالا دقیقاً همان تعداد را می‌سازد
- چیدمان اسلایدها از پیش برنامه‌ریزی می‌شود → تنوع واقعی بین پاورها؛ پلن حرفه‌ای همچنان کنترل دستی دارد
- «تهیه‌شده توسط» ویژگی رایگان روی جلد و اسلاید پایانی
- نکته استقرار: بدون تغییر اسکیما/متغیر محیطی جدید — فقط deploy مجدد کافی است

---
Task ID: next+1
Agent: Main Agent (Z.ai)
Task: صفحه بررسی سفارش قبل از درگاه + آدرس تیم پشتیبانی + مقایسه با ابزارهای تجاری خارجی + منطقی‌سازی قیمت‌گذاری

Work Log:
- صفحه /checkout جدید (بررسی سفارش — گام ۱ از ۲): خلاصه سفارش (محصول، دوره دقیقاً ۳۰ روزه، ۱۴۹٬۰۰۰ تومان + معادل ریال درگاه ۱٬۴۹۰٬۰۰۰، ≈۴٬۹۶۷ تومان در روز)، فهرست امکانات، ۴ بند شرایط، چک‌باکس اجباری پذیرش (دکمه پرداخت تا پذیرش disable است)، سه گام خرید (بررسی → پرداخت زرین‌پال → فعال‌سازی آنی)، بلوک پشتیبانی با ایمیل/تلفن/آدرس
- سه حالت کاربر در checkout: مهمان → «اول وارد شوید» با CTA ثبت‌نام؛ pro فعال → «اشتراک فعال است ✓» با تاریخ پایان (faDate)؛ رایگان → فرم کامل بررسی سفارش — همه در مرورگر تأیید شد
- دکمه «پرداخت با زرین‌پال» در /pricing حذف و به Link «خرید اشتراک — بررسی سفارش → /checkout» تبدیل شد (دیگر مستقیم به درگاه نمی‌رود)؛ بنرهای نتیجه پرداخت در /pricing برای پیوندهای قدیمی حفظ شد
- کال‌بک verify زرین‌پال حالا به /checkout?payment=success برمی‌گردد (قبلاً /pricing)؛ پرداخت موفق در همان صفحه بررسی نمایش داده می‌شود
- آدرس تیم پشتیبانی «ایران، اصفهان، نجف‌آباد، خیابان شهید حججی، مجموعه فاضل» → SUPPORT_ADDRESS/SUPPORT_ADDRESS_SHORT در content.ts؛ درج در صفحه تماس (کارت آدرس + PostalAddress در JSON-LD)، فوتر همه صفحات SEO، صفحه قیمت‌گذاری و صفحه بررسی سفارش («تهران، ایران» غلط قبلی اصلاح شد)
- مقایسه با ابزارهای تجاری: جدول ۵ ردیفه (آرشام پوینت برجسته، Gamma، Canva AI، Beautiful.ai، Copilot در پاورپوینت) × ۵ ستون (شروع پلن پولی، ارائه رایگان، فارسی راست‌چین، پرداخت تومانی) در /pricing — قیمت‌ها از صفحات رسمی (Gamma Plus ~۱۰$/ماه، Canva Pro ~۱۵$/ماه، Beautiful.ai ۱۲-۴۵$/ماه، Copilot ~۲۰$+آفیس) با سلب مسئولیت «تقریبی، پاییز ۱۴۰۵»
- منطقی‌سازی: «اولویت در تولید (صف سریع‌تر)» ادعای پیاده‌نشده حذف و با «تمدید دستی — بدون کسر خودکار» صادقانه جایگزین شد؛ برچسب ≈۵٬۰۰۰ تومان در روز زیر قیمت pro؛ توضیح برتری پلن رایگان (۳ ارائه/روز همیشه در برابر اعتبار یک‌بارمصرف Gamma)؛ سوال FAQ «فرق با گاما/کنوا» + «خرید چطور انجام می‌شود؟» هم در متن هم در JSON-LD؛ RelatedLinks به /checkout
- SEO: صفحه /checkout متادیتا + canonical + Product/Offer JSON-LD (IRR 1,490,000) دارد
- منبع یکسان مالی: PRO_PLAN در content.ts (days/priceToman/priceRials/perDayToman) — قیمت‌گذاری و checkout از همین ثابت می‌خوانند
- tsc تمیز (خطاهای باقی‌مانده فقط examples/ و skills/ خارج از پروژه)، eslint تمیز، build ایزوله موفق (route /checkout ○ static)
- E2E مرورگر: /pricing → جدول مقایسه + آدرس + قیمت ✓ | کلیک خرید → /checkout مهمان ✓ | ورود دمو → فرم کامل (۱۴۹٬۰۰۰/۱٬۴۹۰٬۰۰۰ ریال/۴٬۹۶۷ در روز/مجموعه فاضل) ✓ | چک‌باکس گیت (disabled=true→false) ✓ | پرداخت بدون مرچنت → پیام دوستانه «به‌زودی» ✓ | موبایل ۳۹۰px: رندر درست + جدول مقایسه اسکرول‌پذیر (720>344) ✓
- رگرسیون تولید: ۱۲ اسلاید ✓ و ۱۴ اسلاید (سقف) ✓ — دقیقاً همان تعداد؛ تنوع چیدمان: ۱۰ نوع یکتا، صفر جفت پشت‌سرهم هم‌نوع؛ «تهیه‌شده توسط» + نام اعضا در HTML رندرشده ✓
- نکته استقرار: بدون تغییر اسکیما/متغیر محیطی جدید — فقط redeploy؛ اگر قبلاً /pricing?payment=success را جای(bookmark) داشتید، حالا /checkout?payment=success است

---
Task ID: final-completion
Agent: Main Agent (Z.ai)
Task: تکمیل نهایی پروژه — بازبینی کامل همه جریان‌ها، رگرسیون E2E تازه، اصلاح sitemap و .env.example، بسته‌بندی نهایی

Work Log:

**۱) بازبینی وضعیت موجودی (بدون دوباره‌کاری)**
- همه تسک‌های batch قبلی از قبل commit شده بودند: صفحه /checkout، آدرس تیم پشتیبانی، رفع دو باگ اسلاید (>۸ و RTL اسلایدر)، ۱۲ قالب طراحی + انتخاب دستی حرفه‌ای، «تهیه‌شده توسط»، مقایسه با ابزارهای تجاری، منطقی‌سازی قیمت
- تمرکز این مرحله: اثبات سلامت با تست تازه + کشف و رفع دو خلأ باقی‌مانده

**۲) رگرسیون کامل E2E (تازه، امروز)**
- tsc src = صفر خطا | eslint src = تمیز | build ایزوله موفق (/checkout ○ static)
- هر ۱۳ مسیر HTTP 200: / features pricing checkout faq mag about contact privacy terms sitemap robots manifest
- /pricing: جدول مقایسه ۵×۵ (Gamma/Canva/Beautiful.ai/Copilot)، بنر «اول مرور سفارش، بعد درگاه»، آدرس تیم ✓
- /checkout: خلاصه سفارش (۱۴۹٬۰۰۰ تومان = ۱٬۴۹۰٬۰۰۰ ریال = ≈۴٬۹۶۷ در روز)، گیت چک‌باکس (disabled → enabled بعد از پذیرش)، آدرس «مجموعه فاضل» ✓
- تولید ۱۲ اسلایدی free + ۳ نام عضو: دقیقاً ۱۲ اسلاید، «تهیه‌شده توسط:» روی جلد، قالب خودکار st-midnight بر اساس موضوع، نشان برند روی کنترل‌بار (free) ✓
- تولید ۱۴ اسلایدی pro دستی (style=persian + layouts=[stats,comparison,timeline,quote]): دقیقاً ۱۴ اسلاید (شمارنده «۱۴/۱»)، هر ۴ نوع اولویت در خروجی، بدون نشان برند ✓
- اسکرین‌شات اسلایدهای stats/quote در مرورگر — رندر تمیز با ارقام فارسی و accent طلایی
- اسلایدر RTL: هندسه تأیید — dir=rtl روی track، range ۴۰٪ راست‌چین، thumb در ۶۰٪ برای مقدار ۸ از ۴..۱۴ ✓
- موبایل ۳۹۰px: طیف فشرده رنگ، منوی کشویی قالب، فیلد نام اعضا ✓ | کنسول مرورگر بدون خطا

**۳) دو اصلاح کشف‌شده در همین مرحله**
- sitemap.ts: مسیر /checkout جا افتاده بود → اضافه شد (priority 0.6) و در sitemap.xml زنده تأیید شد
- .env.example: چهار متغیر تجاری‌سازی جا افتاده بود → ZARINPAL_MERCHANT_ID / ZARINPAL_AMOUNT_RIALS (1490000) / FREE_DAILY_QUOTA (3) / PRO_PERIOD_DAYS (30) با توضیح فارسی اضافه شد؛ نام‌ها با مصرف واقعی در src/lib/zarinpal.ts و src/lib/plan.ts تطبیق داده شد

**۴) تست‌های واحد هر ۳ مجموعه سبز**: test-quota-logic (پنجره ۲۴h + دوره ۳۰ روزه) | test-slide-plan (چیدمان و fixStructure) | test-styles (۱۲ قالب رندر بدون نام)

**۵) بسته‌بندی**: zip بازسازی شد — 808KB / 182 فایل؛ محتوا بررسی شد (env.example جدید + sitemap جدید داخل بسته)

Stage Summary:
- پروژه در وضعیت کامل و یکپارچه است: همه جریان‌ها با تست تازه اثبات شدند
- دو خلأ کوچک (sitemap و env.example) رفع شد
- برای انتشار: فقط zip → GitHub → Vercel Redeploy؛ متغیر ZARINPAL_MERCHANT_ID برای فعال شدن پرداخت واقعی لازم است

---
Task ID: load-effects + api-pool + slider + login-persistence
Agent: Main Agent (Z.ai)
Task: پنج اصلاح کاربر — افکت‌های لود، جهت اسلایدر، ماندگاری لاگین با Back، خطای بالای ۱۰ اسلاید، استخر چند کلید API (پرانتز/رندوم) و فارسی‌سازی نام موتور در خطاها

Work Log:

**۱) افکت‌های لود**
- globals.css: keyframes fade-up/fade-in + کلاس‌های .a-fade-up (ورود پلکانی با animation-delay) و .reveal/.reveal-in (ظهور هنگام اسکرول) — همه با احترام به prefers-reduced-motion
- کامپوننت جدید src/components/ui/reveal.tsx: IntersectionObserver سبک بدون وابستگی، با delay پلکانی و fallback بدون observer
- اعمال: لندینگ (هیرو ۶ عنصر پلکانی ۰..۳۶۰ms + mockup، آمار/امکانات/قدم‌ها/نمونه/FAQ با Reveal)، فرم ورود و ثبت‌نام، پنل ساخت، داشبورد، کارت بررسی سفارش
- تأیید مرورگر: ۶ نود a-fade-up + ۱۸ نود reveal + انیمیشن fade-up 0.75s فعال

**۲) جهت اسلایدر تعداد اسلاید (شکایت مجدد کاربر)**
- ریشه: نسخه قبل با dir=rtl «درستِ RTL» بود (۴ راست، ۱۴ چپ) اما انتظار کاربر کنوانسیون جهانی است: کشیدن به راست = بیشتر
- fix: dir="ltr" روی Slider + برچسب‌های ۴/۱۴ با dir=ltr زیر نوار — کیبورد ArrowRight اضافه می‌کند، هندسه: value 8 → thumb ۴۰.۳٪ از چپ
- تأیید در مرورگر با drag/keyboard و برچسب‌ها

**۳) ماندگاری لاگین و دکمه Back**
- ریشه: navigate از hash-push استفاده می‌کرد؛ تاریخچه [#/, #/auth, #/app] — Back بعد از ورود کاربر را به فرم لاگین می‌برد (حس «پریدن»)
- fix: replaceNavigate جدید (history.replaceState + hashchange dispatch) — بعد از ورود #/auth با #/app جایگزین می‌شود؛ گارد مسیرهای محافظت‌شده هم replace می‌کند؛ کاربر لاگین‌شده روی #/auth فوراً به #/app می‌پرد
- تست مرورگر: Back بعد از ورود → لندینگ بدون فرم لاگین (کاربر لاگین می‌ماند) | Forward → داشبورد | ورود مستقیم به #/auth با نشست فعال → برگشت خودکار به پنل

**۴) بالای ۱۰ اسلاید (سطح بندی جدید در نسخه جدید)**
- استخر کلیدها: mode.ts تابع aiApiKeys — ZAI_API_KEY یا تک‌کلید یا چند کلید با پرانتز «(k1)(k2)(k3)» (ویرگول/خط جدید/لوله هم پذیرفته می‌شود، داپ حذف، توکن‌های کوتاه فیلتر)؛ aiMode بر اساس وجود کلید
- callZaiHttp بازنویسی: شروع از کلید رندوم (تقسیم بار بین تیم‌های همزمان) + در خطای 429/402/403/5xx یا قطع شبکه، کلید بعدی با بک‌آف ۶۰۰ms — جزئیات فنی فقط در لاگ سرور
- تور ایمنی top-up در deck-ai: اگر بهترین تلاش ≥۲ اسلاید کوتاه بود، فقط اسلایدهای میانی جاافتاده در یک فراخوانی کوچک خواسته می‌شود (topUpPrompt دوزبانه) و قبل از conclusion تزریق + fixStructure
- تست: scripts/test-key-pool.ts (۸ چک سبز: پرانتز، فاصله، کاما/لوله، داپ، فیلتر، رندوم بودن نقطه شروع) | تولید واقعی ۱۴ اسلایدی روی ورک‌اسپیس ۲۸.۹s → دقیقاً ۱۴ اسلاید + نام اعضا + قالب خودکار st-midnight

**۵) برندسازی پیام‌های خطا (بدون نام سرویس زیرین)**
- deck-ai: خطای ۴۲۹ «سرورهای موتور هوش مصنوعی آرشام پوینت در این لحظه شلوغ است…» | اعتبار «اعتبار سرویس هوش مصنوعی آرشام پوینت…» | عمومی «ارتباط با موتور هوش مصنوعی آرشام پوینت برقرار نشد (کد X)» — بدون لو دادن detail آپ‌استریم به کاربر (فقط لاگ سرور)
- presentations route: fallback «سرور در ساخت پرزنتیشن به مشکل خورد…» | deploy-guide: «Z.ai API» → «سرویس ابری»
- .env.example + README-DEPLOY: مستند فرمت استخر پرانتزی ZAI_API_KEY

**تست نهایی**: tsc src=0 | eslint=0 | build ایزوله موفق | ۳ مجموعه تست واحد سبز (کلید استخر/چیدمان/سهمیه) | مسیرهای / و /pricing و /checkout روی بیلد پروداکشن ۲۰۰ | zip بازسازی 812KB/183 فایل

Stage Summary:
- تجربه کاربری نرم‌تر (افکت ورود و اسکرول)، اسلایدر با کنوانسیون آشنا، ورود/خروج از پنل با رفتار طبیعی Back
- پایداری تولید برای تیم‌های همزمان: استخر چند کلید + سوییچ خودکار + مکمل‌سازی اسلایدهای جاافتاده
- پیام‌های خطا کاملاً با برند «آرشام پوینت» — نام موتور زیرین فاش نمی‌شود
- استقرار: فقط redeploy؛ فرمت جدید env اختیاری است (تک‌کلید قبلی همچنان کار می‌کند)

## 2026-11-02 — README refresh (بند تکمیلی کاربر: «فایل رید می را هم سریع یه اصلاح بزن»)

**README.md بازنویسی کامل** تا با کد فعلی (کامیت 41fcc1b) یکی شود:
- معرفی موتور با برند «موتور هوش مصنوعی آرشام پوینت (مبتنی بر مدل GLM)» + لینک apoint.ir و arshampoint.vercel.app
- امکانات جدید: ۴–۱۴ اسلاید (با «تکمیل خودکار» بالای ۱۰)، ۱۲ قالب طراحی + ۱۲ رنگ غالب، دو حالت متنی/تصویری، افکت‌های لود (hero stagger + Reveal اسکرول)، ورود پایدار ضد Back، استخر چندکلیدی، پلن‌ها و زرین‌پال، برندینگ فارسی خطاها، آرشام پوینت مگ
- جدول متغیرهای env: + AUTH_SECRET، ZARINPAL_MERCHANT_ID، ZARINPAL_AMOUNT_RIALS، FREE_DAILY_QUOTA، PRO_PERIOD_DAYS
- بخش جدید «🎰 استخر چندکلیدی»: فرمت رسمی پرانتزی `(k1)(k2)...` در همان ZAI_API_KEY، رندوم per-request، failover، سازگاری با تک‌کلید قبلی، پنهان‌ماندن کلیدها از مرورگر
- بخش جدید «💳 پلن‌ها و پرداخت» (جدول سه‌پلنی + جریان /checkout)
- Supabase: قدم سوم اضافه شد (اجرای supabase-subscriptions.sql برای فروش اشتراک)
- ساختار پروژه بازنویسی (api/billing، mag، Reveal، mode.ts استخر کلید، deck-ai top-up، deck-styles ۱۲ قالب، plan.ts، zarinpal.ts)
- هم‌سازی پیام خطای نقل‌شده با متن واقعی کد («سرورهای موتور هوش مصنوعی آرشام پوینت در این لحظه شلوغ است»)

**تست**: tsc روی src بدون خطا | تست واحد استخر کلید ۸/۸ سبز (۵ کلید پرانتزی، dedupe، فیلتر آشغال، رندوم بودن شروع) | دود: / و /pricing و /checkout و /faq و /mag همه ۲۰۰ + برند در HTML

## 2026-11-20 — SEO hardening: sitemap fixes + complete metadata/JSON-LD on every page

**دو ایراد گزارش‌شده سایتمپ زنده (arshampoint.vercel.app/sitemap.xml):**
1. «//» دوتایی در آدرس‌ها (`…app//mag`) — ریشه: envNEXT_PUBLIC_SITE_URL روی Vercel با اسلش پایانی ست شده بود → SITE_URL در content.ts حالا اسلش‌های پایانی را با replace(/\/+$/) حذف می‌کند؛ چون همه URLهای مطلق (sitemap، canonical، og:url، JSON-LD @id، callback زرین‌پال) از همان SITE_URL ساخته می‌شوند، باگ در کل سایت ریشه‌ای بسته شد.
2. «اعلان XML» — در بیلد فعلی Next.js خودش `<?xml version="1.0" encoding="UTF-8"?>` را صادر می‌کند (تأییدشده روی بیلد پروداکشن؛ سایتمپ زنده نسخه قدیمی دیپلوی بود) → با redeploy حل می‌شود.

**robots.txt هوشمند شد:** فایل استاتیک public/robots.txt (هاردکد apoint.ir — روی vercel.app اشتباه) حذف و به src/app/robots.ts داینامیک تبدیل شد (Allow /، Disallow /api/، Sitemap و Host از SITE_URL نرمال‌شده).

**متادیتای کامل همه صفحات:** هلپر جدید src/lib/seo.ts (seoMetadata) — هر ۱۰ صفحه سئو (features، pricing، checkout، faq، about، contact، privacy، terms، mag، mag/[slug]) بازنویسی شد تا هر پنج بلوک کامل باشد: title/description + canonical + OpenGraph کامل (type، locale fa_IR، site_name، url، images با ابعاد) + Twitter Card + robots. علت: Next.js متادیتا را سطح‌اول merge می‌کند و og:site_name/og:locale/twitter در صفحاتی که openGraph اختصاصی داشتند از قلم می‌افتاد. مقاله‌ها article:published_time و og:type=article می‌گیرند.

**تأیید روی بیلد پروداکشن با env عامدانه «https://arshampoint.vercel.app/» (اسلش‌دار):**
- sitemap.xml: declaration ✓ | شمارش // دوتایی = ۰ ✓ | robots.txt با Sitemap درست ✓
- /features: canonical + og:url بدون //، og:site_name=آرشام پوینت، og:locale=fa_IR، og:type، twitter:card ✓
- /mag/<slug>: og:type=article + article:published_time ✓ | JSON-LD /faq: FAQPage + BreadcrumbList + Organization… ✓
- دود ۱۲ مسیر (۱۰ صفحه + ۲ مقاله): همه ۲۰۰ | tsc src=۰ | eslint تمیز

## 2026-11-20 — Slide-count limits by plan (free 1–10, pro up to 14)

**درخواست کاربر**: «تعداد اسلاید بین ۱ تا ۱۰ برای معمولی مجاز؛ اکانت پرو (سوپابیس + پرداخت) بیشتر»

**ماژول مشترک src/lib/plan-limits.ts** (pure، بدون import — هم کلاینت هم سرور):
- MIN_SLIDES=1 | MAX_SLIDES_FREE=10 | MAX_SLIDES_PRO=14 (قابل تنظیم با NEXT_PUBLIC_MAX_SLIDES_FREE / _PRO)
- maxSlidesForPlan(plan) + slidesUpgradeMessage() — پیام فارسی ارتقا با ارقام فارسی

**UI (create-panel)**: اسلایدر تعداد اسلاید داینامیک — رایگان ۱ تا ۱۰، حرفه‌ای ۱ تا ۱۴ (به‌جای ۴–۱۴ ثابت)؛ مقدار مؤثر (effSlides) بدون effect مشتق می‌شود (رفع خطای lint «setState همگام در effect»)؛ راهنمای ارتقا با آیکون تاج زیر اسلایدر برای کاربر رایگان.

**API (POST /api/presentations)**: پلن یک‌بار خوانده می‌شود؛ درخواست بالای سقف → ۴۰۲ با proFeature و پیام «ارائه ۱۲ اسلایدی در پلن رایگان ممکن نیست — حداکثر ۱۰ اسلاید…»؛ زیر سقف clamp به ۱–max.

**موتور (deck-ai.ts)**: planSlideTypes حالا ۱ تا ۱۴ دقیق (قبلاً حداقل ۴)؛ ارائه تک‌اسلایدی = فقط جلد؛ جمع‌بندی از ۲ اسلاید به بالا. پذیرش در حلقه تولید فقط «تعداد دقیق» است (قبلاً یکی کمتر قابل قبول بود)؛ top-up حالا جمع‌بندیِ گمشده را هم می‌گیرد (پیام شرطی) و fixStructure برای want=۱ و want=۲ دقیق برش می‌زند.

**تست‌ها**: واحد scripts/test-slide-limits.ts — ۱۲۳/۱۲۳ سبز (برای هر n از ۱ تا ۱۴ در دو حالت متنی/تصویری: تعداد دقیق، cover اول، conclusion آخر، بدون تکرار متوالی + سقف‌ها + پیام + fixStructure). E2E scripts/e2e-slide-limits.ts روی dev و بیلد پروداکشن هر دو کاملاً سبز: ثبت‌نام رایگان + slideCount=12 → ۴۰۲ با پیام ارتقا | slideCount=1 → ۲۰۰ دقیقاً ۱ اسلاید | ورود پرو (final-e2e@apoint.ir) + ۱۴ اسلاید + قالب persian → ۲۰۰ دقیقاً ۱۴ اسلاید.

**نکته عملیاتی**: pkill با الگوی خودتطبیق می‌کشد خود shell را؛ سرور prod قدیمی روی ۳۱۰۰ می‌ماند و EADDRINUSE می‌دهد — با الگوی bracket-safe ('next[ ]start') حل شد. tsc/eslint تمیز، بیلد پروداکشن موفق.

## 2026-11-20 — Multi-key pool hardening + partner guide (docs/multi-key-guide-fa.md)

**درخواست کاربر**: «حالت چند API-کی را اضافه کن و نحوه استفاده‌اش را هم بگذار چون شریک دارم؛ زیپ نهایی کل ریپو را بده»

**وضعیت**: استخر کلید (پارسر پرانتی در mode.ts + failover در deck-ai.ts) از قبل پیاده بود؛ یک شکاف واقعی اصلاح شد.

**اصلاح کد (deck-ai.ts)**: خطای HTTP 401 (کلید باطل/نامعتبر) حالا «قابل‌تلاش‌مجدد» است و مثل 429/402/403/5xx/قطعی شبکه کلید بعدی استخر را امتحان می‌کند — هماهنگ با متن README («کلید بی‌اعتبار → کلید بعدی»). callZaiHttp برای تست export شد.

**تست واحد (scripts/test-key-pool.ts — ۱۷/۱۷ سبز)**: پارسر (پرانتی، فاصله/خط جدید، ویرگول/لوله، dedup، فیلتر کوتاه) + failover واقعی با ماک fetch: ۴۲۹→۴۰۱→۲۰۰ با سه کلید متفاوت، ۴۰۱→۲۰۰، همه-۴۲۹ (پیام فارسی شلوغی)، ۴۰۰ فوری بدون چرخش. رفع مشکل ساختاری: top-level await در tsx/CJS → تابع async؛ اسکریپت‌های بدون import به ماژول تبدیل شدند (رفع تداخل اسکوپ سراسری در tsc)؛ tsconfig حالا examples/ و skills/ را مستثنا می‌کند تا tsc کل پروژه تمیز باشد.

**راهنمای شریک‌ها (docs/multi-key-guide-fa.md)**: چیست و چرا، فرمت پرانتی + جایگزین‌ها، قوانین پارسر (≥۱۶ کاراکتر، dedup، پرانتز داخل کلید ممنوع)، مکان تنظیم (Vercel/.env.local) + redeploy، ورک‌فلو افزودن/حذف/چرخش کلید، تأیید از /api/status («استخر N کلیدی»)، عیب‌یابی جدولی، امنیت (کلید فقط سمت سرور، لاگ فقط ۴ رقم آخر). لینک در README و .env.example.

**رگرسیون روی بیلد پروداکشن**: slide-limits E2E ۱۰/۱۰ سبز؛ e2e-12-slides.ts به‌روز شد (۱۲ اسلاید حالا نیازمند پلن حرفه‌ای — ورود با حساب پرو تست) و ۱۰/۱۰ سبز شد (تولید ۲۹.۸s، ۱۲ shell، تهیه‌شده‌توسط روی جلد و جمع‌بندی). tsc کل پروژه + eslint تمیز؛ build موفق.

## 2026-11-20 — ZarinPal completion: idempotency fix, sandbox/E2E gateway, tracking code

**درخواست کاربر**: «زرین‌پال را کامل کن و بعد ریپو را کامل به صورت زیپ بده»

**باگ پولی اصلاح شد (verify/route.ts)**: کد ۱۰۱ زرین‌پال (وریفای تکراری همان Authority — رفرش کال‌بک/دابل‌کلیک) قبلاً activatePro را دوباره صدا می‌زد و هر رفرش صفحه، دوره را ۳۰ روز دیگر تمدید می‌کرد. حالا: کد ۱۰۱ + اشتراک زنده → فقط ریدایرکت موفق بدون تمدید؛ کد ۱۰۱ + اشتراک زنده‌نشدگی (خطای DB در فعال‌سازی اول) → همان کال‌بک بازیابی را انجام می‌دهد. کد ۱۰۰ (پرداخت جدید) مثل قبل فعال‌سازی می‌کند.

**قابلیت‌های اضافه‌شده**:
- `zarinpalGateway()` در zarinpal.ts — انتخاب درگاه: ZARINPAL_BASE_URL (سفارشی/پروکسی) > ZARINPAL_SANDBOX=1 (sandbox.zarinpal.com) > پروداکشن. تابع است نه ثابت تا تست‌ها env را عوض کنند.
- کد پیگیری تراکنش (ref_id) در ریدایرکت موفق به /checkout?payment=success&ref=… و نمایش با رقم فارسی در کارت موفقیت (پاک‌سازی با safeRefId — فقط رقم، سقف ۱۲).
- لاگ request شامل uid + authority + amount برای پیگیری پشتیبانی.

**تست‌ها**:
- scripts/test-zarinpal.ts (۱۴/۱۴): انتخاب درگاه سه‌حالته + حذف اسلش پایانی، مبلغ (پیش‌فرض/کف/سفارشی)، امضای HMAC پایدار/۳۲هگز/متمایز، safeRefId.
- scripts/fake-zarinpal.ts — فیک‌گیت‌وی v4 (request/StartPay/verify با کد ۱۰۰→۱۰۱، -50 مغایرت مبلغ، -11 ناشناس، NOK با ?nok=1).
- scripts/e2e-zarinpal.ts — E2E کامل روی prod + فیک‌گیت‌وی: ۱۹/۱۹ سبز (پرداخت موفق → pro با دوره ۲۹.۹–۳۰.۰۵ روز، رفرش بدون تمدید، امضای جعلی → failed و اشتراک سالم، انصراف NOK → free). یادگیری: NextResponse.redirect پیش‌فرض ۳۰۷ است نه ۳۰۲ — تست روی محتوای Location سوار شد.

**مستندات**: README-DEPLOY (رفتار ۱۰۰/۱۰۱ + بازیابی، بخش «تست پرداخت بدون مرچنت واقعی»، سطر عیب‌یابی «مبلغ کسر شد اما ناموفق دیده»)، README (دو سطر env جدید)، .env.example (ZARINPAL_SANDBOX / ZARINPAL_BASE_URL).

**رگرسیون**: tsc کل پروژه + eslint تمیز؛ تست‌های واحد ۱۷+۱۴+۱۲۳+plan+quota سبز؛ E2E سقف اسلاید و ۱۲-اسلایدی پرو روی همان بیلد سبز؛ build موفق.
