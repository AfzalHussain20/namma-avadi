-- Namma Avadi — TVK Member System
-- Foundation: schema, sequences, RLS, private storage, Ward 1-7 seed.

-- ---------------------------------------------------------------------------
-- Ward master data (drives registration dropdown, filters, dashboard, reports)
-- ---------------------------------------------------------------------------
create table if not exists public.wards (
  id          bigint generated always as identity primary key,
  ward_number integer not null unique check (ward_number between 1 and 7),
  name        text    not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Member ID sequence (DB-backed unique sequence -> NA-000001, NA-000002, ...)
-- ---------------------------------------------------------------------------
create sequence if not exists public.member_id_seq start 1;

-- ---------------------------------------------------------------------------
-- Members
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'member_status') then
    create type public.member_status as enum ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION');
  end if;
end $$;

create table if not exists public.members (
  id               uuid primary key default gen_random_uuid(),
  member_id        text not null unique,
  full_name        text not null,
  father_name      text not null,
  mobile           text not null,
  aadhaar_number   text not null,
  voter_id         text,
  ward_number      integer not null references public.wards (ward_number),
  address          text not null,
  date_of_birth    date not null,
  email            text,
  status           public.member_status not null default 'ACTIVE',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Fast lookups: search (member_id, mobile, full_name, father_name, voter_id)
-- and filters (ward_number, status, created_at).
create index if not exists idx_members_member_id   on public.members (member_id);
create index if not exists idx_members_mobile      on public.members (mobile);
create index if not exists idx_members_full_name   on public.members (full_name);
create index if not exists idx_members_father_name on public.members (father_name);
create index if not exists idx_members_voter_id    on public.members (voter_id);
create index if not exists idx_members_ward_number on public.members (ward_number);
create index if not exists idx_members_status      on public.members (status);
create index if not exists idx_members_created_at  on public.members (created_at);

-- ---------------------------------------------------------------------------
-- Member documents (private storage bucket; paths only, never public URLs)
-- ---------------------------------------------------------------------------
create table if not exists public.member_documents (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.members (id) on delete cascade,
  document_type text not null check (document_type in ('AADHAAR', 'VOTER_ID', 'TVK_ID', 'PHOTO')),
  file_name     text not null,
  file_path     text not null,
  file_type     text not null,
  file_size     bigint not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_member_documents_member_id on public.member_documents (member_id);

-- ---------------------------------------------------------------------------
-- Triggers: auto member_id + auto updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_member_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.member_id := 'NA-' || lpad(nextval('public.member_id_seq')::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists trg_members_set_member_id on public.members;
create trigger trg_members_set_member_id
  before insert on public.members
  for each row
  when (new.member_id is null)
  execute function public.set_member_id();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
  before update on public.members
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.wards            enable row level security;
alter table public.members          enable row level security;
alter table public.member_documents enable row level security;

-- Wards: public read (only ward numbers/names — not member data).
drop policy if exists "wards_public_read" on public.wards;
create policy "wards_public_read" on public.wards for select to anon, authenticated using (true);

-- Members:
--   * anon: insert only (public registration form submits members;
--     must never read/update/delete other members).
--   * authenticated: full access (admin).
drop policy if exists "members_anon_insert" on public.members;
drop policy if exists "members_auth_insert" on public.members;
drop policy if exists "members_auth_select" on public.members;
drop policy if exists "members_auth_update" on public.members;
drop policy if exists "members_auth_delete" on public.members;
create policy "members_anon_insert"     on public.members for insert to anon with check (true);
create policy "members_auth_insert"     on public.members for insert to authenticated with check (true);
create policy "members_auth_select"     on public.members for select to authenticated using (true);
create policy "members_auth_update"     on public.members for update to authenticated using (true) with check (true);
create policy "members_auth_delete"     on public.members for delete to authenticated using (true);

-- Member documents: same model — anon can insert (registration uploads),
-- only authenticated can read/update/delete.
drop policy if exists "member_documents_anon_insert" on public.member_documents;
drop policy if exists "member_documents_auth_insert" on public.member_documents;
drop policy if exists "member_documents_auth_select" on public.member_documents;
drop policy if exists "member_documents_auth_update" on public.member_documents;
drop policy if exists "member_documents_auth_delete" on public.member_documents;
create policy "member_documents_anon_insert" on public.member_documents for insert to anon with check (true);
create policy "member_documents_auth_insert" on public.member_documents for insert to authenticated with check (true);
create policy "member_documents_auth_select" on public.member_documents for select to authenticated using (true);
create policy "member_documents_auth_update" on public.member_documents for update to authenticated using (true) with check (true);
create policy "member_documents_auth_delete" on public.member_documents for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Private storage bucket for member documents (never public)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('member-documents', 'member-documents', false)
on conflict (id) do nothing;

drop policy if exists "member_documents_bucket_insert_anon"  on storage.objects;
drop policy if exists "member_documents_bucket_insert_auth"  on storage.objects;
drop policy if exists "member_documents_bucket_select_auth"  on storage.objects;
drop policy if exists "member_documents_bucket_update_auth"  on storage.objects;
drop policy if exists "member_documents_bucket_delete_auth"  on storage.objects;

create policy "member_documents_bucket_insert_anon"
  on storage.objects for insert to anon
  with check (bucket_id = 'member-documents');

create policy "member_documents_bucket_insert_auth"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'member-documents');

create policy "member_documents_bucket_select_auth"
  on storage.objects for select to authenticated
  using (bucket_id = 'member-documents');

create policy "member_documents_bucket_update_auth"
  on storage.objects for update to authenticated
  using (bucket_id = 'member-documents');

create policy "member_documents_bucket_delete_auth"
  on storage.objects for delete to authenticated
  using (bucket_id = 'member-documents');

-- ---------------------------------------------------------------------------
-- Seed: Ward 1-7 master data
-- ---------------------------------------------------------------------------
insert into public.wards (ward_number, name)
select n, 'Ward ' || n
from generate_series(1, 7) as n
on conflict (ward_number) do nothing;

-- ---------------------------------------------------------------------------
-- Dashboard: ward-level member counts (one call, no member data exposed)
-- ---------------------------------------------------------------------------
create or replace function public.get_dashboard_stats()
returns table (
  ward_number  integer,
  ward_name    text,
  member_count bigint,
  active_count bigint,
  pending_count bigint,
  inactive_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    w.ward_number,
    w.name,
    count(m.id)                          as member_count,
    count(m.id) filter (where m.status = 'ACTIVE')               as active_count,
    count(m.id) filter (where m.status = 'PENDING_VERIFICATION') as pending_count,
    count(m.id) filter (where m.status = 'INACTIVE')             as inactive_count
  from public.wards w
  left join public.members m on m.ward_number = w.ward_number
  group by w.ward_number, w.name
  order by w.ward_number;
$$;

grant execute on function public.get_dashboard_stats() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Ward members count for a specific ward (drives ward overview / reports)
-- ---------------------------------------------------------------------------
create or replace function public.get_member_count_by_ward(p_ward integer)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.members where ward_number = p_ward;
$$;

grant execute on function public.get_member_count_by_ward(integer) to authenticated;
