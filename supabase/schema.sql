-- ═══════════════════════════════════════════════════════════════
-- آرشام پوینت (Arsham Point) — Supabase schema
-- اجرا در: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- جدول پرزنتیشن‌ها؛ user_id به جدول auth.users سوپابیس وصل است
create table if not exists public.presentations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  topic       text not null,
  audience    text,
  theme       text not null default 'blue',
  language    text not null default 'fa',
  slide_count integer not null default 0,
  deck_json   jsonb not null default '{}'::jsonb,
  html        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists presentations_user_created_idx
  on public.presentations (user_id, created_at desc);

-- فعال‌سازی Row Level Security: هر کاربر فقط داده خودش را می‌بیند.
-- بک‌اند برنامه با کلید service_role (که RLS را دور می‌زند) کار می‌کند،
-- اما این سیاست‌ها دسترسی مستقیم مرورگر به جدول را هم امن می‌کنند.
alter table public.presentations enable row level security;

drop policy if exists "users manage own presentations" on public.presentations;
create policy "users manage own presentations"
  on public.presentations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
