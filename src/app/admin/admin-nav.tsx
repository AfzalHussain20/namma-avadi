'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth/actions'
import { getT, type DictKey, type Lang } from '@/lib/i18n'
import LangToggle from '@/components/lang-toggle'
import { cn } from '@/lib/utils'

const iconCls = 'h-5 w-5 shrink-0'

const links: { href: string; labelKey: DictKey; icon: React.ReactNode }[] = [
  {
    href: '/admin',
    labelKey: 'dashboard',
    icon: (
      <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: '/admin/members',
    labelKey: 'members',
    icon: (
      <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/wards',
    labelKey: 'wardOverview',
    icon: (
      <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/reports',
    labelKey: 'reports',
    icon: (
      <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    labelKey: 'settings',
    icon: (
      <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function Brand({ compact, t }: { compact?: boolean; t: (key: DictKey) => string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-200">
        NA
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">{t('appName')}</p>
          <p className="text-xs text-slate-400">{t('tagline')}</p>
        </div>
      )}
    </div>
  )
}

export default function AdminNav({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  }

  const navLinks = (closeOnClick: boolean) =>
    links.map((link) => {
      const active = isActive(link.href)
      return (
        <li key={link.href}>
          <Link
            href={link.href}
            onClick={() => closeOnClick && setOpen(false)}
            className={cn('nav-link', active && 'nav-link-active')}
          >
            {link.icon}
            <span>{t(link.labelKey)}</span>
          </Link>
        </li>
      )
    })

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('openMenu')}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Brand t={t} />
        </div>
        <LangToggle lang={lang} />
      </header>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', !open && 'pointer-events-none')}>
        <div
          className={cn(
            'absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
          role="dialog"
          aria-modal="true"
          aria-label={t('openMenu')}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <Brand t={t} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('closeMenu')}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">{navLinks(true)}</ul>
          </nav>
          <div className="space-y-3 border-t border-slate-100 p-3">
            <LangToggle lang={lang} className="w-full justify-center" />
            <button
              type="button"
              onClick={() => signOut()}
              className="nav-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              <span>{t('logout')}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 px-5 py-4">
          <Link href="/admin">
            <Brand t={t} />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">{navLinks(false)}</ul>
        </nav>
        <div className="space-y-3 border-t border-slate-100 p-3">
          <LangToggle lang={lang} className="w-full justify-center" />
          <button type="button" onClick={() => signOut()} className="nav-link w-full">
            <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
