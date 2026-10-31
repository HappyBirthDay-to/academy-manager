create table if not exists public.academy_data (owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,key text not null,value jsonb not null,updated_at timestamptz not null default now(),primary key(owner_id,key));
alter table public.academy_data enable row level security;
revoke all on public.academy_data from anon;
grant select,insert,update,delete on public.academy_data to authenticated;
create policy "read own" on public.academy_data for select to authenticated using(owner_id=(select auth.uid()));
create policy "insert own" on public.academy_data for insert to authenticated with check(owner_id=(select auth.uid()));
create policy "update own" on public.academy_data for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "delete own" on public.academy_data for delete to authenticated using(owner_id=(select auth.uid()));
