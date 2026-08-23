'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Official leader portrait card.
 * - Real photograph, aspect-locked (3:4), object-cover / center-top — never stretched
 * - Fixed frame prevents layout shift; skeleton shimmer while loading
 * - Text-only fallback on error; never a broken-image icon or silhouette
 * - Optionally wrapped in an external link to the official TVK profile,
 *   with a subtle "View Official Profile" hover overlay
 */
export default function LeaderPortrait({
  src,
  alt,
  name,
  role,
  href,
  hoverLabel,
  size = 'md',
  width,
  className,
}: {
  src: string
  alt: string
  name: string
  role: string
  /** Official profile URL — renders the whole card as an external link. */
  href?: string
  hoverLabel?: string
  size?: 'sm' | 'md' | 'lg'
  /** Overrides the preset responsive frame width (e.g. "w-[150px]"). */
  width?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  const frame =
    width ??
    (size === 'sm'
      ? 'w-[100px]' // mobile ≈ 100 × 133
      : size === 'lg'
        ? 'w-[200px] xl:w-[210px]' // desktop ≈ 200–210 × 267–280
        : 'w-[100px] sm:w-[160px] lg:w-[200px] xl:w-[210px]')

  const card = (
    <figure className={cn('group flex flex-col items-center text-center', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-shadow group-hover:shadow-lg',
          frame
        )}
      >
        {/* small yellow accent along the top of the white card */}
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-tvk-yellow" />
        {!failed ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local assets; width/height prevent shift */}
            <img
              src={src}
              alt={alt}
              width={300}
              height={400}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              draggable={false}
              onError={() => setFailed(true)}
              className="aspect-[3/4] h-auto w-full object-cover object-[center_top]"
            />
          </>
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="flex aspect-[3/4] w-full items-center justify-center bg-white p-3 text-center"
          >
            <span className="text-sm font-semibold leading-snug text-slate-600">{name}</span>
          </div>
        )}

        {/* subtle hover overlay for linked cards */}
        {href && !failed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-[11px] font-semibold text-white">{hoverLabel}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-2 max-w-[11rem]">
        <p className="text-xs font-bold leading-snug text-foreground sm:text-sm">{name}</p>
        <p className="mt-0.5 text-[10px] font-medium leading-snug text-muted-foreground sm:text-xs">{role}</p>
      </figcaption>
    </figure>
  )

  if (!href) return card

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${alt} (${hoverLabel ?? ''})`}
      className="rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-tvk-yellow"
    >
      {card}
    </a>
  )
}
