import SmartImage from './smart-image'
import { cn } from '@/lib/utils'

/**
 * Portrait card for a party leader: photo on top, name + designation below.
 * Size variants keep proportions consistent across pages.
 */
export default function LeaderProfile({
  name,
  role,
  src,
  size = 'md',
  className,
}: {
  name: string
  role: string
  src: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const frame =
    size === 'sm'
      ? 'w-20 lg:w-32'
      : size === 'lg'
        ? 'w-24 sm:w-36 lg:w-56'
        : 'w-24 sm:w-36 lg:w-48'

  return (
    <figure className={cn('flex flex-col items-center text-center', className)}>
      <div
        className={cn(
          'overflow-hidden rounded-2xl border-2 border-tvk-yellow bg-white shadow-md transition-shadow hover:shadow-lg',
          frame
        )}
      >
        <SmartImage src={src} alt={`${name} — ${role}`} label={name} aspect="aspect-[3/4]" />
      </div>
      <figcaption className="mt-2 max-w-[10rem]">
        <p className="text-xs font-bold leading-snug text-foreground sm:text-sm">{name}</p>
        <p className="mt-0.5 text-[10px] font-medium leading-snug text-muted-foreground sm:text-xs">{role}</p>
      </figcaption>
    </figure>
  )
}
