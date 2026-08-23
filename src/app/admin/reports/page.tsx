import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import { PLACES } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import { getWards } from '@/lib/members/queries'
import { createClient } from '@/lib/supabase/server'
import ExportPanel from './export-panel'

export const metadata: Metadata = { title: 'Reports' }
export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  await requireAdmin()

  const lang = await getLang()
  const t = getT(lang)

  const placeLabel = (value: string): string => {
    const p = PLACES.find((x) => x.value === value)
    return p ? (lang === 'ta' ? p.ta : p.en) : value
  }

  const [supabase, wards] = await Promise.all([createClient(), getWards()])
  const { data: stats, error } = await supabase.rpc('get_dashboard_stats')

  // Group rows by place for the summary table.
  const groups = stats
    ? PLACES.map((p) => ({
        ...p,
        rows: stats.filter((r) => r.place === p.value),
      })).filter((g) => g.rows.length > 0)
    : []

  const total = stats?.reduce((s, r) => s + r.member_count, 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('reports')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('reportsSub')}</p>
      </div>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {t('appName')} — {t('wardSummaryTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t('wardSummarySub')}</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/export/ward-summary?format=xls" className="btn btn-primary btn-sm">
              {t('exportExcel')}
            </a>
            <a href="/api/export/ward-summary?format=csv" className="btn btn-outline btn-sm">
              {t('exportCsv')}
            </a>
          </div>
        </div>

        {error || !stats ? (
          <p className="mt-4 text-sm text-slate-500">{t('unableSummary')}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="th">{t('colPlace')}</th>
                  <th className="th">{t('colWard')}</th>
                  <th className="th text-right">{t('colTotalMembers')}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  group.rows.map((r) => (
                    <tr key={`${r.place}-${r.ward_number}`} className="border-b border-slate-100 last:border-0">
                      <td className="td font-medium">{placeLabel(r.place)}</td>
                      <td className="td">
                        {t('wardN')} {r.ward_number}
                      </td>
                      <td className="td text-right font-semibold tabular-nums">
                        {r.member_count.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ))}
                <tr className="bg-slate-50/70">
                  <td className="td font-bold" colSpan={2}>
                    {t('total')}
                  </td>
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
          <h2 className="text-base font-semibold">{t('memberExportTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('memberExportSub')}</p>
        </div>
        <ExportPanel wards={wards} lang={lang} />
      </section>
    </div>
  )
}
