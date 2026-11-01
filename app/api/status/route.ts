import { NextResponse } from 'next/server'
import { getStatus } from '@/lib/mode'

export const dynamic = 'force-dynamic'

/** Runtime configuration status — consumed by the UI status badge
 * and the in-app deployment guide. Never exposes any secret. */
export async function GET() {
  return NextResponse.json({ status: getStatus() })
}
