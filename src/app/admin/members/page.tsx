import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/dal'
import { PLACES, placeOption } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import { getPhotoThumbUrls, getWards, listMembers } from '@/lib/members/queries'
import { formatDate } from '@/lib/utils'
import MemberFilters from './member-filters'

export const metadata: Metadata = { title: 'Members' }
export const dynamic = 'force-dynamic'

const PER_PAGE = 10

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()

  const lang = await getLang()
  const t = getT(lang)

  const sp = await searchParams
  const q = first(sp.q)
  const place = first(sp.place) || null
  const wardParam = first(sp.ward)
  const ward =
    place && wardParam && (placeOption(place)?.maxWard ?? 0) >= parseInt(wardParam, 10)
      ? parseInt(wardParam, 10)
      : null
  const from = first(sp.from) || null
  const to = first(sp.to) || null
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1)

  const [{ members, total, pages }, wards] = await Promise.all([
    listMembers({ q, place, ward, from, to, page, perPage: PER_PAGE }),
    getWards(),
  ])

  const photoUrls = await getPhotoThumbUrls(members.map((m) => m.id))

  const placeLabel = (value: string): string => {
    const p = PLACES.find((x) => x.value === value)
    return p ? (lang === 'ta' ? p.ta : p.en) : value
  }

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (place) params.set('place', place)
    if (ward) params.set('ward', String(ward))
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const qs = params.toString()
    return qs ? `/admin/members?${qs}` : '/admin/members'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('membersTitle')}</h1>
        <p className="text-sm text-slate-500">{t('membersSub')}</p>
      </div>

      <MemberFilters wards={wards} lang={lang} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-medium text-slate-500">
            {total.toLocaleString('en-IN')} {t('foundCount')}
          </p>
          {total > 0 && (
            <span className="hidden text-xs text-slate-400 sm:inline">{t('newestFirst')}</span>
          )}
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <svg className="h-7 w-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900">{t('noMembersFound')}</p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">{t('noMembersFoundHint')}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="th">{t('colMember')}</th>
                    <th className="th">{t('colName')}</th>
                    <th className="th">{t('colMobile')}</th>
                    <th className="th">{t('colPlace')} / {t('colWard')}</th>
                    <th className="th">{t('colRegistered')}</th>
                    <th className="th text-right">{t('colActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const photo = photoUrls.get(m.id)
                    return (
                      <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                        <td className="td">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700">
                              {photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photo} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span>{m.full_name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="font-semibold tabular-nums text-indigo-600">
                              {m.member_id}
                            </span>
                          </div>
                        </td>
                        <td className="td">
                          <p className="font-semibold text-slate-900">{m.full_name}</p>
                          <p className="text-xs text-slate-500">{m.father_name}</p>
                        </td>
                        <td className="td tabular-nums text-slate-600">{m.mobile}</td>
                        <td className="td">
                          <span className="badge badge-blue">
                            {placeLabel(m.place)} · {t('wardN')} {m.ward_number}
                          </span>
                        </td>
                        <td className="td text-slate-500">{formatDate(m.created_at)}</td>
                        <td className="td">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/members/${m.member_id}`} className="btn btn-outline btn-sm">
                              {t('view')}
                            </Link>
                            <Link href={`/admin/members/${m.member_id}?edit=1`} className="btn btn-ghost btn-sm">
                              {t('edit')}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {members.map((m) => {
                const photo = photoUrls.get(m.id)
                return (
                  <li key={m.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-base font-bold text-indigo-700">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{m.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold tabular-nums text-indigo-600">{m.member_id}</span>
                          <span className="badge badge-blue">
                            {placeLabel(m.place)} · {t('wardN')} {m.ward_number}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate font-semibold text-slate-900">{m.full_name}</p>
                        <p className="truncate text-sm text-slate-500">{m.father_name}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                          <span className="tabular-nums">{m.mobile}</span>
                          <span className="text-slate-300">·</span>
                          <span>{formatDate(m.created_at)}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/admin/members/${m.member_id}`}
                            className="btn btn-outline btn-sm flex-1"
                          >
                            {t('viewProfile')}
                          </Link>
                          <Link href={`/admin/members/${m.member_id}?edit=1`} className="btn btn-ghost btn-sm">
                            {t('edit')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      {pages > 1 && (
        <nav className="flex items-center justify-between">
          <Link
            href={buildHref({ page: page > 1 ? String(page - 1) : null })}
            className={`btn btn-outline btn-sm ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            {t('previous')}
          </Link>
          <span className="text-sm text-slate-500">
            {t('pageOf')} {page} {t('of')} {pages}
          </span>
          <Link
            href={buildHref({ page: page < pages ? String(page + 1) : null })}
            className={`btn btn-outline btn-sm ${page >= pages ? 'pointer-events-none opacity-50' : ''}`}
          >
            {t('next')}
          </Link>
        </nav>
      )}
    </div>
  )
}
