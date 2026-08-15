'use server'

import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { supabaseEnv } from '@/lib/supabase/env'

// Resolves the auth email behind a friendly "user ID" stored in user metadata.
// Uses the service-role client directly since this never leaves the server.
async function findEmailByUserId(userId: string): Promise<string | null> {
  const { url, serviceRoleKey } = supabaseEnv()
  if (!url || !serviceRoleKey) return null

  const admin = createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error || !data) return null

  const match = data.users.find(
    (u) => String(u.user_metadata?.user_id ?? '').toLowerCase() === userId.toLowerCase()
  )
  return match?.email ?? null
}

export async function signIn(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const userId = String(formData.get('user_id') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!userId || !password) {
    return { error: 'Enter your user ID and password.' }
  }

  const email = await findEmailByUserId(userId)
  if (!email) {
    return { error: 'Invalid user ID or password.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid user ID or password.' }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function changePassword(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
