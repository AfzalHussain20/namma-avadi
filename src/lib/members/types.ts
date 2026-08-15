import type { DocumentType } from '@/lib/supabase/types'

export interface MemberFormInput {
  full_name: string
  father_name: string
  mobile: string
  date_of_birth: string
  email: string
  address: string
  aadhaar_number: string
  voter_id: string
  ward_number: number
}

export interface MemberDocInput {
  document_type: DocumentType
  file_name: string
  file_path: string
  file_type: string
  file_size: number
}

export interface RegisterMemberInput extends MemberFormInput {
  member_uuid: string
  confirmDuplicate: boolean
  documents: MemberDocInput[]
}

export interface RegisterInput {
  member_uuid: string
  confirmDuplicate: boolean
  documents: MemberDocInput[]
  form: MemberFormInput
}

export interface DuplicateMember {
  member_id: string
  full_name: string
  ward_number: number
  mobile: string
  status: string
}
