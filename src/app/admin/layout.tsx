import type { Metadata } from 'next'
import AdminNav from './admin-nav'

export const metadata: Metadata = {
  title: {
    default: 'Admin — Namma Avadi',
    template: '%s | Namma Avadi',
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">{children}</main>
    </div>
  )
}
