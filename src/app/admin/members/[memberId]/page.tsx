import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/dal'
import { getMemberByMemberId, getMemberDocuments, getWards } from '@/lib/members/queries'
import { getSignedUrls } from '@/lib/storage'
import { formatDate } from '@/lib/utils'
import MemberProfile from './member-profile'

export const metadata: Metadata = { title: 'Member Profile' }
export const dynamic = 'force-dynamic'

export default async function MemberProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const { memberId } = await params
  const sp = await searchParams
  const editing = Array.isArray(sp.edit) ? sp.edit[0] === '1' : sp.edit === '1'

  const member = await getMemberByMemberId(memberId)
  if (!member) notFound()

  const [documents, wards] = await Promise.all([getMemberDocuments(member.id), getWards()])

  const signedUrls = await getSignedUrls(documents.map((d) => d.file_path))
  const docsWithUrls = documents.map((d, i) => ({ ...d, signedUrl: signedUrls[i] ?? null }))

  const photoDoc = docsWithUrls.find((d) => d.document_type === 'PHOTO')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
            {photoDoc?.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoDoc.signedUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{member.full_name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{member.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-primary">{member.member_id}</span>
              <span>·</span>
              <span>Ward {member.ward_number}</span>
              <span>·</span>
              <span>Registered {formatDate(member.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <MemberProfile member={member} documents={docsWithUrls} wards={wards} editingInitial={editing} />
    </div>
  )
}
