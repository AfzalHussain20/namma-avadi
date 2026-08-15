import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import ChangePasswordForm from './change-password-form'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account and security settings.</p>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">Admin Account</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">User ID</dt>
            <dd className="mt-1 text-sm font-medium">
              {String(user.user_metadata?.user_id ?? '') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm font-medium">{user.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt>
            <dd className="mt-1">
              <span className="badge badge-blue">Admin</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">Change Password</h2>
        <div className="mt-4 max-w-md">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">Data Privacy</h2>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Member documents are stored in a private bucket — never public URLs.</li>
          <li>Aadhaar numbers are masked in all normal views and excluded from exports.</li>
          <li>Member data is visible only to authenticated admins.</li>
          <li>Only synthetic/fake data is used in the demo environment.</li>
        </ul>
      </section>
    </div>
  )
}
