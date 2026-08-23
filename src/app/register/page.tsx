import type { Metadata } from 'next'
import Link from 'next/link'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import RegistrationForm from './registration-form'

export const metadata: Metadata = {
  title: 'Member Registration — Namma Avadi',
}
export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const lang = await getLang()
  const t = getT(lang)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              NA
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{t('appName')}</p>
              <p className="text-xs text-muted-foreground">{t('tagline')}</p>
            </div>
          </div>
          <Link href="/" className="btn btn-ghost btn-sm">
            {t('home')}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <RegistrationForm lang={lang} />
      </main>

      <footer className="pb-8 text-center text-xs text-muted-foreground">{t('footerReg')}</footer>
    </div>
  )
}
