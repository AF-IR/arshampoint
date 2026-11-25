import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getUsage } from '@/lib/plan'

export const dynamic = 'force-dynamic'

/* GET /api/usage — plan + daily quota status (rolling 24h window)
 * for the signed-in user. Used by the account page (plan badge +
 * usage bar) and the dashboard. */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'ابتدا وارد شوید.' }, { status: 401 })

  try {
    const usage = await getUsage(user.id)
    return NextResponse.json({ usage })
  } catch (err) {
    console.error('[usage:GET]', err)
    return NextResponse.json({ error: 'خواندن وضعیت مصرف ناموفق بود.' }, { status: 500 })
  }
}
