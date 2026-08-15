'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { MemberRow, WardRow } from '@/lib/members/queries'
import type { DocumentRow } from '@/lib/members/queries'
import { deleteMember, updateMember } from '@/lib/members/actions'
import {
  DOC_TYPE_ACCEPTS,
  DOC_TYPE_MAX_BYTES,
  documentFilePath,
  uploadFileWithProgress,
} from '@/lib/upload'
import { createClient } from '@/lib/supabase/client'
import {
  cn,
  formatBytes,
  formatDate,
  maskAadhaar,
  DOC_LABELS,
  isValidAadhaar,
  isValidEmail,
  isValidMobile,
  isValidVoterId,
  isFutureDate,
} from '@/lib/utils'
import type { DocumentType } from '@/lib/supabase/types'

type DocWithUrl = DocumentRow & { signedUrl: string | null }

const DOC_TYPES: DocumentType[] = ['AADHAAR', 'VOTER_ID', 'TVK_ID', 'PHOTO']

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="border-b pb-3 text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value ?? '—'}</dd>
    </div>
  )
}

export default function MemberProfile({
  member,
  documents,
  wards,
  editingInitial,
}: {
  member: MemberRow
  documents: DocWithUrl[]
  wards: WardRow[]
  editingInitial: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(editingInitial)
  const [form, setForm] = useState({
    full_name: member.full_name,
    father_name: member.father_name,
    mobile: member.mobile,
    date_of_birth: member.date_of_birth.slice(0, 10),
    email: member.email ?? '',
    address: member.address,
    aadhaar_number: member.aadhaar_number,
    voter_id: member.voter_id ?? '',
    ward_number: String(member.ward_number),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFiles, setNewFiles] = useState<Partial<Record<DocumentType, File>>>({})
  const [fileErrors, setFileErrors] = useState<Partial<Record<DocumentType, string>>>({})
  const [removedDocs, setRemovedDocs] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<Partial<Record<DocumentType, number>>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required.'
    if (!form.father_name.trim()) e.father_name = "Father's name is required."
    if (!isValidMobile(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number.'
    if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required.'
    else if (isFutureDate(form.date_of_birth)) e.date_of_birth = 'Date of birth cannot be in the future.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!isValidEmail(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!form.address.trim()) e.address = 'Address is required.'
    if (!isValidAadhaar(form.aadhaar_number.replace(/\s/g, ''))) e.aadhaar_number = 'Enter a valid 12-digit Aadhaar number.'
    if (!form.voter_id.trim()) e.voter_id = 'Voter ID is required.'
    else if (!isValidVoterId(form.voter_id.trim().toUpperCase()))
      e.voter_id = 'Enter a valid Voter ID (e.g. ABC1234567).'
    if (!form.ward_number) e.ward_number = 'Select a ward (1–7).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateFile(type: DocumentType, file: File | undefined): string | undefined {
    if (!file) return undefined
    const okTypes = (DOC_TYPE_ACCEPTS[type] || '').replace(/\./g, '').split(',').filter(Boolean)
    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    if (!okTypes.includes(ext)) return `Only ${okTypes.join(', ')} files are allowed.`
    if (file.size > DOC_TYPE_MAX_BYTES[type]) return 'File size must be 5 MB or less.'
    return undefined
  }

  function handleFile(type: DocumentType, file: File | null) {
    const err = validateFile(type, file ?? undefined)
    setFileErrors((fe) => ({ ...fe, [type]: err }))
    setNewFiles((nf) => ({ ...nf, [type]: file ?? undefined }))
  }

  async function save() {
    if (!validate()) {
      setMessage({ type: 'error', text: 'Please review the highlighted fields.' })
      return
    }
    setBusy(true)
    setMessage(null)

    const token = await getAccessToken()
    const added = []
    const removedPaths: string[] = []
    const removedDocIds: string[] = []

    for (const type of DOC_TYPES) {
      const file = newFiles[type]
      if (!file) continue
      const path = documentFilePath(member.id, type, file.name)
      setProgress((p) => ({ ...p, [type]: 0 }))
      const up = await uploadFileWithProgress(path, file, token, (pct) =>
        setProgress((prev) => ({ ...prev, [type]: pct }))
      )
      if (!up.ok) {
        setBusy(false)
        setMessage({ type: 'error', text: `Could not upload ${DOC_LABELS[type]}. Please try again.` })
        return
      }
      added.push({
        document_type: type,
        file_name: file.name,
        file_path: up.path,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
      })
    }

    documents.forEach((doc) => {
      if (removedDocs.has(doc.id)) {
        removedDocIds.push(doc.id)
        removedPaths.push(doc.file_path)
      }
    })

    const result = await updateMember(
      member.member_id,
      {
        full_name: form.full_name,
        father_name: form.father_name,
        mobile: form.mobile,
        date_of_birth: form.date_of_birth,
        email: form.email,
        address: form.address,
        aadhaar_number: form.aadhaar_number,
        voter_id: form.voter_id,
        ward_number: parseInt(form.ward_number, 10),
      },
      { added, removedDocIds, removedPaths }
    )

    setBusy(false)
    setProgress({})
    if (result.status === 'success') {
      setMessage({ type: 'success', text: result.message })
      setEditing(false)
      router.replace(`/admin/members/${member.member_id}`)
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  async function handleDelete() {
    setBusy(true)
    const result = await deleteMember(member.member_id)
    if (result.status === 'success') {
      router.push('/admin/members')
    } else {
      setBusy(false)
      setMessage({ type: 'error', text: result.message })
    }
  }

  if (!editing) {
    const tvkIdDoc = documents.find((d) => d.document_type === 'TVK_ID')

    return (
      <div className="space-y-6">
        {message && (
          <div
            className={cn(
              'rounded-lg px-4 py-3 text-sm',
              message.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-danger/30 bg-danger/10 text-danger'
            )}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin/members" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Back to members
          </Link>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
            {!confirmDelete ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm">
                <span className="text-danger">Permanently delete {member.member_id}?</span>
                <button type="button" className="font-semibold text-danger hover:underline" onClick={handleDelete} disabled={busy}>
                  Confirm
                </button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Personal Details">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Full Name" value={member.full_name} />
              <DetailRow label="Father's Name" value={member.father_name} />
              <DetailRow label="Date of Birth" value={formatDate(member.date_of_birth)} />
              <DetailRow label="Mobile" value={<span className="tabular-nums">{member.mobile}</span>} />
              <DetailRow label="Email" value={member.email ?? '—'} />
              <DetailRow label="Registered" value={formatDate(member.created_at)} />
            </dl>
          </SectionCard>

          <SectionCard title="Location">
            <dl className="grid grid-cols-1 gap-4">
              <DetailRow label="Ward" value={`Ward ${member.ward_number}`} />
              <DetailRow label="Address" value={member.address} />
            </dl>
          </SectionCard>

          <SectionCard title="Identity">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Aadhaar" value={<span className="tabular-nums">{maskAadhaar(member.aadhaar_number)}</span>} />
              <DetailRow label="Voter ID" value={<span className="tabular-nums">{member.voter_id ?? '—'}</span>} />
              <DetailRow label="TVK ID" value={<span className="tabular-nums">{tvkIdDoc ? 'Uploaded' : '—'}</span>} />
            </dl>
          </SectionCard>

          <SectionCard title="Documents">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {DOC_LABELS[doc.document_type] ?? doc.document_type}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.file_name} · {formatBytes(doc.file_size)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {doc.signedUrl && (
                        <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          View
                        </a>
                      )}
                      {doc.signedUrl && (
                        <a href={doc.signedUrl} download={doc.file_name} className="btn btn-ghost btn-sm">
                          Download
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Documents are stored privately. Download links expire after one hour.
            </p>
          </SectionCard>
        </div>
      </div>
    )
  }

  // ---- Edit mode ----
  const inputCls = (hasError: boolean) => cn('input', hasError && 'border-danger focus:border-danger')

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-danger/30 bg-danger/10 text-danger'
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Member</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>

      <section className="card space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="e-full_name" className="label">Full Name *</label>
            <input id="e-full_name" className={inputCls(!!errors.full_name)} value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
            {errors.full_name && <p className="mt-1 text-xs text-danger">{errors.full_name}</p>}
          </div>
          <div>
            <label htmlFor="e-father_name" className="label">Father&rsquo;s Name *</label>
            <input id="e-father_name" className={inputCls(!!errors.father_name)} value={form.father_name} onChange={(e) => setField('father_name', e.target.value)} />
            {errors.father_name && <p className="mt-1 text-xs text-danger">{errors.father_name}</p>}
          </div>
          <div>
            <label htmlFor="e-mobile" className="label">Mobile Number *</label>
            <input id="e-mobile" inputMode="numeric" maxLength={10} className={inputCls(!!errors.mobile)} value={form.mobile} onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            {errors.mobile && <p className="mt-1 text-xs text-danger">{errors.mobile}</p>}
          </div>
          <div>
            <label htmlFor="e-dob" className="label">Date of Birth *</label>
            <input id="e-dob" type="date" max={new Date().toISOString().split('T')[0]} className={inputCls(!!errors.date_of_birth)} value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
            {errors.date_of_birth && <p className="mt-1 text-xs text-danger">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label htmlFor="e-email" className="label">Email *</label>
            <input id="e-email" type="email" className={inputCls(!!errors.email)} value={form.email} onChange={(e) => setField('email', e.target.value)} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="e-ward" className="label">Ward *</label>
            <select id="e-ward" className={inputCls(!!errors.ward_number)} value={form.ward_number} onChange={(e) => setField('ward_number', e.target.value)}>
              <option value="">Select ward…</option>
              {wards.map((w) => (
                <option key={w.ward_number} value={w.ward_number}>{w.name}</option>
              ))}
            </select>
            {errors.ward_number && <p className="mt-1 text-xs text-danger">{errors.ward_number}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="e-address" className="label">Address *</label>
            <textarea id="e-address" rows={2} className={cn(inputCls(!!errors.address), 'resize-none')} value={form.address} onChange={(e) => setField('address', e.target.value)} />
            {errors.address && <p className="mt-1 text-xs text-danger">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="e-aadhaar" className="label">Aadhaar Number *</label>
            <input id="e-aadhaar" inputMode="numeric" maxLength={12} className={inputCls(!!errors.aadhaar_number)} value={form.aadhaar_number} onChange={(e) => setField('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))} />
            {errors.aadhaar_number && <p className="mt-1 text-xs text-danger">{errors.aadhaar_number}</p>}
          </div>
          <div>
            <label htmlFor="e-voter" className="label">Voter ID *</label>
            <input id="e-voter" className={inputCls(!!errors.voter_id)} value={form.voter_id} onChange={(e) => setField('voter_id', e.target.value.toUpperCase())} />
            {errors.voter_id && <p className="mt-1 text-xs text-danger">{errors.voter_id}</p>}
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">Documents</h2>
        {documents.filter((d) => !removedDocs.has(d.id)).length > 0 && (
          <ul className="space-y-2">
            {documents
              .filter((d) => !removedDocs.has(d.id))
              .map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{DOC_LABELS[doc.document_type] ?? doc.document_type}</p>
                    <p className="truncate text-xs text-muted-foreground">{doc.file_name} · {formatBytes(doc.file_size)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">View</a>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setRemovedDocs((s) => new Set(s).add(doc.id))}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
        <p className="text-sm text-muted-foreground">Add or replace documents (max 5 MB each):</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOC_TYPES.map((type) => {
            const file = newFiles[type]
            const pct = progress[type]
            return (
              <div key={type} className="rounded-xl border p-4">
                <p className="text-sm font-medium">{DOC_LABELS[type]}</p>
                <label htmlFor={`ed-doc-${type}`} className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                  {file ? (
                    <>
                      <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="max-w-[170px] truncate">{file.name}</span>
                    </>
                  ) : (
                    'Upload new'
                  )}
                </label>
                <input id={`ed-doc-${type}`} type="file" accept={DOC_TYPE_ACCEPTS[type]} className="hidden" onChange={(e) => handleFile(type, e.target.files?.[0] ?? null)} />
                {file && (
                  <button type="button" className="mt-2 text-xs font-medium text-danger hover:underline" onClick={() => handleFile(type, null)}>Remove</button>
                )}
                {pct !== undefined && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Uploading {pct}%</p>
                  </div>
                )}
                {fileErrors[type] && <p className="mt-2 text-xs text-danger">{fileErrors[type]}</p>}
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  } catch {
    return null
  }
}
