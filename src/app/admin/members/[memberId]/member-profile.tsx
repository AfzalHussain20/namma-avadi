'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { MemberRow, WardRow } from '@/lib/members/queries'
import type { DocumentRow } from '@/lib/members/queries'
import { deleteMember, updateMember } from '@/lib/members/actions'
import { BLOOD_GROUPS, CASTE_CATEGORIES, PLACES, RELIGIONS } from '@/lib/constants'
import { getT, type DictKey, type Lang } from '@/lib/i18n'
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
  isValidAadhaar,
  isValidEmail,
  isValidMobile,
  isValidVoterId,
  isFutureDate,
} from '@/lib/utils'
import type { DocumentType } from '@/lib/supabase/types'

type DocWithUrl = DocumentRow & { signedUrl: string | null }

const DOC_TYPES: DocumentType[] = ['AADHAAR', 'AADHAAR_BACK', 'VOTER_ID', 'TVK_ID', 'PHOTO']

const DOC_LABEL_KEYS: Record<DocumentType, DictKey> = {
  AADHAAR: 'aadhaarDoc',
  AADHAAR_BACK: 'aadhaarBackDoc',
  VOTER_ID: 'voterIdDoc',
  TVK_ID: 'tvkIdDoc',
  PHOTO: 'photoDoc',
}

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
  lang,
}: {
  member: MemberRow
  documents: DocWithUrl[]
  wards: WardRow[]
  editingInitial: boolean
  lang: Lang
}) {
  const t = getT(lang)
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
    place: member.place,
    ward_number: String(member.ward_number),
    religion: member.religion,
    community: member.community,
    caste_category: member.caste_category,
    occupation: member.occupation,
    blood_group: member.blood_group,
  })
  const [errors, setErrors] = useState<Record<string, DictKey>>({})
  const [newFiles, setNewFiles] = useState<Partial<Record<DocumentType, File>>>({})
  const [fileErrors, setFileErrors] = useState<Partial<Record<DocumentType, string>>>({})
  const [removedDocs, setRemovedDocs] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<Partial<Record<DocumentType, number>>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function setField(key: keyof typeof form, value: string) {
    if (key === 'place') {
      // The ward list depends on the place — reset the ward selection.
      setForm((f) => ({ ...f, place: value, ward_number: '' }))
      setErrors((e) => {
        const n = { ...e }
        delete n.place
        delete n.ward_number
        return n
      })
      return
    }
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      const n = { ...e }
      delete n[key]
      return n
    })
  }

  const errText = (key: string): string | undefined =>
    errors[key] ? t(errors[key]) : undefined

  function validate(): Partial<Record<string, string>> {
    const e: Record<string, DictKey> = {}
    if (!form.full_name.trim()) e.full_name = 'errFullName'
    if (!form.father_name.trim()) e.father_name = 'errFatherName'
    if (!isValidMobile(form.mobile.trim())) e.mobile = 'errMobile'
    if (!form.date_of_birth) e.date_of_birth = 'errDobRequired'
    else if (isFutureDate(form.date_of_birth)) e.date_of_birth = 'errDobFuture'
    if (!form.email.trim()) e.email = 'errEmailRequired'
    else if (!isValidEmail(form.email.trim())) e.email = 'errEmailInvalid'
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'errAddress'
    if (!isValidAadhaar(form.aadhaar_number.replace(/\s/g, ''))) e.aadhaar_number = 'errAadhaarInvalid'
    if (!form.voter_id.trim()) e.voter_id = 'errVoterRequired'
    else if (!isValidVoterId(form.voter_id.trim().toUpperCase())) e.voter_id = 'errVoterInvalid'

    const place = PLACES.find((p) => p.value === form.place)
    if (!place) e.place = 'errPlaceRequired'
    const wardNum = parseInt(form.ward_number, 10)
    if (!place || !Number.isInteger(wardNum) || wardNum < 1 || wardNum > place.maxWard) {
      e.ward_number = 'errWardRange'
    }
    if (!form.religion) e.religion = 'errReligionRequired'
    if (!form.community.trim()) e.community = 'errCommunityRequired'
    if (!form.caste_category) e.caste_category = 'errCasteRequired'
    if (!form.occupation.trim()) e.occupation = 'errOccupationRequired'
    if (!form.blood_group) e.blood_group = 'errBloodRequired'
    setErrors(e)
    return e
  }

  function focusFirstError(errs: Record<string, unknown>) {
    const ids: Record<string, string> = {
      full_name: 'e-full_name',
      father_name: 'e-father_name',
      mobile: 'e-mobile',
      date_of_birth: 'e-dob',
      email: 'e-email',
      address: 'e-address',
      aadhaar_number: 'e-aadhaar',
      voter_id: 'e-voter',
      place: 'e-place',
      ward_number: 'e-ward',
      religion: 'e-religion',
      community: 'e-community',
      caste_category: 'e-caste',
      occupation: 'e-occupation',
      blood_group: 'e-blood',
    }
    const key = Object.keys(ids).find((k) => errs[k])
    if (!key) return
    const el = document.getElementById(ids[key])
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (el instanceof HTMLElement) el.focus({ preventScroll: true })
  }

  function validateFile(type: DocumentType, file: File | undefined): string | undefined {
    if (!file) return undefined
    const okTypes = (DOC_TYPE_ACCEPTS[type] || '').replace(/\./g, '').split(',').filter(Boolean)
    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    if (!okTypes.includes(ext)) return `${okTypes.join(', ')} ${t('errFileType')}`
    if (file.size > DOC_TYPE_MAX_BYTES[type]) return t('errFileSize')
    return undefined
  }

  function handleFile(type: DocumentType, file: File | null) {
    const err = validateFile(type, file ?? undefined)
    setFileErrors((fe) => ({ ...fe, [type]: err }))
    setNewFiles((nf) => ({ ...nf, [type]: file ?? undefined }))
  }

  async function save() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setMessage({ type: 'error', text: t('errSubmitRequired') })
      focusFirstError(errs)
      return
    }
    setBusy(true)
    setMessage(null)

    const token = await getAccessToken()
    const added: {
      document_type: DocumentType
      file_name: string
      file_path: string
      file_type: string
      file_size: number
    }[] = []
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
        setMessage({ type: 'error', text: `${up.error}` })
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
        place: form.place,
        ward_number: parseInt(form.ward_number, 10),
        religion: form.religion,
        community: form.community.trim(),
        caste_category: form.caste_category,
        occupation: form.occupation.trim(),
        blood_group: form.blood_group,
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

  const placeLabelOf = (value: string): string => {
    const p = PLACES.find((x) => x.value === value)
    return p ? (lang === 'ta' ? p.ta : p.en) : value
  }
  const religionLabelOf = (value: string): string => {
    const r = RELIGIONS.find((x) => x.value === value)
    return r ? (lang === 'ta' ? r.ta : r.en) : value
  }
  const casteLabelOf = (value: string): string => {
    const c = CASTE_CATEGORIES.find((x) => x.value === value)
    return c ? (lang === 'ta' ? c.ta : c.en) : value
  }

  if (!editing) {
    const tvkIdDoc = documents.find((d) => d.document_type === 'TVK_ID')
    const docLabelOf = (type: DocumentType): string => t(DOC_LABEL_KEYS[type])

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
            {t('backToMembers')}
          </Link>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
              {t('edit')}
            </button>
            {!confirmDelete ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                {t('delete')}
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm">
                <span className="text-danger">
                  {t('permanentlyDeleteQ')} {member.member_id}?
                </span>
                <button type="button" className="font-semibold text-danger hover:underline" onClick={handleDelete} disabled={busy}>
                  {t('confirm')}
                </button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => setConfirmDelete(false)}>
                  {t('cancel')}
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title={t('personalDetails')}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label={t('fullName')} value={member.full_name} />
              <DetailRow label={t('fatherName')} value={member.father_name} />
              <DetailRow label={t('dateOfBirth')} value={formatDate(member.date_of_birth)} />
              <DetailRow label={t('mobileNumber')} value={<span className="tabular-nums">{member.mobile}</span>} />
              <DetailRow label={t('email')} value={member.email ?? '—'} />
              <DetailRow label={t('registeredOn')} value={formatDate(member.created_at)} />
            </dl>
          </SectionCard>

          <SectionCard title={t('locationSection')}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label={t('place')} value={placeLabelOf(member.place)} />
              <DetailRow
                label={t('ward')}
                value={`${lang === 'ta' ? 'வார்டு' : 'Ward'} ${member.ward_number}`}
              />
              <div className="sm:col-span-2">
                <DetailRow label={t('address')} value={member.address} />
              </div>
            </dl>
          </SectionCard>

          <SectionCard title={t('stepCommunity')}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label={t('religion')} value={religionLabelOf(member.religion)} />
              <DetailRow label={t('community')} value={member.community} />
              <DetailRow label={t('casteCategory')} value={casteLabelOf(member.caste_category)} />
              <DetailRow label={t('occupation')} value={member.occupation} />
              <DetailRow label={t('bloodGroup')} value={<span className="tabular-nums">{member.blood_group}</span>} />
            </dl>
          </SectionCard>

          <SectionCard title={t('identitySection')}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label={t('aadhaarNumber')} value={<span className="tabular-nums">{maskAadhaar(member.aadhaar_number)}</span>} />
              <DetailRow label={t('voterId')} value={<span className="tabular-nums">{member.voter_id ?? '—'}</span>} />
              <DetailRow label={t('tvkIdDoc')} value={tvkIdDoc ? t('uploaded') : '—'} />
            </dl>
          </SectionCard>

          <SectionCard title={t('documentsSection')}>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noDocsYet')}</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{docLabelOf(doc.document_type)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.file_name} · {formatBytes(doc.file_size)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {doc.signedUrl && (
                        <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          {t('view')}
                        </a>
                      )}
                      {doc.signedUrl && (
                        <a href={doc.signedUrl} download={doc.file_name} className="btn btn-ghost btn-sm">
                          {t('download')}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{t('docsPrivateNote')}</p>
          </SectionCard>
        </div>
      </div>
    )
  }

  // ---- Edit mode ----
  const inputCls = (hasError: boolean) => cn('input', hasError && 'border-danger focus:border-danger')
  const selectedPlace = PLACES.find((p) => p.value === form.place)
  const wardsForPlace = wards.filter((w) => w.place === form.place)

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
        <h2 className="text-lg font-semibold">{t('editMember')}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
          {t('cancel')}
        </button>
      </div>

      <section className="card space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="e-full_name" className="label">{t('fullName')}</label>
            <input id="e-full_name" className={inputCls(!!errors.full_name)} value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
            {errors.full_name && <p className="mt-1 text-xs text-danger">{errText('full_name')}</p>}
          </div>
          <div>
            <label htmlFor="e-father_name" className="label">{t('fatherName')}</label>
            <input id="e-father_name" className={inputCls(!!errors.father_name)} value={form.father_name} onChange={(e) => setField('father_name', e.target.value)} />
            {errors.father_name && <p className="mt-1 text-xs text-danger">{errText('father_name')}</p>}
          </div>
          <div>
            <label htmlFor="e-mobile" className="label">{t('mobileNumber')}</label>
            <input id="e-mobile" inputMode="numeric" maxLength={10} className={inputCls(!!errors.mobile)} value={form.mobile} onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            {errors.mobile && <p className="mt-1 text-xs text-danger">{errText('mobile')}</p>}
          </div>
          <div>
            <label htmlFor="e-dob" className="label">{t('dateOfBirth')}</label>
            <input id="e-dob" type="date" max={new Date().toISOString().split('T')[0]} className={inputCls(!!errors.date_of_birth)} value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
            {errors.date_of_birth && <p className="mt-1 text-xs text-danger">{errText('date_of_birth')}</p>}
          </div>
          <div>
            <label htmlFor="e-email" className="label">{t('email')}</label>
            <input id="e-email" type="email" className={inputCls(!!errors.email)} value={form.email} onChange={(e) => setField('email', e.target.value)} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errText('email')}</p>}
          </div>
          <div>
            <label htmlFor="e-place" className="label">{t('place')}</label>
            <select id="e-place" className={inputCls(!!errors.place)} value={form.place} onChange={(e) => setField('place', e.target.value)}>
              <option value="">{t('selectPlace')}</option>
              {PLACES.map((p) => (
                <option key={p.value} value={p.value}>{lang === 'ta' ? p.ta : p.en}</option>
              ))}
            </select>
            {errors.place && <p className="mt-1 text-xs text-danger">{errText('place')}</p>}
          </div>
          <div>
            <label htmlFor="e-ward" className="label">{t('ward')}</label>
            <select
              id="e-ward"
              className={inputCls(!!errors.ward_number)}
              value={form.ward_number}
              onChange={(e) => setField('ward_number', e.target.value)}
              disabled={!selectedPlace}
            >
              <option value="">{t('selectWard')}</option>
              {wardsForPlace.map((w) => (
                <option key={`${w.place}-${w.ward_number}`} value={w.ward_number}>
                  {`${lang === 'ta' ? 'வார்டு' : 'Ward'} ${w.ward_number}`}
                </option>
              ))}
            </select>
            {errors.ward_number && <p className="mt-1 text-xs text-danger">{errText('ward_number')}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="e-address" className="label">{t('address')}</label>
            <textarea id="e-address" rows={2} className={cn(inputCls(!!errors.address), 'resize-none')} value={form.address} onChange={(e) => setField('address', e.target.value)} />
            {errors.address && <p className="mt-1 text-xs text-danger">{errText('address')}</p>}
          </div>
          <div>
            <label htmlFor="e-aadhaar" className="label">{t('aadhaarNumber')}</label>
            <input id="e-aadhaar" inputMode="numeric" maxLength={12} className={inputCls(!!errors.aadhaar_number)} value={form.aadhaar_number} onChange={(e) => setField('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))} />
            {errors.aadhaar_number && <p className="mt-1 text-xs text-danger">{errText('aadhaar_number')}</p>}
          </div>
          <div>
            <label htmlFor="e-voter" className="label">{t('voterId')}</label>
            <input id="e-voter" className={inputCls(!!errors.voter_id)} value={form.voter_id} onChange={(e) => setField('voter_id', e.target.value.toUpperCase())} />
            {errors.voter_id && <p className="mt-1 text-xs text-danger">{errText('voter_id')}</p>}
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">{t('stepCommunity')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="e-religion" className="label">{t('religion')}</label>
            <select id="e-religion" className={inputCls(!!errors.religion)} value={form.religion} onChange={(e) => setField('religion', e.target.value)}>
              <option value="">{t('selectReligion')}</option>
              {RELIGIONS.map((r) => (
                <option key={r.value} value={r.value}>{lang === 'ta' ? r.ta : r.en}</option>
              ))}
            </select>
            {errors.religion && <p className="mt-1 text-xs text-danger">{errText('religion')}</p>}
          </div>
          <div>
            <label htmlFor="e-community" className="label">{t('community')}</label>
            <input id="e-community" className={inputCls(!!errors.community)} placeholder={t('phCommunity')} value={form.community} onChange={(e) => setField('community', e.target.value)} />
            {errors.community && <p className="mt-1 text-xs text-danger">{errText('community')}</p>}
          </div>
          <div>
            <label htmlFor="e-caste" className="label">{t('casteCategory')}</label>
            <select id="e-caste" className={inputCls(!!errors.caste_category)} value={form.caste_category} onChange={(e) => setField('caste_category', e.target.value)}>
              <option value="">{t('selectCasteCategory')}</option>
              {CASTE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{lang === 'ta' ? c.ta : c.en}</option>
              ))}
            </select>
            {errors.caste_category && <p className="mt-1 text-xs text-danger">{errText('caste_category')}</p>}
          </div>
          <div>
            <label htmlFor="e-occupation" className="label">{t('occupation')}</label>
            <input id="e-occupation" className={inputCls(!!errors.occupation)} placeholder={t('phOccupation')} value={form.occupation} onChange={(e) => setField('occupation', e.target.value)} />
            {errors.occupation && <p className="mt-1 text-xs text-danger">{errText('occupation')}</p>}
          </div>
          <div>
            <label htmlFor="e-blood" className="label">{t('bloodGroup')}</label>
            <select id="e-blood" className={inputCls(!!errors.blood_group)} value={form.blood_group} onChange={(e) => setField('blood_group', e.target.value)}>
              <option value="">{t('selectBloodGroup')}</option>
              {BLOOD_GROUPS.map((b) => (
                <option key={b.value} value={b.value}>{b.value}</option>
              ))}
            </select>
            {errors.blood_group && <p className="mt-1 text-xs text-danger">{errText('blood_group')}</p>}
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">{t('documentsSection')}</h2>
        {documents.filter((d) => !removedDocs.has(d.id)).length > 0 && (
          <ul className="space-y-2">
            {documents
              .filter((d) => !removedDocs.has(d.id))
              .map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t(DOC_LABEL_KEYS[doc.document_type])}</p>
                    <p className="truncate text-xs text-muted-foreground">{doc.file_name} · {formatBytes(doc.file_size)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">{t('view')}</a>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setRemovedDocs((s) => new Set(s).add(doc.id))}
                    >
                      {t('remove')}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
        <p className="text-sm text-muted-foreground">{t('addReplaceDocs')}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOC_TYPES.map((type) => {
            const file = newFiles[type]
            const pct = progress[type]
            const label = t(DOC_LABEL_KEYS[type])
            return (
              <div key={type} className="rounded-xl border p-4">
                <p className="text-sm font-medium">{label}</p>
                <label htmlFor={`ed-doc-${type}`} className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                  {file ? (
                    <>
                      <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="max-w-[170px] truncate">{file.name}</span>
                    </>
                  ) : (
                    t('uploadNew')
                  )}
                </label>
                <input id={`ed-doc-${type}`} type="file" accept={DOC_TYPE_ACCEPTS[type]} className="hidden" onChange={(e) => handleFile(type, e.target.files?.[0] ?? null)} />
                {file && (
                  <button type="button" className="mt-2 text-xs font-medium text-danger hover:underline" onClick={() => handleFile(type, null)}>{t('remove')}</button>
                )}
                {pct !== undefined && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t('uploading')} {pct}%</p>
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
          {t('cancel')}
        </button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? t('saving') : t('save')}
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
