import type { Metadata } from 'next'
import { getLang } from '@/lib/i18n-server'
import AdminNav from './admin-nav'

export const metadata: Metadata = {
  title: {
    default: 'Admin — Namma Avadi',
    template: '%s | Namma Avadi',
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()

  return (
    <div className="min-h-screen">
      <AdminNav lang={lang} />
      <main className="px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">{children}</main>
    </div>
  )
}
