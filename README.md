# آرشام پوینت — Arsham Point

**ساخت پرزنتیشن‌های HTML با هوش مصنوعی Z.ai**

موضوع ارائه را می‌نویسید؛ هوش مصنوعی (مدل GLM) یک پرزنتیشن کامل، راست‌چین و آماده اجرا در مرورگر می‌سازد — با اسلاید جلد، دستور جلسه، آمار، نقل‌قول، خط زمانی و جمع‌بندی. خروجی یک فایل HTML تک‌فایلی و مستقل است که می‌توانید اجرا، دانلود و نگه‌داری کنید.

---

## ✨ امکانات

- **تولید خودکار محتوا** — ساختار اسلایدها، متن‌ها و آمارها را مدل GLM در چند ثانیه می‌سازد
- **خروجی HTML تک‌فایلی** — بدون هیچ وابستگی خارجی؛ روی هر مرورگر و هر سیستم‌عاملی اجرا می‌شود
- **۸ چیدمان حرفه‌ای** — cover / agenda / bullets / two-column / stats / quote / timeline / conclusion
- **۴ پالت رنگی × دو تم** — تم شبانه و روشن با سوییچ لحظه‌ای برای مخاطب
- **نمایش حرفه‌ای** — ناوبری کیبورد، نمای کلی (کلید O)، تمام‌صفحه (کلید F) و ریموت لمسی
- **کتابخانه اختصاصی** — هر کاربر پرزنتیشن‌های خودش را ذخیره، اجرا و دانلود می‌کند
- **صفحات کامل محصول** — خانه، امکانات، سوالات متداول، درباره ما، تماس، حریم خصوصی و قوانین + متادیتای سئو، JSON-LD و robots.txt

## 🧰 تکنولوژی

| لایه | ابزار |
|---|---|
| فریم‌ورک | Next.js 16 (App Router) + React 19 + TypeScript |
| استایل | Tailwind CSS 4 + shadcn/ui |
| پایگاه داده | Supabase Postgres (پروداکشن) / Prisma + SQLite (دموی محلی) |
| احراز هویت | Supabase Auth (پروداکشن) / کوکی امضاشده (دموی محلی) |
| هوش مصنوعی | Z.ai API سازگار با OpenAI (`glm-4.6`) یا SDK داخلی در سندباکس |

> **معماری دوحالته:** هر سه متغیر Supabase را تنظیم کنید → پروداکشن کامل؛ خالی بگذارید → دموی محلی بدون نیاز به هیچ کلیدی.

## 🚀 اجرای سریع

```bash
# ۱) نصب وابستگی‌ها (کلاینت Prisma هم خودکار ساخته می‌شود)
bun install        # یا: npm install

# ۲) متغیرهای محیطی
cp .env.example .env     # برای دموی محلی همان پیش‌فرض‌ها کافی است

# ۳) ساخت جداول دیتابیس محلی + داده نمونه
bun run db:push
bun scripts/seed-demo.ts

# ۴) اجرا
bun run dev        # http://localhost:3000
```

**حساب آزمایشی:** `demo@arshampoint.ir` / `123456` (در صفحه ورود دکمه ورود یک‌کلیکی هم دارد)

## 🔑 متغیرهای محیطی

| متغیر | ضرورت | توضیح |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | پروداکشن | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | پروداکشن | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | پروداکشن | کلید service_role — فقط سمت سرور |
| `ZAI_API_KEY` | پروداکشن | کلید API از پنل Z.ai |
| `ZAI_MODEL` | اختیاری | پیش‌فرض `glm-4.6` |
| `ZAI_BASE_URL` | اختیاری | پیش‌فرض `https://api.z.ai/api/paas/v4` |
| `DATABASE_URL` | فقط دمو | مسیر SQLite محلی |
| `NEXT_PUBLIC_SITE_URL` | اختیاری | آدرس سایت برای متادیتای سئو |

## 🗄 اتصال Supabase (نسخه اصلی)

1. یک پروژه در [supabase.com](https://supabase.com) بسازید
2. در **SQL Editor** محتوای [`supabase/schema.sql`](supabase/schema.sql) را اجرا کنید (جدول `presentations` + RLS)
3. سه متغیر Supabase را در `.env` (یا Vercel) پر کنید — تمام!

## ▲ استقرار روی Vercel

```bash
git init && git add . && git commit -m "Arsham Point"
git remote add origin https://github.com/<username>/arsham-point.git
git push -u origin main
```

سپس در Vercel پروژه را Import کنید و ۴ متغیر (`NEXT_PUBLIC_SUPABASE_URL`، `NEXT_PUBLIC_SUPABASE_ANON_KEY`، `SUPABASE_SERVICE_ROLE_KEY`، `ZAI_API_KEY`) را در **Settings → Environment Variables** وارد کنید.

راهنمای کامل‌تر: [`README-DEPLOY.md`](README-DEPLOY.md) یا داخل خود اپ، دیالوگ «راهنمای استقرار» در صفحه حساب من.

## 📁 ساختار پروژه

```
src/
├── app/                    # layout + صفحه + API routes
│   ├── api/                # auth/* , presentations/* , status
│   ├── layout.tsx          # متادیتای سئو + JSON-LD + فونت محلی
│   └── page.tsx            # جدول مسیرها + تقسیم کد (next/dynamic)
├── components/
│   ├── arsham/             # لندینگ، هدر/فوتر، داشبورد، حساب من، صفحات استاتیک، SessionProvider
│   └── zslide/             # فرم ساخت، شبکه کتابخانه، پیش‌نمایش، راهنمای استقرار
├── hooks/                  # روتر هش SPA
└── lib/                    # mode, store, auth, client-auth, deck-ai, deck-generator
prisma/schema.prisma        # مدل‌های دموی محلی (User, Presentation)
supabase/schema.sql         # جدول + RLS برای پروداکشن
scripts/seed-demo.ts        # داده نمونه دمو
public/fonts/               # فونت وزیرمتن سلف‌هاست
```
