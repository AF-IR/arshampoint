import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { store } from '@/lib/store'
import { generateDeckWithAI } from '@/lib/deck-ai'
import { generateDeckHTML } from '@/lib/deck-generator'
import { DECK_ACCENTS, type DeckAccent } from '@/lib/deck-types'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'ابتدا وارد شوید.' }, { status: 401 })

  try {
    const decks = await store().list(user.id)
    return NextResponse.json({ decks })
  } catch (err) {
    console.error('[presentations:GET]', err)
    return NextResponse.json(
      { error: 'خواندن کتابخانه پرزنتیشن‌ها ناموفق بود.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'ابتدا وارد شوید.' }, { status: 401 })

  try {
    const body = await req.json().catch(() => null)
    const topic = String(body?.topic ?? '').trim()
    const audience = String(body?.audience ?? '').trim() || undefined
    const tone = String(body?.tone ?? 'حرفه‌ای و رسمی').trim()
    const slideCount = Math.min(14, Math.max(4, Number(body?.slideCount) || 8))
    const language = body?.language === 'en' ? 'en' : 'fa'
    const accentInput = String(body?.accent ?? 'blue')
    const accent: DeckAccent = (DECK_ACCENTS as readonly string[]).includes(accentInput)
      ? (accentInput as DeckAccent)
      : 'blue'

    if (topic.length < 3) {
      return NextResponse.json(
        { error: 'موضوع ارائه را دقیق‌تر بنویسید (حداقل ۳ کاراکتر).' },
        { status: 400 }
      )
    }

    // 1) AI generates structured DeckJSON (Z.ai API key or bundled SDK)
    const deck = await generateDeckWithAI({ topic, audience, slideCount, tone, language })

    // 2) Render standalone HTML from DeckJSON
    const html = generateDeckHTML(deck, { accent })

    // 3) Persist (Supabase Postgres in production, SQLite in local demo)
    const saved = await store().create(user.id, {
      title: deck.title,
      topic,
      audience: audience ?? null,
      theme: accent,
      language: deck.language,
      slideCount: deck.slides.length,
      deckJson: JSON.stringify(deck),
      html,
    })

    return NextResponse.json({ deck: saved })
  } catch (err) {
    console.error('[presentations:POST]', err)
    const msg =
      err instanceof Error && err.message
        ? err.message
        : 'تولید پرزنتیشن با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
