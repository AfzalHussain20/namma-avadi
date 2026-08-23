import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { getSignedUrls } from '@/lib/storage'
import { PLACES } from '@/lib/constants'
import type { Database, DocumentType, MemberStatus } from '@/lib/supabase/types'

export type MemberRow = Database['public']['Tables']['members']['Row']
export type DocumentRow = Database['public']['Tables']['member_documents']['Row']
export type WardRow = Database['public']['Tables']['wards']['Row']

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

export interface MemberListParams {
  q?: string
  place?: string | null
  ward?: number | null
  status?: string | null
  from?: string | null
  to?: string | null
  page?: number
  perPage?: number
}

export interface MemberListResult {
  members: MemberRow[]
  total: number
  page: number
  pages: number
}

export async function listMembers(params: MemberListParams): Promise<MemberListResult> {
  const supabase = await createClient()
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 10))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase.from('members').select('*', { count: 'exact' })

  if (params.q && params.q.trim()) {
    const q = escapeLike(params.q.trim())
    query = query.or(
      [
        `member_id.ilike.%${q}%`,
        `full_name.ilike.%${q}%`,
        `father_name.ilike.%${q}%`,
        `mobile.ilike.%${q}%`,
        `voter_id.ilike.%${q}%`,
      ].join(',')
    )
  }
  if (params.place) query = query.eq('place', params.place)
  if (params.ward) query = query.eq('ward_number', params.ward)
  if (params.status) query = query.eq('status', params.status as MemberStatus)
  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', `${params.to}T23:59:59.999Z`)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error('Unable to load members.')
  }

  return {
    members: (data ?? []) as MemberRow[],
    total: count ?? 0,
    page,
    pages: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  }
}

export async function listAllMembers(params: Omit<MemberListParams, 'page' | 'perPage'>): Promise<
  {
    member_id: string
    full_name: string
    father_name: string
    mobile: string
    place: string
    ward_number: number
    address: string
    date_of_birth: string
    email: string | null
    voter_id: string | null
    religion: string
    community: string
    caste_category: string
    occupation: string
    blood_group: string
    created_at: string
  }[]
> {
  const supabase = await createClient()

  let query = supabase
    .from('members')
    .select(
      'member_id, full_name, father_name, mobile, place, ward_number, address, date_of_birth, email, voter_id, religion, community, caste_category, occupation, blood_group, created_at'
    )

  if (params.q && params.q.trim()) {
    const q = escapeLike(params.q.trim())
    query = query.or(
      [
        `member_id.ilike.%${q}%`,
        `full_name.ilike.%${q}%`,
        `father_name.ilike.%${q}%`,
        `mobile.ilike.%${q}%`,
        `voter_id.ilike.%${q}%`,
      ].join(',')
    )
  }
  if (params.place) query = query.eq('place', params.place)
  if (params.ward) query = query.eq('ward_number', params.ward)
  if (params.status) query = query.eq('status', params.status as MemberStatus)
  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', `${params.to}T23:59:59.999Z`)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error('Unable to export members.')
  }

  return data as Awaited<ReturnType<typeof listAllMembers>>
}

export async function getRecentMembers(limit = 5): Promise<MemberRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data as MemberRow[]
}

export async function getMemberByMemberId(memberId: string): Promise<MemberRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle()
  if (error || !data) return null
  return data as MemberRow
}

export async function getMemberDocuments(memberId: string): Promise<DocumentRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('member_documents')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data as DocumentRow[]
}

export async function getPhotoThumbUrls(memberIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (memberIds.length === 0) return map

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('member_documents')
    .select('member_id, file_path')
    .in('member_id', memberIds)
    .eq('document_type', 'PHOTO' satisfies DocumentType)
  if (error || !data) return map

  const paths = data.map((d) => d.file_path)
  const urls = await getSignedUrls(paths, 3600)
  data.forEach((doc, i) => {
    if (!map.has(doc.member_id) && urls[i]) map.set(doc.member_id, urls[i]!)
  })
  return map
}

export async function getWards(): Promise<WardRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wards')
    .select('*')
    .eq('active', true)
    .order('place', { ascending: true })
    .order('ward_number', { ascending: true })
  if (error || !data) return []
  return data as WardRow[]
}

export interface WardStat {
  place: string
  ward_number: number
  ward_name: string
  member_count: number
}

export interface WardStatsResult {
  /** Every ward of every place, in canonical order — zero-count wards included. */
  rows: WardStat[]
  total: number
  perPlace: { place: string; total: number; wardCount: number }[]
}

/**
 * Complete place-scoped ward statistics.
 * `get_dashboard_stats` only returns wards that have members; this merges the
 * result with the full ward grid from PLACES so no ward or place is ever missing.
 */
export async function getWardStats(): Promise<WardStatsResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')

  const counts = new Map<string, number>()
  let total = 0
  for (const row of data ?? []) {
    counts.set(`${row.place}-${row.ward_number}`, row.member_count)
    total += row.member_count
  }

  const rows: WardStat[] = []
  const perPlace: WardStatsResult['perPlace'] = []
  for (const p of PLACES) {
    let placeTotal = 0
    for (let w = 1; w <= p.maxWard; w++) {
      const count = counts.get(`${p.value}-${w}`) ?? 0
      placeTotal += count
      rows.push({
        place: p.value,
        ward_number: w,
        ward_name: `${p.en} Ward ${w}`,
        member_count: count,
      })
    }
    perPlace.push({ place: p.value, total: placeTotal, wardCount: p.maxWard })
  }

  if (error) {
    // Still render the complete (empty) grid rather than failing the page.
    console.error('get_dashboard_stats failed:', error.message)
  }

  return { rows, total, perPlace }
}

export function groupWardStatsByPlace(rows: WardStat[]): {
  place: string
  maxWard: number
  rows: WardStat[]
  total: number
}[] {
  return PLACES.map((p) => {
    const placeRows = rows.filter((r) => r.place === p.value)
    return {
      place: p.value,
      maxWard: p.maxWard,
      rows: placeRows,
      total: placeRows.reduce((sum, r) => sum + r.member_count, 0),
    }
  })
}
