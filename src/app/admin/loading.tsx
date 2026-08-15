export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="h-7 w-44 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-8 w-14 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted/70" />
          ))}
        </div>
      </div>
    </div>
  )
}
