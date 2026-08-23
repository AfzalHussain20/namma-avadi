import Link from 'next/link'
import LeaderProfile from '@/components/leader-profile'
import LangToggle from '@/components/lang-toggle'
import SmartImage from '@/components/smart-image'
import { TVK_ASSETS } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'

export default async function Home() {
  const lang = await getLang()
  const t = getT(lang)

  const centerBlock = (
    <div className="flex flex-col items-center text-center">
      <div className="w-28 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-md sm:w-36 lg:w-44">
        <SmartImage
          src={TVK_ASSETS.flag}
          alt={t('partyName')}
          label="TVK"
          aspect="aspect-[3/2]"
          contain
        />
      </div>
      <p className="mt-4 text-lg font-extrabold leading-tight text-tvk-dark-red sm:text-2xl">
        {t('partyName')}
      </p>
      <p className="mt-1 inline-flex items-center rounded-full bg-tvk-yellow-soft px-3 py-1 text-xs font-semibold text-tvk-dark-red">
        {t('portalTitle')}
      </p>
      <h1 className="mt-5 max-w-md text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t('homeTitle')}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {t('homeBody')}
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/register" className="btn btn-primary px-6 py-2.5 text-base">
          {t('registerAMember')}
        </Link>
        <Link href="/admin/login" className="btn btn-outline px-6 py-2.5 text-base">
          {t('adminDashboard')}
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="brand-bar" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
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
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} />
            <Link href="/admin/login" className="btn btn-outline btn-sm">
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        {/* Mobile hero: brand block first, then compact portraits, then actions */}
        <section className="card w-full max-w-xl p-6 sm:p-8 lg:hidden">
          {centerBlock}
          <div className="mt-8 flex items-start justify-center gap-12 border-t border-border pt-6">
            <LeaderProfile size="sm" name={t('leaderRameshName')} role={t('leaderRameshRole')} src={TVK_ASSETS.ramesh} />
            <LeaderProfile size="sm" name={t('leaderVijayName')} role={t('leaderVijayRole')} src={TVK_ASSETS.vijay} />
          </div>
        </section>

        {/* Desktop hero: Ramesh Kumar left, brand centre, Vijay right */}
        <section className="card hidden w-full max-w-6xl p-10 lg:block">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-10 xl:gap-16">
            <LeaderProfile name={t('leaderRameshName')} role={t('leaderRameshRole')} src={TVK_ASSETS.ramesh} />
            {centerBlock}
            <LeaderProfile size="lg" name={t('leaderVijayName')} role={t('leaderVijayRole')} src={TVK_ASSETS.vijay} />
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="brand-bar" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-5 text-center sm:px-6">
          <p className="text-xs font-semibold text-tvk-dark-red">{t('partyName')}</p>
          <p className="text-xs text-muted-foreground">{t('footerReg')}</p>
        </div>
      </footer>
    </div>
  )
}
