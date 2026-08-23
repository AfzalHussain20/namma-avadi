import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import ChangePasswordForm from './change-password-form'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await requireAdmin()
  const lang = await getLang()
  const t = getT(lang)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('accountSecurity')}</p>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">{t('adminAccount')}</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('userId')}</dt>
            <dd className="mt-1 text-sm font-medium">
              {String(user.user_metadata?.user_id ?? '') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('email')}</dt>
            <dd className="mt-1 text-sm font-medium">{user.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('role')}</dt>
            <dd className="mt-1">
              <span className="badge badge-blue">{t('roleAdmin')}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">{t('changePasswordTitle')}</h2>
        <div className="mt-4 max-w-md">
          <ChangePasswordForm lang={lang} />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="border-b pb-3 text-base font-semibold">{t('dataPrivacy')}</h2>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {t('privacyBullets').split('|').map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
