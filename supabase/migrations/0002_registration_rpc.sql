-- Namma Avadi — registration via SECURITY DEFINER RPCs.
--
-- Public (anon) users must be able to register members and check duplicates
-- WITHOUT being able to read the members table directly (no anon SELECT
-- policy exists — that is intentional). PostgREST's INSERT ... RETURNING and
-- plain SELECT both fail for anon because of that. These definer functions are
-- the only bridge between anon and the members table.

-- Duplicate lookup: matches mobile / aadhaar / voter.
create or replace function public.find_member_duplicates(
  p_mobile  text,
  p_aadhaar text,
  p_voter   text
)
returns table (
  member_id   text,
  full_name   text,
  ward_number integer,
  mobile      text,
  status      public.member_status
)
language sql
security definer
set search_path = public
as $$
  select m.member_id, m.full_name, m.ward_number, m.mobile, m.status
  from public.members m
  where m.mobile = p_mobile
     or m.aadhaar_number = p_aadhaar
     or (p_voter is not null and p_voter <> '' and m.voter_id = p_voter);
$$;

-- Register: inserts the member and returns the DB-generated member_id (NA-xxxxxx).
-- The caller passes the client-generated member uuid so document rows can be
-- linked in a separate (also anon-allowed) insert afterwards.
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
  p_email          text
)
returns table (member_id text)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (
    id, full_name, father_name, mobile, aadhaar_number, voter_id,
    ward_number, address, date_of_birth, email
  ) values (
    p_id, p_full_name, p_father_name, p_mobile, p_aadhaar_number, p_voter_id,
    p_ward_number, p_address, p_date_of_birth, p_email
  );

  return query select m.member_id from public.members m where m.id = p_id;
end;
$$;

grant execute on function public.find_member_duplicates(text, text, text) to anon, authenticated;
grant execute on function public.register_member(uuid, text, text, text, text, text, integer, text, date, text) to anon, authenticated;
