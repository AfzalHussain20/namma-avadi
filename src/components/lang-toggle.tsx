'use client'

import { useRouter } from 'next/navigation'
import { tr, type Lang } from '@/lib/i18n'
import { setLangCookie } from '@/lib/lang-cookie'
import { cn } from '@/lib/utils'

export default function LangToggle({ lang, className }: { lang: Lang; className?: string }) {
  const router = useRouter()

  function switchTo(next: Lang) {
    if (next === lang) return
    setLangCookie(next)
    router.refresh()
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm',
        className
      )}
      role="group"
      aria-label={tr(lang, 'changeLanguage')}
    >
      {(['en', 'ta'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={lang === l}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            lang === l ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {l === 'en' ? 'English' : 'தமிழ்'}
        </button>
      )      )}
    </div>
  )
}
