import type { Metadata } from 'next'
import Link from 'next/link'
import QRCode from 'qrcode'
import { requireAdmin } from '@/lib/dal'
import { getPhotoThumbUrls, getRecentMembers } from '@/lib/members/queries'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import RegistrationShare from './registration-share'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await requireAdmin()

  const registerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/register`
  const qrDataUrl = await QRCode.toDataURL(registerUrl, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const supabase = await createClient()
  const [statsResult, recent] = await Promise.all([
    supabase.rpc('get_dashboard_stats'),
    getRecentMembers(5),
  ])

  const { data, error } = statsResult

  if (error || !data || data.length === 0) {
    return (
      <div className="card p-8">
        <h2 className="text-base font-semibold">Unable to load dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || 'No ward data found. Check that the database schema has been applied.'}
        </p>
      </div>
    )
  }

  const total = data.reduce((sum, row) => sum + row.member_count, 0)
  const recentPhotoUrls = await getPhotoThumbUrls(recent.map((m) => m.id))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Namma Avadi — TVK member overview across wards 1–7.
        </p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200/60 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm font-medium text-indigo-100">Total Members</p>
          <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
            {total.toLocaleString('en-IN')}
          </p>
          <p className="mt-3 text-sm text-indigo-100">Registered across Avadi wards 1–7</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
            >
              View all members
            </Link>
            <Link
              href="/admin/wards"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              View ward overview
            </Link>
          </div>
        </div>
      </div>

      {/* Member registration QR + share */}
      <RegistrationShare qrDataUrl={qrDataUrl} url={registerUrl} />

      {/* Ward distribution */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Members by Ward</h2>
          <Link href="/admin/wards" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((row) => (
            <Link
              key={row.ward_number}
              href={`/admin/members?ward=${row.ward_number}`}
              className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {row.ward_name}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 group-hover:text-indigo-600">
                {row.member_count.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-xs text-slate-400">members</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent registrations */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Registrations</h2>
          <Link href="/admin/members" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-base font-semibold text-slate-900">No members yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Members can be added from the registration page.
              </p>
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{m.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{m.full_name}</p>
                        <p className="truncate text-sm text-slate-500">
                          {m.father_name} · Ward {m.ward_number}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold tabular-nums text-indigo-600">{m.member_id}</p>
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
