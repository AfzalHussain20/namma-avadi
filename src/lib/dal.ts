import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseEnv } from '@/lib/supabase/env'

export const getUser = cache(async () => {
  const { url, anonKey } = supabaseEnv()
  if (!url || !anonKey) {
    return null
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export async function requireAdmin() {
  const user = await getUser()
  if (!user) {
    redirect('/admin/login')
  }
  return user
}
