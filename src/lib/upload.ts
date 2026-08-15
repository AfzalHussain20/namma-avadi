import { supabaseEnv } from '@/lib/supabase/env'

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string }

// Uploads a file to the private member-documents bucket with progress.
// `token` is the current auth session access token when signed in, otherwise
// the anon key is used (allowed by RLS insert policy for registration).
export function uploadFileWithProgress(
  path: string,
  file: File,
  token: string | null,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const { url, anonKey } = supabaseEnv()
  const bucket = 'member-documents'
  const bearer = token ?? anonKey

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${url}/storage/v1/object/${bucket}/${path}`)
    xhr.setRequestHeader('apikey', anonKey)
    xhr.setRequestHeader('Authorization', `Bearer ${bearer}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true, path })
      } else {
        resolve({ ok: false, error: 'Upload failed. Please try again.' })
      }
    }
    xhr.onerror = () => resolve({ ok: false, error: 'Upload failed. Check your connection.' })

    xhr.send(file)
  })
}

export function documentFilePath(memberUuid: string, docType: string, fileName: string): string {
  const ext = fileName.split('.').pop() ?? 'bin'
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase()
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60)
  return `${memberUuid}/${docType}/${Date.now()}-${base}.${safeExt}`
}

export const DOC_TYPE_ACCEPTS: Record<string, string> = {
  AADHAAR: '.jpg,.jpeg,.png,.pdf',
  VOTER_ID: '.jpg,.jpeg,.png,.pdf',
  TVK_ID: '.jpg,.jpeg,.png,.pdf',
  PHOTO: '.jpg,.jpeg,.png',
}

export const DOC_TYPE_MAX_BYTES: Record<string, number> = {
  AADHAAR: 5 * 1024 * 1024,
  VOTER_ID: 5 * 1024 * 1024,
  TVK_ID: 5 * 1024 * 1024,
  PHOTO: 5 * 1024 * 1024,
}
