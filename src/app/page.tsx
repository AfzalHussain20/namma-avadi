import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              NA
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Namma Avadi</p>
              <p className="text-xs text-muted-foreground">TVK Member System</p>
            </div>
          </div>
          <Link href="/admin/login" className="btn btn-outline btn-sm">
            Admin Login
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-primary">
            Avadi · Wards 1–7
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            TVK Member Registration &amp; Tracking
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Register TVK members in Avadi, track ward-wise distribution, manage
            member profiles with documents, and export reports — all in one
            secure system.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn btn-primary">
              Register a Member
            </Link>
            <Link href="/admin/login" className="btn btn-outline">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <p className="text-center text-xs text-muted-foreground">
          Namma Avadi — TVK Member System. Authorized access only.
        </p>
      </footer>
    </div>
  )
}
