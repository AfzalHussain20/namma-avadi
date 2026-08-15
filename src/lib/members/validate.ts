import {
  isFutureDate,
  isValidAadhaar,
  isValidEmail,
  isValidMobile,
  isValidVoterId,
} from '@/lib/utils'
import type { MemberFormInput } from '@/lib/members/types'

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> }

export function validateMember(input: MemberFormInput): ValidationResult {
  const errors: Record<string, string> = {}
  const s = (v: string) => (v ?? '').trim()

  if (!s(input.full_name)) errors.full_name = 'Full name is required.'
  else if (s(input.full_name).length < 2) errors.full_name = 'Enter a valid name.'

  if (!s(input.father_name)) errors.father_name = "Father's name is required."
  else if (s(input.father_name).length < 2) errors.father_name = 'Enter a valid name.'

  if (!s(input.mobile)) errors.mobile = 'Mobile number is required.'
  else if (!isValidMobile(s(input.mobile))) errors.mobile = 'Enter a valid 10-digit mobile number.'

  if (!s(input.date_of_birth)) errors.date_of_birth = 'Date of birth is required.'
  else if (isFutureDate(s(input.date_of_birth))) errors.date_of_birth = 'Date of birth cannot be in the future.'

  if (!s(input.email)) errors.email = 'Email is required.'
  else if (!isValidEmail(s(input.email))) errors.email = 'Enter a valid email address.'

  if (!s(input.address)) errors.address = 'Address is required.'
  else if (s(input.address).length < 5) errors.address = 'Enter the full address.'

  const aadhaar = s(input.aadhaar_number).replace(/\s/g, '')
  if (!aadhaar) errors.aadhaar_number = 'Aadhaar number is required.'
  else if (!isValidAadhaar(aadhaar)) errors.aadhaar_number = 'Enter a valid 12-digit Aadhaar number.'

  const voter = s(input.voter_id).toUpperCase()
  if (!voter) errors.voter_id = 'Voter ID is required.'
  else if (!isValidVoterId(voter)) {
    errors.voter_id = 'Enter a valid Voter ID (e.g. ABC1234567).'
  }

  if (!Number.isInteger(input.ward_number) || input.ward_number < 1 || input.ward_number > 7) {
    errors.ward_number = 'Select a valid ward (1–7).'
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true }
}
