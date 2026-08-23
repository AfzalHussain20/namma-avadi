-- 0004: Widen the religion check to all major Indian religions.
-- Run after 0003. Idempotent.

alter table public.members drop constraint if exists members_religion_check;

alter table public.members add constraint members_religion_check
  check (
    religion in (
      'HINDU',
      'MUSLIM',
      'CHRISTIAN',
      'SIKH',
      'BUDDHIST',
      'JAIN',
      'OTHER'
    )
  );

-- Keep the registration RPC in sync with the wider set.
create or replace function public.register_member(
  p_user_id          uuid,
  p_full_name        text,
  p_father_name      text,
  p_mobile           text,
  p_date_of_birth    date,
  p_email            text,
  p_address          text,
  p_aadhaar_number   text,
  p_voter_id         text,
  p_place            text,
  p_ward_number      integer,
  p_religion         text,
  p_community        text,
  p_caste_category   text,
  p_occupation       text,
  p_blood_group      text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id  uuid;
  v_max_ward   integer;
begin
  if not exists (
    select 1 from public.admin_users au where au.id = p_user_id and au.role = 'ADMIN'
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  v_member_id := gen_random_uuid();

  case p_place
    when 'THIRUNINRAVUR' then v_max_ward := 27;
    when 'AVADI'         then v_max_ward := 48;
    when 'THIRUVERKADU'  then v_max_ward := 18;
    else
      raise exception 'INVALID_PLACE';
  end case;

  if not exists (
    select 1 from public.wards w
    where w.place = p_place and w.ward_number = p_ward_number
  ) then
    raise exception 'WARD_NOT_IN_PLACE';
  end if;

  insert into public.members (
    id, user_id, full_name, father_name, mobile, date_of_birth, email,
    address, aadhaar_number, voter_id,
    place, ward_number,
    religion, community, caste_category, occupation, blood_group,
    status
  ) values (
    v_member_id, p_user_id, p_full_name, p_father_name, p_mobile, p_date_of_birth, p_email,
    p_address, p_aadhaar_number, p_voter_id,
    p_place, p_ward_number,
    p_religion, p_community, p_caste_category, p_occupation, p_blood_group,
    'ACTIVE'
  );

  return v_member_id;
end;
$$;

grant execute on function public.register_member(uuid, text, text, text, date, text, text, text, text, text, integer, text, text, text, text, text)
  to authenticated;
