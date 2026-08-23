'use client'

import { useState } from 'react'
import { PLACES } from '@/lib/constants'
import { getT, type Lang } from '@/lib/i18n'
import type { WardRow } from '@/lib/members/queries'

export default function ExportPanel({ wards, lang }: { wards: WardRow[]; lang: Lang }) {
  const t = getT(lang)
  const [q, setQ] = useState('')
  const [place, setPlace] = useState('')
  const [ward, setWard] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const wardsForPlace = wards.filter((w) => !place || w.place === place)

  function buildUrl(format: 'csv' | 'xls'): string {
    const params = new URLSearchParams({ format })
    if (q.trim()) params.set('q', q.trim())
    if (place) params.set('place', place)
    if (ward) params.set('ward', ward)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return `/api/export?${params.toString()}`
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="x-q" className="label">
            {t('search')}
          </label>
          <input
            id="x-q"
            className="input"
            placeholder={t('searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="x-place" className="label">
            {t('place')}
          </label>
          <select
            id="x-place"
            className="input"
            value={place}
            onChange={(e) => {
              setPlace(e.target.value)
              setWard('')
            }}
          >
            <option value="">{t('allPlaces')}</option>
            {PLACES.map((p) => (
              <option key={p.value} value={p.value}>
                {lang === 'ta' ? p.ta : p.en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="x-ward" className="label">
            {t('ward')}
          </label>
          <select id="x-ward" className="input" value={ward} onChange={(e) => setWard(e.target.value)}>
            <option value="">{t('allWards')}</option>
            {wardsForPlace.map((w) => (
              <option key={`${w.place}-${w.ward_number}`} value={w.ward_number}>
                {`${lang === 'ta' ? 'வார்டு' : 'Ward'} ${w.ward_number}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="x-from" className="label">
            {t('registeredFrom')}
          </label>
          <input id="x-from" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="x-to" className="label">
            {t('registeredTo')}
          </label>
          <input id="x-to" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a href={buildUrl('xls')} className="btn btn-primary">
          {t('exportExcel')}
        </a>
        <a href={buildUrl('csv')} className="btn btn-outline">
          {t('exportCsv')}
        </a>
      </div>
      <p className="text-xs text-muted-foreground">{t('exportsNote')}</p>
    </div>
  )
}
