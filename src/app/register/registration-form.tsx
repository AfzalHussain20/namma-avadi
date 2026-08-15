'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { WardRow } from '@/lib/members/queries'
import { checkMemberDuplicates, createMember } from '@/lib/members/actions'
import type { RegisterResult } from '@/lib/members/actions'
import type { MemberDocInput } from '@/lib/members/types'
import {
  DOC_TYPE_ACCEPTS,
  DOC_TYPE_MAX_BYTES,
  documentFilePath,
  uploadFileWithProgress,
} from '@/lib/upload'
import { cn, isValidAadhaar, isValidEmail, isValidMobile, isValidVoterId, isFutureDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { DocumentType } from '@/lib/supabase/types'

const DOC_ORDER: DocumentType[] = ['AADHAAR', 'VOTER_ID', 'TVK_ID', 'PHOTO']
const DOC_LABELS: Record<DocumentType, string> = {
  AADHAAR: 'Aadhaar',
  VOTER_ID: 'Voter ID',
  TVK_ID: 'TVK ID',
  PHOTO: 'Photo',
}

type FormValues = {
  full_name: string
  father_name: string
  mobile: string
  date_of_birth: string
  email: string
  address: string
  aadhaar_number: string
  voter_id: string
  ward_number: string
}

const initialValues: FormValues = {
  full_name: '',
  father_name: '',
  mobile: '',
  date_of_birth: '',
  email: '',
  address: '',
  aadhaar_number: '',
  voter_id: '',
  ward_number: '',
}

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

export default function RegistrationForm({ wards }: { wards: WardRow[] }) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({})
  const [fileErrors, setFileErrors] = useState<Partial<Record<DocumentType, string>>>({})
  const [progress, setProgress] = useState<Partial<Record<DocumentType, number>>>({})
  const [status, setStatus] = useState<'idle' | 'busy' | 'duplicate' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [duplicates, setDuplicates] = useState<RegisterResult['duplicates']>([])
  const [memberId, setMemberId] = useState('')
  const [confirmDuplicate, setConfirmDuplicate] = useState(false)
  const uploadingRef = useRef(false)

  const setField = (key: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    const v = values
    if (!v.full_name.trim()) e.full_name = 'Full name is required.'
    if (!v.father_name.trim()) e.father_name = "Father's name is required."
    if (!v.mobile.trim()) e.mobile = 'Mobile number is required.'
    else if (!isValidMobile(v.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number.'
    if (!v.date_of_birth) e.date_of_birth = 'Date of birth is required.'
    else if (isFutureDate(v.date_of_birth)) e.date_of_birth = 'Date of birth cannot be in the future.'
    if (!v.email.trim()) e.email = 'Email is required.'
    else if (!isValidEmail(v.email.trim())) e.email = 'Enter a valid email address.'
    if (!v.address.trim()) e.address = 'Address is required.'
    const aadhaar = v.aadhaar_number.replace(/\s/g, '')
    if (!aadhaar) e.aadhaar_number = 'Aadhaar number is required.'
    else if (!isValidAadhaar(aadhaar)) e.aadhaar_number = 'Enter a valid 12-digit Aadhaar number.'
    const voter = v.voter_id.trim().toUpperCase()
    if (!voter) e.voter_id = 'Voter ID is required.'
    else if (!isValidVoterId(voter)) e.voter_id = 'Enter a valid Voter ID (e.g. ABC1234567).'
    if (!v.ward_number) e.ward_number = 'Select a ward (1–7).'
    for (const type of DOC_ORDER) {
      if (!files[type]) e[`doc-${type}`] = 'This document is required.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateFile(type: DocumentType, file: File | undefined): string | undefined {
    if (!file) return undefined
    const okTypes = (DOC_TYPE_ACCEPTS[type] || '').replace(/\./g, '').split(',').filter(Boolean)
    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    if (!okTypes.includes(ext)) {
      return `Only ${okTypes.join(', ')} files are allowed.`
    }
    if (file.size > DOC_TYPE_MAX_BYTES[type]) {
      return 'File size must be 5 MB or less.'
    }
    return undefined
  }

  function handleFile(type: DocumentType, file: File | null) {
    const err = validateFile(type, file ?? undefined)
    setFileErrors((e) => ({ ...e, [type]: err }))
    setFiles((f) => ({ ...f, [type]: file ?? undefined }))
    setErrors((e) => ({ ...e, [`doc-${type}`]: undefined }))
    setStatus('idle')
  }

  function buildFormPayload() {
    return {
      full_name: values.full_name,
      father_name: values.father_name,
      mobile: values.mobile,
      date_of_birth: values.date_of_birth,
      email: values.email.trim(),
      address: values.address,
      aadhaar_number: values.aadhaar_number,
      voter_id: values.voter_id,
      ward_number: parseInt(values.ward_number, 10),
    }
  }

  async function handleSubmit() {
    if (uploadingRef.current) return
    if (!validate()) {
      setStatus('error')
      setMessage('Please review the highlighted fields.')
      return
    }
    setStatus('busy')
    setMessage('')
    setDuplicates([])

    const res = await checkMemberDuplicates(buildFormPayload())
    if (!res.ok) {
      setErrors((e) => ({ ...e, ...res.fieldErrors }))
      setStatus('error')
      setMessage(res.message ?? 'Please review the highlighted fields.')
      return
    }
    if (res.duplicates && res.duplicates.length > 0 && !confirmDuplicate) {
      setDuplicates(res.duplicates)
      setStatus('duplicate')
      return
    }
    await registerNow(false)
  }

  async function registerNow(forceDuplicate: boolean) {
    if (uploadingRef.current) return
    uploadingRef.current = true
    setStatus('uploading')
    setMessage('')
    setDuplicates([])

    const memberUuid = crypto.randomUUID()
    const form = buildFormPayload()
    const token = await getAccessToken()

    const docs: MemberDocInput[] = []

    try {
      for (const type of DOC_ORDER) {
        const file = files[type]
        if (!file) continue
        const path = documentFilePath(memberUuid, type, file.name)
        setProgress((p) => ({ ...p, [type]: 0 }))
        const up = await uploadFileWithProgress(path, file, token, (pct) => {
          setProgress((prev) => ({ ...prev, [type]: pct }))
        })
        if (!up.ok) {
          setStatus('error')
          setMessage(`Could not upload ${DOC_LABELS[type].toLowerCase()} document. ${up.error}`)
          return
        }
        docs.push({
          document_type: type,
          file_name: file.name,
          file_path: up.path,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
        })
      }

      const result = await createMember({
        member_uuid: memberUuid,
        confirmDuplicate: forceDuplicate || confirmDuplicate,
        documents: docs,
        form,
      })

      if (result.status === 'success') {
        setMemberId(result.memberId ?? '')
        setStatus('success')
        return
      }
      if (result.status === 'duplicate') {
        setDuplicates(result.duplicates ?? [])
        setStatus('duplicate')
        return
      }
      setErrors((e) => ({ ...e, ...result.fieldErrors }))
      setStatus('error')
      setMessage(result.message ?? 'Could not register the member. Please try again.')
    } finally {
      uploadingRef.current = false
      setProgress({})
    }
  }

  function resetForm() {
    setValues(initialValues)
    setErrors({})
    setFiles({})
    setFileErrors({})
    setProgress({})
    setMessage('')
    setDuplicates([])
    setMemberId('')
    setConfirmDuplicate(false)
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Member registered successfully.</h2>
        <p className="mt-2 text-sm text-muted-foreground">The member has been added to the Namma Avadi database.</p>

        <div className="mt-6 rounded-xl border bg-slate-50 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Member ID</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-primary">{memberId}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              navigator.clipboard?.writeText(memberId)
              setMessage('Member ID copied!')
            }}
          >
            Copy Member ID
          </button>
          <Link href={`/admin/members/${memberId}`} className="btn btn-outline">
            View Member Profile
          </Link>
          <button type="button" className="btn btn-ghost" onClick={resetForm}>
            Register another member
          </button>
        </div>
        {message === 'Member ID copied!' && (
          <p className="mt-3 text-sm text-success">Member ID copied!</p>
        )}
      </div>
    )
  }

  const inputCls = (hasError: boolean) => cn('input', hasError && 'border-danger focus:border-danger')

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">TVK Member Registration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register a TVK member in Avadi · Wards 1–7
        </p>
      </div>

      {status === 'duplicate' && duplicates && duplicates.length > 0 && (
        <div className="card border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">Possible existing member found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The mobile, Aadhaar, or Voter ID may already be registered. Review before proceeding.
              </p>
              <ul className="mt-3 space-y-2">
                {duplicates.map((d) => (
                  <li key={d.member_id} className="rounded-lg border bg-card px-3 py-2 text-sm">
                    <span className="font-semibold tabular-nums">{d.member_id}</span> — {d.full_name} · Ward {d.ward_number} · {d.mobile}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => registerNow(true)}
                  disabled={uploadingRef.current}
                >
                  Register anyway
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setStatus('idle')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && message && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {message}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="space-y-6"
        noValidate
      >
        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <h2 className="text-base font-semibold">Personal Details</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="full_name" label="Full Name *" error={errors.full_name}>
              <input id="full_name" className={inputCls(!!errors.full_name)} placeholder="e.g. Murugan K" value={values.full_name} onChange={(e) => setField('full_name', e.target.value)} />
            </Field>
            <Field id="father_name" label="Father's Name *" error={errors.father_name}>
              <input id="father_name" className={inputCls(!!errors.father_name)} placeholder="e.g. Kannan M" value={values.father_name} onChange={(e) => setField('father_name', e.target.value)} />
            </Field>
            <Field id="mobile" label="Mobile Number *" error={errors.mobile}>
              <input id="mobile" inputMode="numeric" maxLength={10} className={inputCls(!!errors.mobile)} placeholder="10-digit mobile" value={values.mobile} onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </Field>
            <Field id="date_of_birth" label="Date of Birth *" error={errors.date_of_birth}>
              <input id="date_of_birth" type="date" max={new Date().toISOString().split('T')[0]} className={inputCls(!!errors.date_of_birth)} value={values.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
            </Field>
            <Field id="email" label="Email *" error={errors.email}>
              <input id="email" type="email" className={inputCls(!!errors.email)} placeholder="name@example.com" value={values.email} onChange={(e) => setField('email', e.target.value)} />
            </Field>
            <Field id="address" label="Address *" error={errors.address} className="sm:col-span-2">
              <textarea id="address" rows={2} className={cn(inputCls(!!errors.address), 'resize-none')} placeholder="House no, street, area, Avadi, Chennai" value={values.address} onChange={(e) => setField('address', e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            <h2 className="text-base font-semibold">Identity</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="aadhaar_number" label="Aadhaar Number *" error={errors.aadhaar_number}>
              <input id="aadhaar_number" inputMode="numeric" maxLength={12} className={inputCls(!!errors.aadhaar_number)} placeholder="12-digit Aadhaar" value={values.aadhaar_number} onChange={(e) => setField('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))} />
            </Field>
            <Field id="voter_id" label="Voter ID *" error={errors.voter_id}>
              <input id="voter_id" className={inputCls(!!errors.voter_id)} placeholder="e.g. ABC1234567" value={values.voter_id} onChange={(e) => setField('voter_id', e.target.value.toUpperCase())} />
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
            <h2 className="text-base font-semibold">Ward</h2>
          </div>
          <Field id="ward_number" label="Ward *" error={errors.ward_number}>
            <select id="ward_number" className={inputCls(!!errors.ward_number)} value={values.ward_number} onChange={(e) => setField('ward_number', e.target.value)}>
              <option value="">Select ward…</option>
              {wards.map((w) => (
                <option key={w.ward_number} value={w.ward_number}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
            <h2 className="text-base font-semibold">Documents</h2>
            <span className="ml-auto text-xs text-muted-foreground">Required · max 5 MB each</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DOC_ORDER.map((type) => {
              const file = files[type]
              const pct = progress[type]
              return (
                <div key={type} className="rounded-xl border p-4">
                  <p className="text-sm font-medium">{DOC_LABELS[type]}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {type === 'PHOTO' ? 'JPG / JPEG / PNG' : 'JPG / JPEG / PNG / PDF'}
                  </p>
                  <label
                    htmlFor={`doc-${type}`}
                    className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {file ? (
                      <>
                        <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="max-w-[180px] truncate">{file.name}</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                        </svg>
                        Choose file
                      </>
                    )}
                  </label>
                  <input
                    id={`doc-${type}`}
                    type="file"
                    accept={DOC_TYPE_ACCEPTS[type]}
                    className="hidden"
                    onChange={(e) => handleFile(type, e.target.files?.[0] ?? null)}
                  />
                  {file && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-danger hover:underline"
                      onClick={() => handleFile(type, null)}
                    >
                      Remove
                    </button>
                  )}
                  {pct !== undefined && status === 'uploading' && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Uploading {pct}%</p>
                    </div>
                  )}
                  {fileErrors[type] && <p className="mt-2 text-xs text-danger">{fileErrors[type]}</p>}
                  {errors[`doc-${type}`] && !file && (
                    <p className="mt-2 text-xs text-danger">{errors[`doc-${type}`]}</p>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            All four documents are required. They are uploaded securely and stored in a private bucket.
          </p>
        </section>

        <button
          type="submit"
          disabled={status === 'busy' || status === 'uploading' || uploadingRef.current}
          className="btn btn-primary w-full py-3 text-base"
        >
          {status === 'busy' || status === 'uploading' ? 'Registering…' : 'Register Member'}
        </button>
      </form>
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
