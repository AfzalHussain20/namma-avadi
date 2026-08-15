import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Ward Overview' }
export const dynamic = 'force-dynamic'

export default async function WardsPage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')

  if (error || !data || data.length === 0) {
    return (
      <div className="card p-8">
        <h2 className="text-base font-semibold">Unable to load ward data</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || 'No ward data found.'}
        </p>
      </div>
    )
  }

  const total = data.reduce((sum, r) => sum + r.member_count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ward Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Member distribution across Avadi wards 1–7 · {total.toLocaleString('en-IN')} total members
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((row) => (
          <Link
            key={row.ward_number}
            href={`/admin/members?ward=${row.ward_number}`}
            className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.ward_name}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 group-hover:text-indigo-600">
              {row.member_count.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-xs text-slate-400">members</p>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="th">Ward</th>
                <th className="th text-right">Total Members</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.ward_number} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="td font-medium text-slate-900">{row.ward_name}</td>
                  <td className="td text-right font-semibold tabular-nums">{row.member_count.toLocaleString('en-IN')}</td>
                  <td className="td">
                    <div className="flex justify-end">
                      <Link href={`/admin/members?ward=${row.ward_number}`} className="btn btn-outline btn-sm">
                        View members
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/70">
                <td className="td font-bold text-slate-900">Total</td>
                <td className="td text-right font-bold tabular-nums">{total.toLocaleString('en-IN')}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
