// Creates an admin login user in Supabase Auth.
// SERVER-SIDE ONLY — uses the service role key, never shipped to the browser.
//
// Usage:
//   npm run create-admin -- --email admin@namma-avadi.in --password "change-me"
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

const url =
  env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY

if (!url || !serviceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
const email = args.find((a) => a.startsWith('--email='))?.split('=')[1]
const password = args.find((a) => a.startsWith('--password='))?.split('=')[1]

if (!email || !password) {
  console.error('Usage: npm run create-admin -- --email=admin@example.in --password=secret')
  process.exit(1)
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } })

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { role: 'admin' },
})

if (error) {
  console.error('Failed to create admin:', error.message)
  process.exit(1)
}

console.log(`Admin created: ${data.user.email} (${data.user.id})`)
