import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { supabaseEnv } from '@/lib/supabase/env'
import type { Database } from '@/lib/supabase/types'

export const BUCKET = 'member-documents'

// Service-role (secret key) client — server only. Used to generate signed
// URLs for private objects and to remove objects. Never shipped to the browser.
function createStorageAdmin() {
  const { url, serviceRoleKey } = supabaseEnv()
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function getSignedUrls(paths: string[], expiresIn = 3600) {
  if (paths.length === 0) return []
  const { data, error } = await createStorageAdmin()
    .storage.from(BUCKET)
    .createSignedUrls(paths, expiresIn)
  if (error) return []
  return data.map((d) => (d.error ? null : d.signedUrl)).filter(Boolean) as string[]
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const urls = await getSignedUrls([path], expiresIn)
  return urls[0] ?? null
}

export async function removeObjects(paths: string[]) {
  if (paths.length === 0) return
  await createStorageAdmin().storage.from(BUCKET).remove(paths)
}
