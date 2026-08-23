import type { Metadata } from 'next'
import LangToggle from '@/components/lang-toggle'
import SmartImage from '@/components/smart-image'
import { TVK_ASSETS } from '@/lib/constants'
import { getT } from '@/lib/i18n'
import { getLang } from '@/lib/i18n-server'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Admin Login — Namma Avadi',
}

export default async function LoginPage() {
  const lang = await getLang()
  const t = getT(lang)

  return (
    <div className="page-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-tvk-yellow/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 h-80 w-80 rounded-full bg-tvk-red/10 blur-3xl" />
      <div className="absolute top-4 right-4 z-10">
        <LangToggle lang={lang} />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-20 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-md">
            <SmartImage
              src={TVK_ASSETS.flag}
              alt={t('partyName')}
              label="TVK"
              aspect="aspect-[3/2]"
              contain
            />
          </div>
          <p className="text-sm font-bold text-tvk-dark-red">{t('partyName')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('appName')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('loginSubtitle')}</p>
        </div>
        <LoginForm lang={lang} />
        <p className="mt-6 text-center text-xs text-slate-400">{t('loginFootnote')}</p>
      </div>
    </div>
  )
}
