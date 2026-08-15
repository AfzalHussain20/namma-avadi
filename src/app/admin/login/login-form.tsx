'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/auth/actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined)

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
      <div>
        <label htmlFor="user_id" className="label">
          User ID
        </label>
        <input
          id="user_id"
          name="user_id"
          autoComplete="username"
          required
          autoFocus
          className="input"
          placeholder="Enter your user ID"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
