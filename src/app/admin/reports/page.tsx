import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import { getWards } from '@/lib/members/queries'
import { createClient } from '@/lib/supabase/server'
import ExportPanel from './export-panel'

export const metadata: Metadata = { title: 'Reports' }
export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  await requireAdmin()

  const [supabase, wards] = await Promise.all([createClient(), getWards()])
  const { data: stats, error } = await supabase.rpc('get_dashboard_stats')

  const total = stats?.reduce((s, r) => s + r.member_count, 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports &amp; Export</h1>
        <p className="mt-1 text-sm text-slate-500">
          Export member data and ward summaries. Aadhaar numbers are never exported.
        </p>
      </div>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Namma Avadi — Ward Member Summary</h2>
            <p className="mt-1 text-sm text-slate-500">Ward 1–7 member counts with totals.</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/export/ward-summary?format=xls" className="btn btn-primary btn-sm">
              Export Excel
            </a>
            <a href="/api/export/ward-summary?format=csv" className="btn btn-outline btn-sm">
              Export CSV
            </a>
          </div>
        </div>

        {error || !stats ? (
          <p className="mt-4 text-sm text-slate-500">Unable to load ward summary.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="th">Ward</th>
                  <th className="th text-right">Total Members</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((r) => (
                  <tr key={r.ward_number} className="border-b border-slate-100 last:border-0">
                    <td className="td font-medium">{r.ward_name}</td>
                    <td className="td text-right font-semibold tabular-nums">
                      {r.member_count.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/70">
                  <td className="td font-bold">Total</td>
                  <td className="td text-right font-bold tabular-nums">
                    {total.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold">Member Data Export</h2>
          <p className="mt-1 text-sm text-slate-500">
            Export all members, a selected ward, or a filtered set. Aadhaar numbers are never included.
          </p>
        </div>
        <ExportPanel wards={wards} />
      </section>
    </div>
  )
}
