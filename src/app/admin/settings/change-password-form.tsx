'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

export default function ChangePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
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
          New Password *
        </label>
        <input
          id="pwd"
          name="password"
          type="password"
          className={cn('input', error && 'border-danger focus:border-danger')}
          placeholder="At least 8 characters"
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
          Confirm Password *
        </label>
        <input
          id="pwd-confirm"
          name="confirm"
          type="password"
          className={cn('input', error && 'border-danger focus:border-danger')}
          placeholder="Repeat new password"
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
      {success && <p className="text-sm text-success">Password updated successfully.</p>}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}
