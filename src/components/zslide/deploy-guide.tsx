'use client'

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Rocket, Database, KeyRound, Cloud } from 'lucide-react'
import type { StatusInfo } from '@/lib/client-auth'

/* In-app Persian deployment guide (Supabase + Vercel + Z.ai API keys).
 * Mirrors README-DEPLOY.md in the repo root. */

function EnvTable() {
  const rows: { name: string; where: string; secret?: boolean }[] = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', where: 'Supabase → Settings → API → Project URL' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', where: 'Supabase → Settings → API → anon public' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', where: 'Supabase → Settings → API → service_role', secret: true },
    { name: 'ZAI_API_KEY', where: 'پنل Z.ai (z.ai / open.bigmodel.cn) → API Keys', secret: true },
    { name: 'ZAI_MODEL (اختیاری)', where: 'پیش‌فرض: glm-4.6' },
    { name: 'ZAI_BASE_URL (اختیاری)', where: 'پیش‌فرض: https://api.z.ai/api/paas/v4' },
  ]
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden text-xs" dir="ltr">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[#9AA0A6]">
          <tr>
            <th className="px-3 py-2 font-bold">Variable</th>
            <th className="px-3 py-2 font-bold">Where to get it</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-white/5">
              <td className="px-3 py-2 font-mono text-[#8AB4F8] align-top whitespace-nowrap">
                {r.name}
                {r.secret && <span className="block text-[10px] text-[#F28B82]">SECRET</span>}
              </td>
              <td className="px-3 py-2 text-[#E8EAED] leading-6">{r.where}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <li className="flex gap-3 items-start">
    <span className="grid place-items-center w-6 h-6 rounded-full bg-[#8AB4F8]/15 text-[#8AB4F8] text-xs font-black shrink-0 mt-0.5">
      {n}
    </span>
    <div className="text-sm leading-7">
      <p className="font-bold">{title}</p>
      <div className="text-[#9AA0A6]">{children}</div>
    </div>
  </li>
)

export function DeployGuideDialog({ status }: { status: StatusInfo | null }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-9 border-white/15 bg-white/5 hover:bg-white/10 font-bold"
        >
          <Rocket className="w-4 h-4 ml-1" /> راهنمای استقرار
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#15171C] border-white/10" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Cloud className="w-5 h-5 text-[#8AB4F8]" /> استقرار نسخه اصلی (Supabase + Vercel)
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-[#9AA0A6]">
            وضعیت فعلی: {status?.mode === 'supabase' ? '✅ متصل به Supabase' : '⚠️ دموی محلی'} —
            {' '}موتور هوش مصنوعی: {status?.ai === 'http' ? `Z.ai API (${status?.aiModel})` : 'SDK داخلی سندباکس'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="supabase" dir="rtl">
          <TabsList className="grid grid-cols-3 w-full bg-white/5">
            <TabsTrigger value="supabase">۱. Supabase</TabsTrigger>
            <TabsTrigger value="vercel">۲. Vercel</TabsTrigger>
            <TabsTrigger value="env">۳. کلیدها</TabsTrigger>
          </TabsList>

          <TabsContent value="supabase" className="mt-4 grid gap-4">
            <ol className="grid gap-4">
              <Step n={1} title="ساخت پروژه">
                در <span className="font-mono text-[#8AB4F8]" dir="ltr">supabase.com</span> یک پروژه جدید بسازید و منتظر بمانید تا دیتابیس آماده شود.
              </Step>
              <Step n={2} title="اجرای SQL جداول">
                در منوی چپ <b>SQL Editor</b> را باز کنید، محتوای فایل <span className="font-mono text-[#8AB4F8]" dir="ltr">supabase/schema.sql</span> را پیست کنید و <b>Run</b> بزنید. این اسکریپت جدول <span className="font-mono text-[#8AB4F8]" dir="ltr">presentations</span> را با رابطه به کاربران و سیاست‌های RLS می‌سازد.
              </Step>
              <Step n={3} title="تنظیم احراز هویت ایمیلی">
                از مسیر <b>Authentication → Sign In / Providers → Email</b> گزینه Email را فعال نگه دارید و برای ثبت‌نام بدون تأیید ایمیل، <b>Confirm email</b> را خاموش کنید (یا فعال بگذارید تا کاربران با لینک تأیید شوند).
              </Step>
              <Step n={4} title="دریافت کلیدها">
                از <b>Settings → API</b> سه مقدار <span className="font-mono text-[#8AB4F8]" dir="ltr">Project URL</span>، <span className="font-mono text-[#8AB4F8]" dir="ltr">anon public</span> و <span className="font-mono text-[#8AB4F8]" dir="ltr">service_role</span> را بردارید.
              </Step>
            </ol>
            <p className="text-xs text-[#9AA0A6] leading-6 rounded-xl border border-white/10 bg-white/[.03] p-3">
              نکته امنیتی: کلید <span className="font-mono" dir="ltr">service_role</span> فقط سمت سرور (متغیر محیطی در Vercel) استفاده می‌شود و هرگز نباید به مرورگر ارسال شود؛ سیاست‌های RLS هم دسترسی مستقیم مرورگر به جدول را محدود می‌کنند.
            </p>
          </TabsContent>

          <TabsContent value="vercel" className="mt-4 grid gap-4">
            <ol className="grid gap-4">
              <Step n={1} title="انتشار کد روی GitHub">
                پروژه را در یک مخزن GitHub push کنید.
              </Step>
              <Step n={2} title="Import در Vercel">
                در <span className="font-mono text-[#8AB4F8]" dir="ltr">vercel.com/new</span> مخزن را انتخاب کنید؛ Vercel به‌صورت خودکار Next.js را تشخیص می‌دهد (Build Command پیش‌فرض بماند).
              </Step>
              <Step n={3} title="ثبت متغیرهای محیطی">
                قبل از اولین Deploy، در بخش <b>Environment Variables</b> همه متغیرهای تب «کلیدها» را وارد کنید — هم برای Production و هم Preview.
              </Step>
              <Step n={4} title="Deploy و اتصال دامنه">
                دکمه Deploy را بزنید. بعد از انتشار می‌توانید از <b>Settings → Domains</b> دامنه اختصاصی خود را وصل کنید.
              </Step>
            </ol>
            <p className="text-xs text-[#9AA0A6] leading-6 rounded-xl border border-white/10 bg-white/[.03] p-3">
              اگر متغیرهای Supabase تنظیم نشده باشند، سایت به‌جای پروداکشن در «حالت دموی محلی» بالا می‌آید و ثبت‌نام واقعی کار نخواهد کرد؛ نشان وضعیت بالای صفحه همیشه حالت فعلی را نشان می‌دهد.
            </p>
          </TabsContent>

          <TabsContent value="env" className="mt-4 grid gap-4">
            <p className="text-sm leading-7 text-[#9AA0A6]">
              در Vercel: <b>Project → Settings → Environment Variables</b>؛ در اجرای محلی: فایل <span className="font-mono text-[#8AB4F8]" dir="ltr">.env</span> (نمونه: <span className="font-mono text-[#8AB4F8]" dir="ltr">.env.example</span>).
            </p>
            <EnvTable />
            <p className="text-xs text-[#9AA0A6] leading-6 flex items-start gap-2">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-[#8AB4F8]" />
              کلید Z.ai فقط سمت سرور خوانده می‌شود (در Route Handler تولید پرزنتیشن)؛ چون کد در سرور اجرا می‌شود، کلید هرگز به مرورگر کاربر لو نمی‌رود.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 rounded-xl border border-[#8AB4F8]/25 bg-[#8AB4F8]/10 p-3 text-xs leading-6">
          <Database className="w-4 h-4 text-[#8AB4F8] shrink-0" />
          مهاجرت داده‌های حالت دمو به Supabase لازم نیست؛ داده‌ها از همان ابتدای استفاده پروداکشن در Postgres سوپابیس ذخیره می‌شوند.
        </div>
      </DialogContent>
    </Dialog>
  )
}
