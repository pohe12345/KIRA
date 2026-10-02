-- ============================================================
-- 基拉匿名论坛 数据库结构
-- 在 Supabase Dashboard → SQL Editor 中整体执行（Run）
-- 本文件幂等，可重复执行
-- ============================================================

-- 1. profiles：用户资料（username 全局唯一，is_admin 区分管理员）
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(btrim(username)) between 1 and 20)
);

-- 2. posts：帖子（删除帖子时级联删除其下所有回帖）
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint posts_title_length check (char_length(btrim(title)) between 1 and 50),
  constraint posts_content_length check (char_length(btrim(content)) between 1 and 1000)
);

-- 3. comments：回帖（flat 楼层结构；reply_to 为 null 表示直接回帖，否则回复某楼）
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  reply_to uuid references public.comments(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint comments_content_length check (char_length(btrim(content)) between 1 and 300)
);

-- 索引
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_created_at_idx on public.comments (created_at asc);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists comments_reply_to_idx on public.comments (reply_to);

-- ============================================================
-- RLS：开启行级安全
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- 管理员判断函数（security definer，读取 auth.uid() → profiles.is_admin）
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

-- ============================================================
-- profiles 策略
-- ============================================================
-- 任何人可读（用于显示用户名、以及前端判断当前用户是否管理员）
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select using (true);

-- 任何人可创建 profile（首次设置用户名），但禁止把自己设成管理员
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert with check (is_admin = false);

-- ============================================================
-- posts 策略
-- ============================================================
drop policy if exists "posts_read" on public.posts;
create policy "posts_read" on public.posts
  for select using (true);

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts
  for insert with check (true);

-- 只有管理员可以删除帖子（由 RLS 决定，前端按钮只是 UI）
drop policy if exists "posts_delete_admin" on public.posts;
create policy "posts_delete_admin" on public.posts
  for delete using (public.is_admin());

-- ============================================================
-- comments 策略
-- ============================================================
drop policy if exists "comments_read" on public.comments;
create policy "comments_read" on public.comments
  for select using (true);

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert with check (true);

-- 只有管理员可以删除回帖
drop policy if exists "comments_delete_admin" on public.comments;
create policy "comments_delete_admin" on public.comments
  for delete using (public.is_admin());

-- ============================================================
-- 权限授予（表级权限，配合 RLS 一起工作）
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select, insert on public.profiles to anon, authenticated;
grant select, insert on public.posts to anon, authenticated;
grant select, insert on public.comments to anon, authenticated;

-- 管理员删除需要 DELETE 权限（最终由 RLS 的 is_admin() 决定谁能真正删除）
grant delete on public.posts to authenticated;
grant delete on public.comments to authenticated;
