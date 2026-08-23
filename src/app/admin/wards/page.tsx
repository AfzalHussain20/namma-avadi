import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/dal'
import { PLACES } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import { getWardStats, groupWardStatsByPlace } from '@/lib/members/queries'

export const metadata: Metadata = { title: 'Ward Overview' }
export const dynamic = 'force-dynamic'

export default async function WardsPage() {
  await requireAdmin()

  const lang = await getLang()
  const t = getT(lang)

  const stats = await getWardStats()
  const groups = groupWardStatsByPlace(stats.rows)

  const placeLabel = (value: string): string => {
    const p = PLACES.find((x) => x.value === value)
    return p ? (lang === 'ta' ? p.ta : p.en) : value
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('wardOverview')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('wardsSub')} {stats.total.toLocaleString('en-IN')} {t('totalMembersShort')}
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.place} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {placeLabel(group.place)}
              <span className="ml-2 text-sm font-normal text-slate-400">
                {lang === 'ta' ? `வார்டு 1–${group.maxWard}` : `Ward 1–${group.maxWard}`}
              </span>
            </h2>
            <Link
              href={`/admin/members?place=${group.place}`}
              className="text-xs font-semibold text-tvk-red hover:text-tvk-dark-red"
            >
              {t('viewAll')} →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
            {group.rows.map((row) =>
              row.member_count > 0 ? (
                <Link
                  key={`${row.place}-${row.ward_number}`}
                  href={`/admin/members?place=${row.place}&ward=${row.ward_number}`}
                  className="card group p-4 text-center transition-all hover:-translate-y-0.5 hover:border-tvk-yellow hover:shadow-md"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {lang === 'ta' ? `வார்டு ${row.ward_number}` : `Ward ${row.ward_number}`}
                  </p>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 group-hover:text-tvk-red">
                    {row.member_count.toLocaleString('en-IN')}
                  </p>
                </Link>
              ) : (
                <div
                  key={`${row.place}-${row.ward_number}`}
                  className="card p-4 text-center opacity-50"
                  title={t('membersUnit') + ': 0'}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {lang === 'ta' ? `வார்டு ${row.ward_number}` : `Ward ${row.ward_number}`}
                  </p>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-300">0</p>
                </div>
              )
            )}
          </div>
        </section>
      ))}

      {/* Full detail table (desktop only — cards above cover mobile) */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[480px] border-collapse">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="th">{t('colPlace')}</th>
                <th className="th">{t('colWard')}</th>
                <th className="th text-right">{t('colTotalMembers')}</th>
                <th className="th text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.rows
                .filter((r) => r.member_count > 0)
                .map((row) => (
                  <tr
                    key={`${row.place}-${row.ward_number}`}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="td font-medium text-slate-900">{placeLabel(row.place)}</td>
                    <td className="td">
                      {lang === 'ta' ? `வார்டு ${row.ward_number}` : `Ward ${row.ward_number}`}
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
                <td className="td text-right font-bold tabular-nums">{stats.total.toLocaleString('en-IN')}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
