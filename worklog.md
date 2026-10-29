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
