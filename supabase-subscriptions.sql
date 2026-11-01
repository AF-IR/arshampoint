-- ─────────────────────────────────────────────────────────────
-- آرشام پوینت — جدول اشتراک‌ها (پلن حرفه‌ای)
-- این اسکریپت را یک‌بار در Supabase Dashboard → SQL Editor اجرا کنید.
--
-- ردیف فعال = status:'active' و period_end در آینده.
-- سرویس‌رول (SUPABASE_SERVICE_ROLE_KEY) برای insert/update از
-- روی مسیر پرداخت استفاده می‌شود و از RLS عبور می‌کند؛
-- کاربر عادی فقط اشتراک خودش را می‌بیند.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'pro',
  status text not null default 'active',
  source text not null default 'zarinpal',
  period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "users read own subscription" on public.subscriptions;
create policy "users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);
