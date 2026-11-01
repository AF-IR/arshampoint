import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { store } from '@/lib/store'
import { generateDeckWithAI } from '@/lib/deck-ai'
import { generateDeckHTML } from '@/lib/deck-generator'
import { DECK_ACCENTS, isDeckLayout, type DeckAccent } from '@/lib/deck-types'
import { isDeckStyle, pickStyleForTopic, type DeckStyle } from '@/lib/deck-styles'
import { getPlan, getUsage, quotaExceededMessage } from '@/lib/plan'

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
    /* حالت بصری: آفلاین (متنی) یا دارای تصویر (درج لینک تصاویر) */
    const visualMode = body?.visualMode === 'image' ? 'image' : 'offline'
    const imageLinks: string[] | undefined =
      visualMode === 'image' && Array.isArray(body?.imageLinks)
        ? body.imageLinks
            .map((u: unknown) => String(u ?? '').trim())
            .filter((u: string) => /^https?:\/\/\S+$/.test(u) && u.length <= 500)
            .slice(0, 12)
        : undefined
    /* نام تهیه‌کنندگان/اعضا — ویژگی رایگان؛ روی جلد و اسلاید پایانی درج می‌شود.
     * فقط ورودی کاربر پذیرفته می‌شود (مدل اجازه ساخت نام ندارد). */
    const authors: string[] | undefined = Array.isArray(body?.authors)
      ? body.authors
          .map((a: unknown) => String(a ?? '').trim().slice(0, 60))
          .filter((a: string) => a.length > 0)
          .slice(0, 6)
      : undefined
    /* قالب طراحی + نوع اسلایدها — انتخاب دستی ویژه پلن حرفه‌ای */
    const styleInput = String(body?.style ?? 'auto').trim()
    const layoutsInput: string[] = Array.isArray(body?.layouts)
      ? body.layouts.map((l: unknown) => String(l ?? '').trim()).filter((l: string) => isDeckLayout(l))
      : []
    const wantsManualStyle = styleInput !== 'auto' && styleInput !== ''
    const wantsManualLayouts = layoutsInput.length > 0

    if (topic.length < 3) {
      return NextResponse.json(
        { error: 'موضوع ارائه را دقیق‌تر بنویسید (حداقل ۳ کاراکتر).' },
        { status: 400 }
      )
    }

    /* ── COMMERCE: کنترل دستی طراحی، ویژگی پلن حرفه‌ای ── */
    if (wantsManualStyle || wantsManualLayouts) {
      const plan = await getPlan(user.id)
      if (plan !== 'pro') {
        return NextResponse.json(
          {
            proFeature: true,
            error:
              'انتخاب دستی قالب طراحی و نوع اسلایدها ویژه پلن حرفه‌ای است. در پلن رایگان قالب به‌صورت هوشمند و متناسب با موضوع انتخاب می‌شود؛ برای کنترل کامل طراحی به حرفه‌ای ارتقا دهید.',
          },
          { status: 402 }
        )
      }
    }
    const style: DeckStyle = wantsManualStyle && isDeckStyle(styleInput) ? styleInput : pickStyleForTopic(topic)
    const preferredLayouts = wantsManualLayouts
      ? layoutsInput.filter((l, i, arr) => arr.indexOf(l) === i).slice(0, 4)
      : undefined

    /* ── COMMERCE: سهمیه روزانه پلن رایگان (۳ ارائه در هر ۲۴ ساعت) — پلن حرفه‌ای نامحدود ── */
    const usage = await getUsage(user.id)
    if (!usage.unlimited && usage.used >= usage.quota) {
      return NextResponse.json(
        {
          error: quotaExceededMessage(usage),
          quotaExceeded: true,
          usage,
        },
        { status: 402 } /* Payment Required */
      )
    }

    // 1) AI generates structured DeckJSON (Z.ai API key or bundled SDK)
    const deck = await generateDeckWithAI({ topic, audience, slideCount, tone, language, visualMode, imageLinks, preferredLayouts })

    /* نام تهیه‌کنندگان — پس از تولید محتوا از ورودی کاربر تزریق می‌شود */
    if (authors && authors.length) deck.authors = authors

    // 2) Render standalone HTML from DeckJSON
    //    برندینگ (اعتبار «آرشام پوینت» در نوار کنترل) فقط برای پلن حرفه‌ای حذف می‌شود
    //    قالب طراحی: انتخاب دستی (pro) یا هوشمند بر اساس موضوع
    const html = generateDeckHTML(deck, { accent, branding: usage.plan !== 'pro', style })

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
