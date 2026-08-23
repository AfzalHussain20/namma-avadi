'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/auth/actions'
import { getT, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export default function ChangePasswordForm({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError(t('pwdMinError'))
      return
    }
    if (password !== confirm) {
      setError(t('pwdMismatch'))
      return
    }
    setBusy(true)
    setError('')
    setSuccess(false)
    const result = await changePassword(undefined, new FormData(e.target as HTMLFormElement))
    setBusy(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setPassword('')
      setConfirm('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pwd" className="label">
          {t('newPassword')}
        </label>
        <input
          id="pwd"
          name="password"
          type="password"
          className={cn('input', error && 'border-danger focus:border-danger')}
          placeholder={t('phNewPassword')}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
            setSuccess(false)
          }}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label htmlFor="pwd-confirm" className="label">
          {t('confirmPassword')}
        </label>
        <input
          id="pwd-confirm"
          name="confirm"
          type="password"
          className={cn('input', error && 'border-danger focus:border-danger')}
          placeholder={t('phConfirmPassword')}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            setError('')
            setSuccess(false)
          }}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">{t('passwordUpdated')}</p>}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? t('updating') : t('updatePassword')}
      </button>
    </form>
  )
}
