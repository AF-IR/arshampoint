import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfigured } from '@/lib/mode'

/* ─────────────────────────────────────────────────────────────
 * Server-side Supabase client (service role).
 *
 * The service-role key bypasses Row Level Security, so it must ONLY
 * be used inside API routes — never sent to the browser.
 * ───────────────────────────────────────────────────────────── */

let admin: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (!supabaseConfigured()) {
    throw new Error('Supabase پیکربندی نشده است.')
  }
  if (!admin) {
    admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return admin
}

export interface SupaUser {
  id: string
  email: string
  name: string | null
}

/** Verify a Supabase access token (JWT) and return the user. */
export async function verifySupabaseToken(
  token: string
): Promise<SupaUser | null> {
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token)
    if (error || !data.user) return null
    const u = data.user
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>
    return {
      id: u.id,
      email: u.email ?? '',
      name:
        (typeof meta.name === 'string' && meta.name.trim()) ||
        (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
        null,
    }
  } catch {
    return null
  }
}
