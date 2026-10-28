import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  // In Supabase mode the browser signs out via supabase-js;
  // clearing the cookie is harmless in every mode.
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
