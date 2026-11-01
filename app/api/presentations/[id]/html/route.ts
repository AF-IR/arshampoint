import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { store } from '@/lib/store'

export const dynamic = 'force-dynamic'

/** Serves the standalone generated HTML document.
 * Auth works via Bearer token (Supabase) or session cookie (local demo),
 * so the file can also be opened directly in a browser tab. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) return new Response('ابتدا وارد شوید.', { status: 401 })
  const { id } = await ctx.params
  const deck = await store().get(user.id, id)
  if (!deck) return new Response('پرزنتیشن پیدا نشد.', { status: 404 })

  const download = req.nextUrl.searchParams.get('download') === '1'
  const safeName = deck.title.replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || 'presentation'
  return new Response(deck.html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(safeName)}.html`,
      'Cache-Control': 'no-store',
    },
  })
}
