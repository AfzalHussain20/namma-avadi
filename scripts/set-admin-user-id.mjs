// Sets a friendly "User ID" on an existing admin auth user so they can sign in
// with a user ID + password instead of an email address.
// SERVER-SIDE ONLY — uses the service role key, never shipped to the browser.
//
// Usage:
//   npm run set-admin-user-id -- --email=admin@namma-avadi.in --user-id=admin
//   npm run set-admin-user-id -- --email=admin@namma-avadi.in --user-id=admin --password="secret"
//
// Requires .env.local to be populated.

import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv(file) {
  const abs = path.resolve(__dirname, '..', file)
  const out = {}
  if (!fs.existsSync(abs)) return out
  for (const line of fs.readFileSync(abs, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

const env = { ...process.env, ...loadEnv('.env.local') }

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY

if (!url || !serviceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
const email = args.find((a) => a.startsWith('--email='))?.split('=')[1]
const userId = args.find((a) => a.startsWith('--user-id='))?.split('=')[1]
const password = args.find((a) => a.startsWith('--password='))?.split('=')[1]

if (!email || !userId) {
  console.error('Usage: npm run set-admin-user-id -- --email=admin@namma-avadi.in --user-id=admin [--password=secret]')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } })

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
})

if (listError) {
  console.error('Failed to list users:', listError.message)
  process.exit(1)
}

const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
if (!user) {
  console.error(`No user found with email ${email}`)
  process.exit(1)
}

const updates = password
  ? { password, user_metadata: { role: 'admin', user_id: userId } }
  : { user_metadata: { role: 'admin', user_id: userId } }

const { data, error } = await supabase.auth.admin.updateUserById(user.id, updates)

if (error) {
  console.error('Failed to update user:', error.message)
  process.exit(1)
}

console.log(`User ID set: ${data.user.user_metadata.user_id} → ${data.user.email}${password ? ' (password updated)' : ''}`)
