export const WARD_COUNT = 7

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING_VERIFICATION: 'Pending Verification',
}

export const STATUS_BADGES: Record<string, string> = {
  ACTIVE: 'badge-green',
  INACTIVE: 'badge-slate',
  PENDING_VERIFICATION: 'badge-amber',
}

export const DOC_LABELS: Record<string, string> = {
  AADHAAR: 'Aadhaar',
  VOTER_ID: 'Voter ID',
  TVK_ID: 'TVK ID',
  PHOTO: 'Photo',
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function maskAadhaar(value?: string | null): string {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return '—'
  if (digits.length < 4) return 'XXXX-XXXX-' + digits
  return `XXXX-XXXX-${digits.slice(-4)}`
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function isValidMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value)
}

export function isValidAadhaar(value: string): boolean {
  return /^\d{12}$/.test(value)
}

export function isValidVoterId(value: string): boolean {
  return /^[A-Z]{3}\d{7}$/.test(value)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isFutureDate(value: string): boolean {
  const d = new Date(value)
  return d.getTime() > Date.now()
}
