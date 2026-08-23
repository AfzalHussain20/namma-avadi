'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PLACES } from '@/lib/constants'
import { getT, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { WardRow } from '@/lib/members/queries'

function asString(value: string | string[] | null | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function weekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return isoDate(d)
}

function monthStart(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return isoDate(d)
}

export default function MemberFilters({ wards, lang }: { wards: WardRow[]; lang: Lang }) {
  const t = getT(lang)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(asString(searchParams.get('q')))
  const [place, setPlace] = useState(asString(searchParams.get('place')))
  const [ward, setWard] = useState(asString(searchParams.get('ward')))
  const [from, setFrom] = useState(asString(searchParams.get('from')))
  const [to, setTo] = useState(asString(searchParams.get('to')))

  const RANGES = [
    { key: 'all', label: t('allTime') },
    { key: 'week', label: t('thisWeek') },
    { key: 'month', label: t('thisMonth') },
  ]

  const activeRange = RANGES.find(
    (r) =>
      (r.key === 'all' && !from && !to) ||
      (r.key === 'week' && from === weekStart() && !to) ||
      (r.key === 'month' && from === monthStart() && !to)
  )?.key

  const wardsForPlace = wards.filter((w) => !place || w.place === place)

  function setPlaceAndResetWard(value: string) {
    setPlace(value)
    // The ward list depends on the place, so drop the ward selection.
    setWard('')
  }

  function apply(overrides?: { from?: string; to?: string }) {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (place) params.set('place', place)
    if (ward) params.set('ward', ward)
    const f = overrides?.from !== undefined ? overrides.from : from
    const tv = overrides?.to !== undefined ? overrides.to : to
    if (f) params.set('from', f)
    if (tv) params.set('to', tv)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function setRange(key: string) {
    if (key === 'all') {
      setFrom('')
      setTo('')
      apply({ from: '', to: '' })
    } else if (key === 'week') {
      const f = weekStart()
      setFrom(f)
      setTo('')
      apply({ from: f, to: '' })
    } else {
      const f = monthStart()
      setFrom(f)
      setTo('')
      apply({ from: f, to: '' })
    }
  }

  function clear() {
    setQ('')
    setPlace('')
    setWard('')
    setFrom('')
    setTo('')
    router.push(pathname)
  }

  const hasFilters = q || place || ward || from || to

  return (
    <div className="card space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="label">
            {t('search')}
          </label>
          <input
            id="q"
            className="input"
            placeholder={t('searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
          />
        </div>

        <div>
          <label htmlFor="f-place" className="label">
            {t('place')}
          </label>
          <select
            id="f-place"
            className="input sm:min-w-40"
            value={place}
            onChange={(e) => setPlaceAndResetWard(e.target.value)}
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
          <label htmlFor="f-ward" className="label">
            {t('ward')}
          </label>
          <select
            id="f-ward"
            className="input sm:min-w-36"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
          >
            <option value="">{t('allWards')}</option>
            {wardsForPlace.map((w) => (
              <option key={`${w.place}-${w.ward_number}`} value={w.ward_number}>
                {`${lang === 'ta' ? 'வார்டு' : 'Ward'} ${w.ward_number}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-from" className="label">
            {t('fromDate')}
          </label>
          <input
            id="f-from"
            type="date"
            className="input sm:min-w-40"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="f-to" className="label">
            {t('toDate')}
          </label>
          <input
            id="f-to"
            type="date"
            className="input sm:min-w-40"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn btn-primary flex-1 sm:flex-none" onClick={() => apply()}>
            {t('apply')}
          </button>
          {hasFilters && (
            <button type="button" className="btn btn-ghost" onClick={clear}>
              {t('clear')}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('quickRange')}</span>
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              activeRange === r.key
                ? 'bg-tvk-red text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
