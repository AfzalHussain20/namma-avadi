import type { Metadata } from 'next'
import Link from 'next/link'
import { getWards } from '@/lib/members/queries'
import RegistrationForm from './registration-form'

export const metadata: Metadata = {
  title: 'Member Registration — Namma Avadi',
}
export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const wards = await getWards()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              NA
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Namma Avadi</p>
              <p className="text-xs text-muted-foreground">TVK Member System</p>
            </div>
          </div>
          <Link href="/" className="btn btn-ghost btn-sm">
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <RegistrationForm wards={wards} />
      </main>

      <footer className="pb-8 text-center text-xs text-muted-foreground">
        Authorized personnel only · Namma Avadi — TVK Member System
      </footer>
    </div>
  )
}
