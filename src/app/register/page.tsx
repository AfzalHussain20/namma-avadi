import type { Metadata } from 'next'
import Link from 'next/link'
import LeaderProfile from '@/components/leader-profile'
import SmartImage from '@/components/smart-image'
import { TVK_ASSETS } from '@/lib/constants'
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="brand-bar" />
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <SmartImage
              src={TVK_ASSETS.logo}
              alt="TVK"
              label="TVK"
              aspect="aspect-square"
              contain
              className="h-10 w-10 rounded-xl shadow-sm"
            />
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

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Compact brand strip — form stays the priority below the fold */}
        <section className="card mb-8 p-5 sm:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
            <div className="hidden lg:block">
              <LeaderProfile name={t('leaderRameshName')} role={t('leaderRameshRole')} src={TVK_ASSETS.ramesh} />
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 overflow-hidden rounded-lg border border-border bg-white p-1 shadow-sm sm:w-28">
                <SmartImage
                  src={TVK_ASSETS.flag}
                  alt={t('partyName')}
                  label="TVK"
                  aspect="aspect-[3/2]"
                  contain
                />
              </div>
              <p className="mt-3 text-base font-extrabold leading-tight text-tvk-dark-red sm:text-xl">
                {t('partyName')}
              </p>
              <p className="mt-1 inline-flex items-center rounded-full bg-tvk-yellow-soft px-3 py-0.5 text-[11px] font-semibold text-tvk-dark-red">
                {t('portalTitle')}
              </p>
            </div>
            <div className="hidden lg:block">
              <LeaderProfile name={t('leaderVijayName')} role={t('leaderVijayRole')} src={TVK_ASSETS.vijay} />
            </div>
          </div>
          {/* On mobile the two portraits sit side-by-side under the brand block */}
          <div className="mt-4 flex items-start justify-center gap-14 border-t border-border pt-5 lg:hidden">
            <LeaderProfile size="sm" name={t('leaderRameshName')} role={t('leaderRameshRole')} src={TVK_ASSETS.ramesh} />
            <LeaderProfile size="sm" name={t('leaderVijayName')} role={t('leaderVijayRole')} src={TVK_ASSETS.vijay} />
          </div>
        </section>

        <RegistrationForm lang={lang} />
      </main>

      <footer className="border-t bg-card">
        <div className="brand-bar" />
        <div className="py-5 text-center">
          <p className="text-xs font-semibold text-tvk-dark-red">{t('partyName')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('footerReg')}</p>
        </div>
      </footer>
    </div>
  )
}
