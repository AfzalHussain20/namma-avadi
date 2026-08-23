import {
  isFutureDate,
  isValidAadhaar,
  isValidEmail,
  isValidMobile,
  isValidVoterId,
} from '@/lib/utils'
import { CASTE_CATEGORY_VALUES, PLACE_VALUES, RELIGION_VALUES, isValidWardForPlace } from '@/lib/constants'
import type { MemberFormInput } from '@/lib/members/types'
import type { DictKey } from '@/lib/i18n'

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: Record<string, DictKey> }

export function validateMember(input: MemberFormInput): ValidationResult {
  const errors: Record<string, DictKey> = {}
  const s = (v: string) => (v ?? '').trim()

  if (!s(input.full_name) || s(input.full_name).length < 2) errors.full_name = 'errFullName'

  if (!s(input.father_name) || s(input.father_name).length < 2) errors.father_name = 'errFatherName'

  if (!s(input.mobile)) errors.mobile = 'errMobileRequired'
  else if (!isValidMobile(s(input.mobile))) errors.mobile = 'errMobile'

  if (!s(input.date_of_birth)) errors.date_of_birth = 'errDobRequired'
  else if (isFutureDate(s(input.date_of_birth))) errors.date_of_birth = 'errDobFuture'

  if (!s(input.email)) errors.email = 'errEmailRequired'
  else if (!isValidEmail(s(input.email))) errors.email = 'errEmailInvalid'

  if (!s(input.address) || s(input.address).length < 5) errors.address = 'errAddress'

  const aadhaar = s(input.aadhaar_number).replace(/\s/g, '')
  if (!aadhaar) errors.aadhaar_number = 'errAadhaarRequired'
  else if (!isValidAadhaar(aadhaar)) errors.aadhaar_number = 'errAadhaarInvalid'

  const voter = s(input.voter_id).toUpperCase()
  if (!voter) errors.voter_id = 'errVoterRequired'
  else if (!isValidVoterId(voter)) errors.voter_id = 'errVoterInvalid'

  if (!PLACE_VALUES.includes(input.place as never)) {
    errors.place = 'errPlaceRequired'
    errors.ward_number = 'errWardRange'
  } else if (
    !Number.isInteger(input.ward_number) ||
    !isValidWardForPlace(input.place, input.ward_number)
  ) {
    errors.ward_number = 'errWardRange'
  }

  if (!RELIGION_VALUES.includes(input.religion as never)) errors.religion = 'errReligionRequired'
  if (!s(input.community)) errors.community = 'errCommunityRequired'
  if (!CASTE_CATEGORY_VALUES.includes(input.caste_category as never)) {
    errors.caste_category = 'errCasteRequired'
  }
  if (!s(input.occupation)) errors.occupation = 'errOccupationRequired'
  if (!s(input.blood_group)) errors.blood_group = 'errBloodRequired'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true }
}
