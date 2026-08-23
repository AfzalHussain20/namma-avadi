import Link from 'next/link'
import LangToggle from '@/components/lang-toggle'
import LeaderPortrait from '@/components/leader-portrait'
import SmartImage from '@/components/smart-image'
import { TVK_ASSETS, TVK_LINKS } from '@/lib/constants'
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
          alt={t('flagAlt')}
          label="TVK"
          aspect="aspect-[3/2]"
          contain
        />
      </div>
      {/* Hierarchy: Tamil party name → English party name → portal subtitle */}
      <p className="mt-4 text-xl font-extrabold leading-tight text-tvk-dark-red sm:text-2xl lg:text-3xl">
        தமிழக வெற்றிக் கழகம்
      </p>
      <p className="mt-1.5 text-sm font-semibold text-foreground sm:text-base lg:whitespace-nowrap">
        Tamilaga Vettri Kazhagam
      </p>
      <h1 className="mt-6 max-w-md text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {t('homeTitle')}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t('homeBody')}</p>
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

  const rameshPortrait = (
    <LeaderPortrait
      src={TVK_ASSETS.ramesh}
      alt={t('leaderRameshAlt')}
      name={t('leaderRameshName')}
      role={t('leaderRameshRole')}
      href={TVK_LINKS.candidates}
      hoverLabel={t('viewOfficialProfile')}
    />
  )
  const vijayPortrait = (
    <LeaderPortrait
      src={TVK_ASSETS.vijay}
      alt={t('leaderVijayAlt')}
      name={t('leaderVijayName')}
      role={t('leaderVijayRole')}
      href={TVK_LINKS.home}
      hoverLabel={t('viewOfficialProfile')}
    />
  )

  return (
    <div className="page-background flex min-h-screen flex-col">
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
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden btn btn-ghost btn-sm sm:inline-flex">
              {t('home')}
            </Link>
            <LangToggle lang={lang} />
            <Link href="/admin/login" className="btn btn-outline btn-sm">
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        {/* Mobile hero: brand first, then compact portraits — form stays close */}
        <section className="w-full max-w-xl rounded-[20px] border border-slate-200 bg-white/95 p-5 shadow-md sm:p-8 lg:hidden">
          <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-tvk-yellow to-tvk-red" />
          {centerBlock}
          <div className="mt-7 flex items-start justify-center gap-10 border-t border-border pt-6">
            {rameshPortrait}
            {vijayPortrait}
          </div>
        </section>

        {/* Desktop hero: Ramesh left · brand centre · Vijay right */}
        <section className="relative hidden w-full max-w-7xl overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 px-10 py-12 shadow-md xl:px-16 lg:block">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-tvk-yellow via-tvk-yellow to-tvk-red" />
          <div className="grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-12 xl:gap-16">
            {rameshPortrait}
            {centerBlock}
            {vijayPortrait}
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="brand-bar" />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-4 py-5 text-center sm:px-6">
          <p className="text-xs font-bold text-tvk-dark-red">தமிழக வெற்றிக் கழகம்</p>
          <p className="text-xs text-muted-foreground">Tamilaga Vettri Kazhagam</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('footerReg')}</p>
        </div>
      </footer>
    </div>
  )
}
