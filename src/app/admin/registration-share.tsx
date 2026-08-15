'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function RegistrationShare({ qrDataUrl, url }: { qrDataUrl: string; url: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'done'>('idle')
  const [busy, setBusy] = useState(false)

  async function invite() {
    setBusy(true)
    const data = {
      title: 'Namma Avadi — TVK Member Registration',
      text: 'Join Namma Avadi as a TVK member (Avadi, Wards 1–7). Register online in 2 minutes.',
      url,
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data)
        setStatus('done')
      } else {
        await navigator.clipboard.writeText(url)
        setStatus('copied')
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user dismissed the share sheet
      } else {
        try {
          await navigator.clipboard.writeText(url)
          setStatus('copied')
        } catch {
          // ignore
        }
      }
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch {
      // ignore
    }
  }

  return (
    <section className="card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
        <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR code for member registration" className="h-44 w-44 sm:h-52 sm:w-52" />
        </div>

        <div className="w-full min-w-0 text-center md:text-left">
          <h2 className="text-lg font-semibold text-slate-900">Register Members</h2>
          <p className="mt-1 text-sm text-slate-500">
            Scan the QR to open the member registration form on any phone, or send the link directly
            to members via WhatsApp, Messages, Email or any installed app.
          </p>

          <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:mx-0">
            <span className="min-w-0 flex-1 truncate text-xs text-slate-500 sm:text-sm">{url}</span>
            <button
              type="button"
              onClick={copyLink}
              className="btn btn-ghost btn-sm shrink-0"
              aria-label="Copy registration link"
            >
              Copy
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={invite}
              disabled={busy}
              className="btn btn-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-4l4 4 4-4M4 20h16" />
              </svg>
              {busy ? 'Opening…' : 'Invite'}
            </button>
          </div>

          <p
            className={cn(
              'mt-3 text-sm transition-opacity',
              status === 'idle' && 'opacity-0'
            )}
            aria-live="polite"
          >
            {status === 'copied' && <span className="text-emerald-600">Registration link copied.</span>}
            {status === 'done' && <span className="text-emerald-600">Registration link shared.</span>}
          </p>
        </div>
      </div>
    </section>
  )
}
