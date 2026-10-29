import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, signToken, setSessionCookie } from '@/lib/auth'
import { getStatus } from '@/lib/mode'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)

  /* Cookie mirror (persistent login): whenever a request authenticates
   * successfully — via Supabase Bearer token OR the mirror cookie itself —
   * (re)issue the 30-day signed httpOnly cookie. This does two things:
   *  1. First write happens right after login/restoration, so returning
   *     visitors survive browsers that clear localStorage (Safari ITP,
   *     privacy webviews).
   *  2. Sliding session — every visit extends the window another 30 days. */
  if (user) {
    await setSessionCookie(signToken(user.id, user.email, user.name))
  }

  return NextResponse.json({
    user: user
      ? { id: user.id, email: user.email, name: user.name }
      : null,
    status: getStatus(),
  })
}
