import type { Metadata } from 'next'
import Link from 'next/link'
import QRCode from 'qrcode'
import { requireAdmin } from '@/lib/dal'
import { PLACES } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import { getPhotoThumbUrls, getRecentMembers, getWardStats, groupWardStatsByPlace } from '@/lib/members/queries'
import { formatDate } from '@/lib/utils'
import RegistrationShare from './registration-share'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await requireAdmin()

  const lang = await getLang()
  const t = getT(lang)

  const registerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/register`
  const qrDataUrl = await QRCode.toDataURL(registerUrl, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const [stats, recent] = await Promise.all([getWardStats(), getRecentMembers(5)])
  const groups = groupWardStatsByPlace(stats.rows)
  const placeLabel = (place: string): string => {
    const p = PLACES.find((x) => x.value === place)
    return p ? (lang === 'ta' ? p.ta : p.en) : place
  }
  const recentPhotoUrls = await getPhotoThumbUrls(recent.map((m) => m.id))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('dashboard')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('appName')} — {t('tagline')}
        </p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tvk-red via-tvk-dark-red to-tvk-dark-red p-6 text-white shadow-lg shadow-red-900/30 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm font-medium text-tvk-yellow-soft">{t('totalMembersLabel')}</p>
          <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
            {stats.total.toLocaleString('en-IN')}
          </p>
          <p className="mt-3 text-sm text-tvk-yellow-soft">{t('heroSubline')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-tvk-dark-red shadow-sm transition-colors hover:bg-tvk-yellow-soft"
            >
              {t('viewAllMembers')}
            </Link>
            <Link
              href="/admin/wards"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              {t('viewWardOverview')}
            </Link>
          </div>
        </div>
      </div>

      {/* Place summaries */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('allPlaces')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.perPlace.map((p) => (
            <Link
              key={p.place}
              href={`/admin/members?place=${p.place}`}
              className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-tvk-yellow hover:shadow-md"
            >
              <p className="text-base font-bold text-slate-900 group-hover:text-tvk-red">{placeLabel(p.place)}</p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900 group-hover:text-tvk-red">
                {p.total.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {t('membersUnit')} · {p.wardCount} {t('wardsUnit')}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Member registration QR + share */}
      <RegistrationShare qrDataUrl={qrDataUrl} url={registerUrl} lang={lang} />

      {/* Members by ward, grouped by place — every ward shown, zero counts included */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('membersByWard')}</h2>
          <Link href="/admin/wards" className="text-sm font-semibold text-tvk-red hover:text-tvk-dark-red">
            {t('viewAll')} →
          </Link>
        </div>
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.place}>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  {placeLabel(group.place)}
                </h3>
                <Link
                  href={`/admin/members?place=${group.place}`}
                  className="text-xs font-semibold text-tvk-red hover:text-tvk-dark-red"
                >
                  {t('viewAll')} →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
                {group.rows.map((row) => (
                  <Link
                    key={`${row.place}-${row.ward_number}`}
                    href={`/admin/members?place=${row.place}&ward=${row.ward_number}`}
                    className={
                      row.member_count > 0
                        ? 'card group p-3 text-center transition-all hover:-translate-y-0.5 hover:border-tvk-yellow hover:shadow-md'
                        : 'card p-3 text-center opacity-60 transition-all hover:opacity-100 hover:border-tvk-yellow'
                    }
                  >
                    <p className="text-[11px] font-semibold text-slate-500">
                      {lang === 'ta' ? `வார்டு ${row.ward_number}` : `Ward ${row.ward_number}`}
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 group-hover:text-tvk-red">
                      {row.member_count.toLocaleString('en-IN')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent registrations */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('recentRegistrations')}</h2>
          <Link href="/admin/members" className="text-sm font-semibold text-tvk-red hover:text-tvk-dark-red">
            {t('viewAll')} →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-base font-semibold text-slate-900">{t('noMembersYet')}</p>
              <p className="mt-2 text-sm text-slate-500">{t('noMembersHint')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((m) => {
                const photo = recentPhotoUrls.get(m.id)
                return (
                  <li key={m.id}>
                    <Link
                      href={`/admin/members/${m.member_id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-tvk-yellow-soft to-tvk-yellow text-sm font-bold text-tvk-dark-red">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt="" loading="eager" className="h-full w-full object-cover" />
                        ) : (
                          <span>{m.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{m.full_name}</p>
                        <p className="truncate text-sm text-slate-500">
                          {placeLabel(m.place)} · {lang === 'ta' ? `வார்டு ${m.ward_number}` : `Ward ${m.ward_number}`}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold tabular-nums text-tvk-red">{m.member_id}</p>
                        <p className="text-xs text-slate-400">{formatDate(m.created_at)}</p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
