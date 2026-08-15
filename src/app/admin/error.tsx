'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
        <svg className="h-6 w-6 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86l-8.1 14a2 2 0 001.7 3h16.2a2 2 0 001.7-3l-8.1-14a2 2 0 00-3.4 0z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred while loading this page.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-5">
        Try again
      </button>
    </div>
  )
}
