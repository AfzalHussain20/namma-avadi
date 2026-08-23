import { LANG_COOKIE, type Lang } from '@/lib/i18n'

/** Persist the language choice as a long-lived cookie (client-side). */
export function setLangCookie(lang: Lang): void {
  const secure = window.location.protocol === 'https:' ? ';secure' : ''
  document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax${secure}`
}
