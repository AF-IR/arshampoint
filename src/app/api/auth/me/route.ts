import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getStatus } from '@/lib/mode'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  return NextResponse.json({
    user: user
      ? { id: user.id, email: user.email, name: user.name }
      : null,
    status: getStatus(),
  })
}
