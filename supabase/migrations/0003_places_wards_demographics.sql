-- Namma Avadi — Places, place-scoped wards and member demographics.
--
-- 1. Members get a `place` (Thiruninravur / Avadi / Thiruverkadu) plus five
--    demographic fields: religion, community, caste_category, occupation,
--    blood_group. All mandatory in the app; defaults only exist so the
--    pre-existing test rows stay valid.
-- 2. Ward master becomes place-scoped: Thiruninravur 1–27, Avadi 1–48,
--    Thiruverkadu 1–18. The old global ward list (1–7) is replaced.
-- 3. RPCs updated: register_member stores the new fields and validates the
--    place/ward combination server-side; dashboard stats become place-aware.
--
-- Existing test rows are backfilled with place = 'AVADI' (the old ward master
-- was Avadi wards 1–7).

-- ---------------------------------------------------------------------------
-- Members: new columns
-- ---------------------------------------------------------------------------
alter table public.members add column if not exists place          text not null default 'AVADI';
alter table public.members add column if not exists religion       text not null default 'OTHER';
alter table public.members add column if not exists community      text not null default '';
alter table public.members add column if not exists caste_category text not null default 'OC';
alter table public.members add column if not exists occupation     text not null default '';
alter table public.members add column if not exists blood_group    text not null default 'O+';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'members_place_check') then
    alter table public.members add constraint members_place_check
      check (place in ('THIRUNINRAVUR', 'AVADI', 'THIRUVERKADU'));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'members_religion_check') then
    alter table public.members add constraint members_religion_check
      check (religion in ('HINDU', 'MUSLIM', 'CHRISTIAN', 'OTHER'));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'members_caste_category_check') then
    alter table public.members add constraint members_caste_category_check
      check (caste_category in ('OC', 'BC', 'BCM', 'MBC_DNC', 'SC', 'ST'));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'members_blood_group_check') then
    alter table public.members add constraint members_blood_group_check
      check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'));
  end if;
end $$;

create index if not exists idx_members_place on public.members (place);

-- ---------------------------------------------------------------------------
-- Ward master: rebuild as place-scoped
-- ---------------------------------------------------------------------------
-- Drop the old single-column FK before touching the ward table.
alter table public.members drop constraint if exists members_ward_number_fkey;

alter table public.wards add column if not exists place text not null default 'AVADI';

-- Old constraints from 0001: unique (ward_number) + check 1..7.
alter table public.wards drop constraint if exists wards_ward_number_key;
alter table public.wards drop constraint if exists wards_ward_number_check;
alter table public.wards drop constraint if exists wards_place_ward_number_key;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'wards_ward_number_check') then
    alter table public.wards add constraint wards_ward_number_check
      check (ward_number between 1 and 48);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'wards_place_check') then
    alter table public.wards add constraint wards_place_check
      check (place in ('THIRUNINRAVUR', 'AVADI', 'THIRUVERKADU'));
  end if;
end $$;

create unique index if not exists wards_place_ward_unique on public.wards (place, ward_number);

-- Replace the old seed (wards 1–7) with the full place-wise master.
delete from public.wards;
insert into public.wards (place, ward_number, name)
select
  p.place,
  n,
  case p.place
    when 'THIRUNINRAVUR' then 'Thiruninravur Ward ' || n
    when 'AVADI'         then 'Avadi Ward ' || n
    else 'Thiruverkadu Ward ' || n
  end
from (
  values ('THIRUNINRAVUR', 27), ('AVADI', 48), ('THIRUVERKADU', 18)
) as p (place, max_ward)
cross join generate_series(1, p.max_ward) as n;

-- Composite FK: a member's (place, ward_number) must exist in the ward master.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'members_place_ward_fkey') then
    alter table public.members add constraint members_place_ward_fkey
      foreign key (place, ward_number) references public.wards (place, ward_number);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Registration RPC (now stores place + demographics, validates ward range)
-- ---------------------------------------------------------------------------
create or replace function public.register_member(
  p_id             uuid,
  p_full_name      text,
  p_father_name    text,
  p_mobile         text,
  p_aadhaar_number text,
  p_voter_id       text,
  p_ward_number    integer,
  p_address        text,
  p_date_of_birth  date,
  p_email          text,
  p_place          text,
  p_religion       text,
  p_community      text,
  p_caste_category text,
  p_occupation     text,
  p_blood_group    text
)
returns table (member_id text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.wards w where w.place = p_place and w.ward_number = p_ward_number
  ) then
    raise exception 'Invalid ward % for place %', p_ward_number, p_place;
  end if;

  insert into public.members (
    id, full_name, father_name, mobile, aadhaar_number, voter_id,
    ward_number, address, date_of_birth, email,
    place, religion, community, caste_category, occupation, blood_group
  ) values (
    p_id, p_full_name, p_father_name, p_mobile, p_aadhaar_number, p_voter_id,
    p_ward_number, p_address, p_date_of_birth, p_email,
    p_place, p_religion, p_community, p_caste_category, p_occupation, p_blood_group
  );

  return query select m.member_id from public.members m where m.id = p_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dashboard stats: place-aware ward distribution
-- ---------------------------------------------------------------------------
create or replace function public.get_dashboard_stats()
returns table (
  place           text,
  ward_number     integer,
  ward_name       text,
  member_count    bigint,
  active_count    bigint,
  pending_count   bigint,
  inactive_count  bigint
)
language sql
security definer
set search_path = public
as $$
  select
    w.place,
    w.ward_number,
    w.name,
    count(m.id) as member_count,
    count(m.id) filter (where m.status = 'ACTIVE')               as active_count,
    count(m.id) filter (where m.status = 'PENDING_VERIFICATION') as pending_count,
    count(m.id) filter (where m.status = 'INACTIVE')             as inactive_count
  from public.wards w
  left join public.members m
    on m.ward_number = w.ward_number and m.place = w.place
  group by w.place, w.ward_number, w.name
  order by w.place, w.ward_number;
$$;

create or replace function public.get_member_count_by_ward(p_place text, p_ward integer)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.members where place = p_place and ward_number = p_ward;
$$;

-- ---------------------------------------------------------------------------
-- Grants (re-stated because function signatures changed)
-- ---------------------------------------------------------------------------
grant execute on function public.find_member_duplicates(text, text, text) to anon, authenticated;
grant execute on function public.register_member(uuid, text, text, text, text, text, integer, text, date, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_dashboard_stats() to anon, authenticated;
grant execute on function public.get_member_count_by_ward(text, integer) to authenticated;
