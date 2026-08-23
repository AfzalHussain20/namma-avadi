'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Official leader portrait — circular avatar with name/role below.
 * - Perfect circle with object-cover / center-top for face framing
 * - Subtle border + shadow for depth; scales responsively
 * - Text-only fallback on error; never a broken-image icon
 * - Optionally wrapped in an external link with hover ring effect
 */
export default function LeaderPortrait({
  src,
  alt,
  name,
  role,
  href,
  hoverLabel,
  size = 'md',
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
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  const circleSize =
    size === 'sm'
      ? 'h-[100px] w-[100px]'
      : size === 'lg'
        ? 'h-[180px] w-[180px] xl:h-[200px] xl:w-[200px]'
        : 'h-[100px] w-[100px] sm:h-[140px] sm:w-[140px] lg:h-[170px] lg:w-[170px] xl:h-[190px] xl:w-[190px]'

  const card = (
    <figure className={cn('group flex flex-col items-center text-center', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-full border-2 border-slate-200 bg-white shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:border-tvk-yellow',
          circleSize
        )}
      >
        {!failed ? (
          /* eslint-disable-next-line @next/next/no-img-element -- fixed-size local assets */
          <img
            src={src}
            alt={alt}
            width={300}
            height={300}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            draggable={false}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-[center_top]"
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="flex h-full w-full items-center justify-center bg-white p-3 text-center"
          >
            <span className="text-sm font-semibold leading-snug text-slate-600">{name}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 max-w-[12rem]">
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
      className="rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-tvk-yellow"
    >
      {card}
    </a>
  )
}
