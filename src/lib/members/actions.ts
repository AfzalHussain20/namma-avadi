'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { validateMember } from '@/lib/members/validate'
import type { MemberFormInput, RegisterInput } from '@/lib/members/types'
import type { DocumentType, MemberStatus } from '@/lib/supabase/types'
import { removeObjects } from '@/lib/storage'

export type ActionResult =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

export interface RegisterResult {
  status: 'success' | 'duplicate' | 'error'
  message?: string
  memberId?: string
  fieldErrors?: Record<string, string>
  duplicates?: {
    member_id: string
    full_name: string
    ward_number: number
    mobile: string
    status: string
  }[]
}

export async function checkMemberDuplicates(
  form: MemberFormInput
): Promise<{
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string>
  duplicates?: { member_id: string; full_name: string; ward_number: number; mobile: string; status: string }[]
}> {
  const supabase = await createClient()

  const validated = validateMember(form)
  if (!validated.ok) {
    return { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: validated.errors }
  }

  const mobile = form.mobile.trim()
  const aadhaar = form.aadhaar_number.replace(/\s/g, '')
  const voter = form.voter_id.trim().toUpperCase()

  const { data: duplicates } = await supabase.rpc('find_member_duplicates', {
    p_mobile: mobile,
    p_aadhaar: aadhaar,
    p_voter: voter,
  })

  return { ok: true, duplicates: duplicates ?? [] }
}

export async function createMember(input: RegisterInput): Promise<RegisterResult> {
  const supabase = await createClient()

  const validated = validateMember(input.form)
  if (!validated.ok) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: validated.errors }
  }

  const form = {
    full_name: input.form.full_name.trim(),
    father_name: input.form.father_name.trim(),
    mobile: input.form.mobile.trim(),
    date_of_birth: input.form.date_of_birth,
    email: input.form.email.trim() || null,
    address: input.form.address.trim(),
    aadhaar_number: input.form.aadhaar_number.replace(/\s/g, ''),
    voter_id: input.form.voter_id.trim().toUpperCase() || null,
    ward_number: input.form.ward_number,
  }

  // Re-check duplicates — never silently create duplicates.
  const { data: duplicates } = await supabase.rpc('find_member_duplicates', {
    p_mobile: form.mobile,
    p_aadhaar: form.aadhaar_number,
    p_voter: form.voter_id ?? '',
  })

  if (duplicates && duplicates.length > 0 && !input.confirmDuplicate) {
    return { status: 'duplicate', duplicates }
  }

  const { data: memberRows, error } = await supabase.rpc('register_member', {
    p_id: input.member_uuid,
    p_full_name: form.full_name,
    p_father_name: form.father_name,
    p_mobile: form.mobile,
    p_aadhaar_number: form.aadhaar_number,
    p_voter_id: form.voter_id,
    p_ward_number: form.ward_number,
    p_address: form.address,
    p_date_of_birth: form.date_of_birth,
    p_email: form.email,
  })

  if (error || !memberRows || memberRows.length === 0) {
    await removeObjects(input.documents.map((d) => d.file_path))
    return {
      status: 'error',
      message: 'Could not register the member. Please try again.',
    }
  }

  const memberId = memberRows[0].member_id

  if (input.documents.length > 0) {
    const { error: docError } = await supabase.from('member_documents').insert(
      input.documents.map((d) => ({
        member_id: input.member_uuid,
        document_type: d.document_type,
        file_name: d.file_name,
        file_path: d.file_path,
        file_type: d.file_type,
        file_size: d.file_size,
      }))
    )
    if (docError) {
      await removeObjects(input.documents.map((d) => d.file_path))
      return {
        status: 'error',
        message: 'Member created but documents could not be saved. Please upload them from the profile.',
        memberId,
      }
    }
  }

  revalidatePath('/admin', 'layout')
  return { status: 'success', memberId }
}

export async function updateMember(
  memberId: string,
  form: MemberFormInput,
  documents: {
    added: {
      document_type: DocumentType
      file_name: string
      file_path: string
      file_type: string
      file_size: number
    }[]
    removedDocIds: string[]
    removedPaths: string[]
  }
): Promise<ActionResult> {
  const supabase = await createClient()

  const validated = validateMember(form)
  if (!validated.ok) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: validated.errors }
  }

  const { data: member, error } = await supabase
    .from('members')
    .update({
      full_name: form.full_name.trim(),
      father_name: form.father_name.trim(),
      mobile: form.mobile.trim(),
      date_of_birth: form.date_of_birth,
      email: form.email.trim() || null,
      address: form.address.trim(),
      aadhaar_number: form.aadhaar_number.replace(/\s/g, ''),
      voter_id: form.voter_id.trim().toUpperCase() || null,
      ward_number: form.ward_number,
    })
    .eq('member_id', memberId)
    .select('id')
    .single()

  if (error || !member) {
    await removeObjects(documents.added.map((d) => d.file_path))
    return { status: 'error', message: 'Could not update the member. Please try again.' }
  }

  if (documents.removedPaths.length > 0) {
    await removeObjects(documents.removedPaths)
  }
  if (documents.removedDocIds.length > 0) {
    await supabase.from('member_documents').delete().in('id', documents.removedDocIds)
  }
  if (documents.added.length > 0) {
    const { error: docError } = await supabase.from('member_documents').insert(
      documents.added.map((d) => ({
        member_id: member.id,
        document_type: d.document_type,
        file_name: d.file_name,
        file_path: d.file_path,
        file_type: d.file_type,
        file_size: d.file_size,
      }))
    )
    if (docError) {
      await removeObjects(documents.added.map((d) => d.file_path))
      return { status: 'error', message: 'Member updated but some documents could not be saved.' }
    }
  }

  revalidatePath('/admin', 'layout')
  return { status: 'success', message: 'Member updated successfully.' }
}

export async function setMemberStatus(memberId: string, status: MemberStatus): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('members').update({ status }).eq('member_id', memberId)
  if (error) return { status: 'error', message: 'Could not update status.' }
  revalidatePath('/admin', 'layout')
  return { status: 'success', message: 'Status updated.' }
}

export async function deleteMember(memberId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('member_id', memberId)
    .maybeSingle()

  if (!member) return { status: 'error', message: 'Member not found.' }

  const { data: docs } = await supabase
    .from('member_documents')
    .select('file_path')
    .eq('member_id', member.id)

  const { error } = await supabase.from('members').delete().eq('id', member.id)
  if (error) return { status: 'error', message: 'Could not delete the member.' }

  if (docs && docs.length > 0) {
    await removeObjects(docs.map((d) => d.file_path))
  }

  revalidatePath('/admin', 'layout')
  return { status: 'success', message: 'Member deleted.' }
}
