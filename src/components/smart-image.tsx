'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Image with graceful fallback — never shows a broken-image icon.
 * Fixed aspect container prevents layout shift; the photo is never stretched.
 */
export default function SmartImage({
  src,
  alt,
  label,
  aspect = 'aspect-[3/4]',
  contain = false,
  className,
}: {
  src: string
  alt: string
  /** Shown inside the placeholder box if the image fails to load. */
  label: string
  aspect?: string
  /** Use object-contain (flags/logos) instead of object-cover (portraits). */
  contain?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-tvk-yellow-soft', aspect, className)}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- local static assets; keeps fallback handling simple
        <img
          src={src}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          draggable={false}
          onError={() => setFailed(true)}
          className={cn('h-full w-full', contain ? 'object-contain' : 'object-cover object-top')}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full flex-col items-center justify-center gap-1 bg-tvk-yellow-soft p-2 text-center"
        >
          <span className="text-sm font-bold leading-tight text-tvk-dark-red">{label}</span>
        </div>
      )}
    </div>
  )
}
