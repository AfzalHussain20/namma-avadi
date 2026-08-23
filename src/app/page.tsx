import Link from 'next/link'
import LangToggle from '@/components/lang-toggle'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'

export default async function Home() {
  const lang = await getLang()
  const t = getT(lang)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              NA
            </div>
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

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-primary">
            {t('homeBadge')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('homeTitle')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            {t('homeBody')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn btn-primary">
              {t('registerAMember')}
            </Link>
            <Link href="/admin/login" className="btn btn-outline">
              {t('adminDashboard')}
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <p className="text-center text-xs text-muted-foreground">{t('footerReg')}</p>
      </footer>
    </div>
  )
}
