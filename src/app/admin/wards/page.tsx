import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/dal'
import { PLACES } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Ward Overview' }
export const dynamic = 'force-dynamic'

export default async function WardsPage() {
  await requireAdmin()

  const lang = await getLang()
  const t = getT(lang)

  const placeLabel = (value: string): string => {
    const p = PLACES.find((x) => x.value === value)
    return p ? (lang === 'ta' ? p.ta : p.en) : value
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')

  if (error || !data || data.length === 0) {
    return (
      <div className="card p-8">
        <h2 className="text-base font-semibold">{t('unableWardData')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error?.message || t('unableWardData')}</p>
      </div>
    )
  }

  // Group the flat ward rows by place so each area reads as its own section.
  const groups = PLACES.map((p) => ({
    ...p,
    rows: data.filter((r) => r.place === p.value),
  })).filter((g) => g.rows.length > 0)

  const total = data.reduce((sum, r) => sum + r.member_count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('wardOverview')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('wardsSub')} {total.toLocaleString('en-IN')} {t('totalMembersShort')}
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.value} className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {lang === 'ta' ? group.ta : group.en}
            <span className="ml-2 text-sm font-normal text-slate-400">
              {t('wardN')} 1–{group.maxWard}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.rows.map((row) => (
              <Link
                key={`${row.place}-${row.ward_number}`}
                href={`/admin/members?place=${row.place}&ward=${row.ward_number}`}
                className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('wardN')} {row.ward_number}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 group-hover:text-indigo-600">
                  {row.member_count.toLocaleString('en-IN')}
                </p>
                <p className="mt-1 text-xs text-slate-400">{t('membersUnit')}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="th">{t('colPlace')}</th>
                <th className="th">{t('colWard')}</th>
                <th className="th text-right">{t('colTotalMembers')}</th>
                <th className="th text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={`${row.place}-${row.ward_number}`}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="td font-medium text-slate-900">{placeLabel(row.place)}</td>
                  <td className="td">
                    {t('wardN')} {row.ward_number}
                  </td>
                  <td className="td text-right font-semibold tabular-nums">
                    {row.member_count.toLocaleString('en-IN')}
                  </td>
                  <td className="td">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/members?place=${row.place}&ward=${row.ward_number}`}
                        className="btn btn-outline btn-sm"
                      >
                        {t('viewMembersBtn')}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/70">
                <td className="td font-bold text-slate-900" colSpan={2}>
                  {t('total')}
                </td>
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
