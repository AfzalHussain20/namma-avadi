import type { Metadata } from 'next'
import Link from 'next/link'
import LangToggle from '@/components/lang-toggle'
import LeaderPortrait from '@/components/leader-portrait'
import SmartImage from '@/components/smart-image'
import { TVK_ASSETS, TVK_LINKS } from '@/lib/constants'
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
    <div className="page-background min-h-screen">
      <header className="border-b bg-card shadow-sm">
        <div className="brand-bar" />
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <SmartImage
              src={TVK_ASSETS.flag}
              alt={t('flagAlt')}
              label="TVK"
              aspect="aspect-square"
              contain
              className="h-10 w-10 rounded-xl border border-border p-0.5"
            />
            <div>
              <p className="text-sm font-semibold leading-tight">{t('appName')}</p>
              <p className="text-xs text-muted-foreground">{t('tagline')}</p>
            </div>
          </div>
          <Link href="/" className="btn btn-outline btn-sm">
            {t('home')}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Compact brand strip — form stays the priority below the fold */}
        <section className="mb-8 rounded-[20px] border border-slate-200 bg-white/95 p-5 shadow-md sm:p-7">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-tvk-yellow to-tvk-red" />
          <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
            <div className="hidden lg:block">
              <LeaderPortrait
                width="w-[150px]"
                src={TVK_ASSETS.ramesh}
                alt={t('leaderRameshAlt')}
                name={t('leaderRameshName')}
                role={t('leaderRameshRole')}
                href={TVK_LINKS.candidates}
                hoverLabel={t('viewOfficialProfile')}
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 overflow-hidden rounded-lg border border-border bg-white p-1 shadow-sm sm:w-28">
                <SmartImage
                  src={TVK_ASSETS.flag}
                  alt={t('flagAlt')}
                  label="TVK"
                  aspect="aspect-[3/2]"
                  contain
                />
              </div>
              <p className="mt-3 text-lg font-extrabold leading-tight text-tvk-dark-red sm:text-xl">
                தமிழக வெற்றிக் கழகம்
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground sm:text-sm lg:whitespace-nowrap">
                Tamilaga Vettri Kazhagam
              </p>
              <p className="mt-2 inline-flex items-center rounded-full bg-tvk-yellow-soft px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-tvk-dark-red">
                {t('portalTitle')}
              </p>
            </div>
            <div className="hidden lg:block">
              <LeaderPortrait
                width="w-[150px]"
                src={TVK_ASSETS.vijay}
                alt={t('leaderVijayAlt')}
                name={t('leaderVijayName')}
                role={t('leaderVijayRole')}
                href={TVK_LINKS.home}
                hoverLabel={t('viewOfficialProfile')}
              />
            </div>
          </div>
          {/* On mobile the two portraits sit side-by-side under the brand block */}
          <div className="mt-5 flex items-start justify-center gap-10 border-t border-border pt-5 lg:hidden">
            <LeaderPortrait
              size="sm"
              src={TVK_ASSETS.ramesh}
              alt={t('leaderRameshAlt')}
              name={t('leaderRameshName')}
              role={t('leaderRameshRole')}
              href={TVK_LINKS.candidates}
              hoverLabel={t('viewOfficialProfile')}
            />
            <LeaderPortrait
              size="sm"
              src={TVK_ASSETS.vijay}
              alt={t('leaderVijayAlt')}
              name={t('leaderVijayName')}
              role={t('leaderVijayRole')}
              href={TVK_LINKS.home}
              hoverLabel={t('viewOfficialProfile')}
            />
          </div>
        </section>

        {/* Language switcher + registration heading */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <LangToggle lang={lang} />
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{t('regTitle')}</h1>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('homeBadge')}</p>
        </div>

        <RegistrationForm lang={lang} />
      </main>

      <footer className="border-t bg-card">
        <div className="brand-bar" />
        <div className="py-5 text-center">
          <p className="text-xs font-bold text-tvk-dark-red">தமிழக வெற்றிக் கழகம்</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Tamilaga Vettri Kazhagam</p>
          <p className="mt-2 text-xs text-muted-foreground">{t('footerReg')}</p>
        </div>
      </footer>
    </div>
  )
}
