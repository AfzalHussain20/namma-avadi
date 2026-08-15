import type { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Admin Login — Namma Avadi',
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">
            NA
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Namma Avadi</h1>
          <p className="mt-1 text-sm text-slate-500">TVK Member System — Admin Login</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized personnel only. All access is logged and audited.
        </p>
      </div>
    </div>
  )
}
