'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { checkMemberDuplicates, createMember } from '@/lib/members/actions'
import type { RegisterResult } from '@/lib/members/actions'
import type { MemberDocInput } from '@/lib/members/types'
import {
  BLOOD_GROUPS,
  CASTE_CATEGORIES,
  PLACES,
  RELIGIONS,
} from '@/lib/constants'
import { getT, type DictKey, type Lang } from '@/lib/i18n'
import LangToggle from '@/components/lang-toggle'
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

type FormValues = {
  full_name: string
  father_name: string
  mobile: string
  date_of_birth: string
  email: string
  address: string
  aadhaar_number: string
  voter_id: string
  place: string
  ward_number: string
  religion: string
  community: string
  caste_category: string
  occupation: string
  blood_group: string
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
  place: '',
  ward_number: '',
  religion: '',
  community: '',
  caste_category: '',
  occupation: '',
  blood_group: '',
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

export default function RegistrationForm({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<string, DictKey | string>>>({})
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
    if (key === 'place') {
      // Wards belong to a place — reset the selection when the place changes.
      setValues((v) => ({ ...v, place: value, ward_number: '' }))
      setErrors((e) => ({ ...e, place: undefined, ward_number: undefined }))
    } else {
      setValues((v) => ({ ...v, [key]: value }))
      setErrors((e) => ({ ...e, [key]: undefined }))
    }
  }

  const errText = (key: string): string | undefined => {
    const v = errors[key]
    return v ? t(v as DictKey) : undefined
  }

  function validate(): boolean {
    const e: Partial<Record<string, DictKey>> = {}
    const v = values
    if (!v.full_name.trim()) e.full_name = 'errFullName'
    if (!v.father_name.trim()) e.father_name = 'errFatherName'
    if (!v.mobile.trim()) e.mobile = 'errMobileRequired'
    else if (!isValidMobile(v.mobile.trim())) e.mobile = 'errMobile'
    if (!v.date_of_birth) e.date_of_birth = 'errDobRequired'
    else if (isFutureDate(v.date_of_birth)) e.date_of_birth = 'errDobFuture'
    if (!v.email.trim()) e.email = 'errEmailRequired'
    else if (!isValidEmail(v.email.trim())) e.email = 'errEmailInvalid'
    if (!v.address.trim() || v.address.trim().length < 5) e.address = 'errAddress'
    const aadhaar = v.aadhaar_number.replace(/\s/g, '')
    if (!aadhaar) e.aadhaar_number = 'errAadhaarRequired'
    else if (!isValidAadhaar(aadhaar)) e.aadhaar_number = 'errAadhaarInvalid'
    const voter = v.voter_id.trim().toUpperCase()
    if (!voter) e.voter_id = 'errVoterRequired'
    else if (!isValidVoterId(voter)) e.voter_id = 'errVoterInvalid'
    const place = PLACES.find((p) => p.value === v.place)
    if (!place) e.place = 'errPlaceRequired'
    const wardNum = parseInt(v.ward_number, 10)
    if (!place || !Number.isInteger(wardNum) || wardNum < 1 || wardNum > place.maxWard) {
      e.ward_number = 'errWardRange'
    }
    if (!v.religion) e.religion = 'errReligionRequired'
    if (!v.community.trim()) e.community = 'errCommunityRequired'
    if (!v.caste_category) e.caste_category = 'errCasteRequired'
    if (!v.occupation.trim()) e.occupation = 'errOccupationRequired'
    if (!v.blood_group) e.blood_group = 'errBloodRequired'
    for (const type of DOC_ORDER) {
      if (!files[type]) e[`doc-${type}`] = 'errDocRequired'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateFile(type: DocumentType, file: File | undefined): string | undefined {
    if (!file) return undefined
    const okTypes = (DOC_TYPE_ACCEPTS[type] || '').replace(/\./g, '').split(',').filter(Boolean)
    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    if (!okTypes.includes(ext)) {
      return `${okTypes.join(', ')} ${t('errFileType')}`
    }
    if (file.size > DOC_TYPE_MAX_BYTES[type]) {
      return t('errFileSize')
    }
    return undefined
  }

  function handleFile(type: DocumentType, file: File | null) {
    const err = validateFile(type, file ?? undefined)
    setFileErrors((fe) => ({ ...fe, [type]: err }))
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
      place: values.place,
      ward_number: parseInt(values.ward_number, 10),
      religion: values.religion,
      community: values.community.trim(),
      caste_category: values.caste_category,
      occupation: values.occupation.trim(),
      blood_group: values.blood_group,
    }
  }

  async function handleSubmit() {
    if (uploadingRef.current) return
    if (!validate()) {
      setStatus('error')
      setMessage(t('errReviewFields'))
      return
    }
    setStatus('busy')
    setMessage('')
    setDuplicates([])

    const res = await checkMemberDuplicates(buildFormPayload())
    if (!res.ok) {
      setErrors((e) => ({ ...e, ...res.fieldErrors }))
      setStatus('error')
      setMessage(res.message ? t('errReviewFields') : t('errReviewFields'))
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
          setMessage(`${up.error}`)
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
      setMessage(result.message ? t('errReviewFields') : '')
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
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('successTitle')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('successBody')}</p>

        <div className="mt-6 rounded-xl border bg-slate-50 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('memberId')}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-primary">{memberId}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              navigator.clipboard?.writeText(memberId)
              setMessage(t('memberIdCopied'))
            }}
          >
            {t('copyMemberId')}
          </button>
          <Link href={`/admin/members/${memberId}`} className="btn btn-outline">
            {t('viewMemberProfile')}
          </Link>
          <button type="button" className="btn btn-ghost" onClick={resetForm}>
            {t('registerAnother')}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-success">{message}</p>}
      </div>
    )
  }

  const inputCls = (hasError: boolean) => cn('input', hasError && 'border-danger focus:border-danger')
  const selectedPlace = PLACES.find((p) => p.value === values.place)
  const wardOptions = selectedPlace
    ? Array.from({ length: selectedPlace.maxWard }, (_, i) => i + 1)
    : []

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <LangToggle lang={lang} />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('regTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('regSubtitle')}</p>
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
              <h3 className="font-semibold text-foreground">{t('duplicateTitle')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('duplicateBody')}</p>
              <ul className="mt-3 space-y-2">
                {duplicates.map((d) => (
                  <li key={d.member_id} className="rounded-lg border bg-card px-3 py-2 text-sm">
                    <span className="font-semibold tabular-nums">{d.member_id}</span> — {d.full_name} · {t('wardN')} {d.ward_number} · {d.mobile}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => registerNow(true)}
                >
                  {t('registerAnyway')}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setStatus('idle')}>
                  {t('cancel')}
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
            <h2 className="text-base font-semibold">{t('stepPersonal')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="full_name" label={t('fullName')} error={errText('full_name')}>
              <input id="full_name" className={inputCls(!!errors.full_name)} placeholder={t('phFullName')} value={values.full_name} onChange={(e) => setField('full_name', e.target.value)} />
            </Field>
            <Field id="father_name" label={t('fatherName')} error={errText('father_name')}>
              <input id="father_name" className={inputCls(!!errors.father_name)} placeholder={t('phFatherName')} value={values.father_name} onChange={(e) => setField('father_name', e.target.value)} />
            </Field>
            <Field id="mobile" label={t('mobileNumber')} error={errText('mobile')}>
              <input id="mobile" inputMode="numeric" maxLength={10} className={inputCls(!!errors.mobile)} placeholder={t('phMobile')} value={values.mobile} onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </Field>
            <Field id="date_of_birth" label={t('dateOfBirth')} error={errText('date_of_birth')}>
              <input id="date_of_birth" type="date" max={new Date().toISOString().split('T')[0]} className={inputCls(!!errors.date_of_birth)} value={values.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
            </Field>
            <Field id="email" label={t('email')} error={errText('email')}>
              <input id="email" type="email" className={inputCls(!!errors.email)} placeholder={t('phEmail')} value={values.email} onChange={(e) => setField('email', e.target.value)} />
            </Field>
            <Field id="address" label={t('address')} error={errText('address')} className="sm:col-span-2">
              <textarea id="address" rows={2} className={cn(inputCls(!!errors.address), 'resize-none')} placeholder={t('phAddress')} value={values.address} onChange={(e) => setField('address', e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            <h2 className="text-base font-semibold">{t('stepIdentity')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="aadhaar_number" label={t('aadhaarNumber')} error={errText('aadhaar_number')}>
              <input id="aadhaar_number" inputMode="numeric" maxLength={12} className={inputCls(!!errors.aadhaar_number)} placeholder={t('phAadhaar')} value={values.aadhaar_number} onChange={(e) => setField('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))} />
            </Field>
            <Field id="voter_id" label={t('voterId')} error={errText('voter_id')}>
              <input id="voter_id" className={inputCls(!!errors.voter_id)} placeholder={t('phVoterId')} value={values.voter_id} onChange={(e) => setField('voter_id', e.target.value.toUpperCase())} />
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
            <h2 className="text-base font-semibold">{t('stepPlaceWard')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="place" label={t('place')} error={errText('place')}>
              <select id="place" className={inputCls(!!errors.place)} value={values.place} onChange={(e) => setField('place', e.target.value)}>
                <option value="">{t('selectPlace')}</option>
                {PLACES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {lang === 'ta' ? p.ta : p.en}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="ward_number" label={t('ward')} error={errText('ward_number')}>
              <select
                id="ward_number"
                className={inputCls(!!errors.ward_number)}
                value={values.ward_number}
                onChange={(e) => setField('ward_number', e.target.value)}
                disabled={!selectedPlace}
              >
                <option value="">{t('selectWard')}</option>
                {wardOptions.map((n) => (
                  <option key={n} value={n}>
                    {`${lang === 'ta' ? 'வார்டு' : 'Ward'} ${n}`}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
            <h2 className="text-base font-semibold">{t('stepCommunity')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="religion" label={t('religion')} error={errText('religion')}>
              <select id="religion" className={inputCls(!!errors.religion)} value={values.religion} onChange={(e) => setField('religion', e.target.value)}>
                <option value="">{t('selectReligion')}</option>
                {RELIGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {lang === 'ta' ? r.ta : r.en}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="community" label={t('community')} error={errText('community')}>
              <input id="community" className={inputCls(!!errors.community)} placeholder={t('phCommunity')} value={values.community} onChange={(e) => setField('community', e.target.value)} />
            </Field>
            <Field id="caste_category" label={t('casteCategory')} error={errText('caste_category')}>
              <select id="caste_category" className={inputCls(!!errors.caste_category)} value={values.caste_category} onChange={(e) => setField('caste_category', e.target.value)}>
                <option value="">{t('selectCasteCategory')}</option>
                {CASTE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {lang === 'ta' ? c.ta : c.en}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="occupation" label={t('occupation')} error={errText('occupation')}>
              <input id="occupation" className={inputCls(!!errors.occupation)} placeholder={t('phOccupation')} value={values.occupation} onChange={(e) => setField('occupation', e.target.value)} />
            </Field>
            <Field id="blood_group" label={t('bloodGroup')} error={errText('blood_group')}>
              <select id="blood_group" className={inputCls(!!errors.blood_group)} value={values.blood_group} onChange={(e) => setField('blood_group', e.target.value)}>
                <option value="">{t('selectBloodGroup')}</option>
                {BLOOD_GROUPS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.value}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">5</span>
            <h2 className="text-base font-semibold">{t('stepDocuments')}</h2>
            <span className="ml-auto text-xs text-muted-foreground">{t('docsNoteBadge')}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DOC_ORDER.map((type) => {
              const file = files[type]
              const pct = progress[type]
              const docLabel =
                type === 'AADHAAR' ? t('aadhaarDoc') : type === 'VOTER_ID' ? t('voterIdDoc') : type === 'TVK_ID' ? t('tvkIdDoc') : t('photoDoc')
              return (
                <div key={type} className="rounded-xl border p-4">
                  <p className="text-sm font-medium">{docLabel}</p>
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
                        {t('chooseFile')}
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
                      {t('remove')}
                    </button>
                  )}
                  {pct !== undefined && status === 'uploading' && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{t('uploading')} {pct}%</p>
                    </div>
                  )}
                  {fileErrors[type] && <p className="mt-2 text-xs text-danger">{fileErrors[type]}</p>}
                  {!file && !fileErrors[type] && errors[`doc-${type}`] && (
                    <p className="mt-2 text-xs text-danger">{t('errDocRequired')}</p>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">{t('docsNoteFooter')}</p>
        </section>

        <button
          type="submit"
          disabled={status === 'busy' || status === 'uploading'}
          className="btn btn-primary w-full py-3 text-base"
        >
          {status === 'busy' || status === 'uploading' ? t('registering') : t('registerMember')}
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
