import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { store } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'ابتدا وارد شوید.' }, { status: 401 })
  const { id } = await ctx.params
  const deck = await store().get(user.id, id)
  if (!deck) return NextResponse.json({ error: 'پرزنتیشن پیدا نشد.' }, { status: 404 })
  return NextResponse.json({
    deck: {
      id: deck.id,
      title: deck.title,
      topic: deck.topic,
      audience: deck.audience,
      theme: deck.theme,
      language: deck.language,
      slideCount: deck.slideCount,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    },
  })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'ابتدا وارد شوید.' }, { status: 401 })
  const { id } = await ctx.params
  const ok = await store().remove(user.id, id)
  if (!ok) return NextResponse.json({ error: 'پرزنتیشن پیدا نشد.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
