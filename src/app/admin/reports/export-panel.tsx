'use client'

import { useState } from 'react'
import type { WardRow } from '@/lib/members/queries'

export default function ExportPanel({ wards }: { wards: WardRow[] }) {
  const [q, setQ] = useState('')
  const [ward, setWard] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function buildUrl(format: 'csv' | 'xls'): string {
    const params = new URLSearchParams({ format })
    if (q.trim()) params.set('q', q.trim())
    if (ward) params.set('ward', ward)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return `/api/export?${params.toString()}`
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="x-q" className="label">
            Search
          </label>
          <input
            id="x-q"
            className="input"
            placeholder="Member ID, name, father name, mobile, voter ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="x-ward" className="label">
            Ward
          </label>
          <select id="x-ward" className="input" value={ward} onChange={(e) => setWard(e.target.value)}>
            <option value="">All wards</option>
            {wards.map((w) => (
              <option key={w.ward_number} value={w.ward_number}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="x-from" className="label">
            Registered from
          </label>
          <input id="x-from" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="x-to" className="label">
            Registered to
          </label>
          <input id="x-to" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a href={buildUrl('xls')} className="btn btn-primary">
          Export Excel
        </a>
        <a href={buildUrl('csv')} className="btn btn-outline">
          Export CSV
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        Exports are available only to authorized admins. Exported files contain no Aadhaar numbers.
      </p>
    </div>
  )
}
