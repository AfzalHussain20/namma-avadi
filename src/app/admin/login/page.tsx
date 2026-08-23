import type { Metadata } from 'next'
import LangToggle from '@/components/lang-toggle'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute top-4 right-4 z-10">
        <LangToggle lang={lang} />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">
            NA
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('appName')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('loginSubtitle')}</p>
        </div>
        <LoginForm lang={lang} />
        <p className="mt-6 text-center text-xs text-slate-400">{t('loginFootnote')}</p>
      </div>
    </div>
  )
}
