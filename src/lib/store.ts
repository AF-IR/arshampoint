import { getAppMode } from '@/lib/mode'

/* ─────────────────────────────────────────────────────────────
 * Data store abstraction — two implementations chosen at runtime:
 *
 *   - supabase: Supabase Postgres table `presentations` (production)
 *   - local   : Prisma + SQLite (demo / offline sandbox)
 *
 * All functions are scoped by userId: a user can only ever see
 * and touch their own presentations.
 * ───────────────────────────────────────────────────────────── */

export interface DeckMetaRow {
  id: string
  title: string
  topic: string
  theme: string
  slideCount: number
  language: string
  createdAt: string
  updatedAt?: string
}

export interface DeckFullRow extends DeckMetaRow {
  audience: string | null
  deckJson: string
  html: string
}

export interface NewDeck {
  title: string
  topic: string
  audience?: string | null
  theme: string
  language: string
  slideCount: number
  deckJson: string
  html: string
}

export interface DeckStore {
  list(userId: string): Promise<DeckMetaRow[]>
  get(userId: string, id: string): Promise<DeckFullRow | null>
  create(userId: string, deck: NewDeck): Promise<DeckMetaRow>
  remove(userId: string, id: string): Promise<boolean>
}

/* ── Supabase (production) ── */

const supabaseStore: DeckStore = {
  async list(userId) {
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    const { data, error } = await supabaseAdmin()
      .from('presentations')
      .select(
        'id, title, topic, theme, slide_count, language, created_at, updated_at'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error('خواندن کتابخانه از Supabase ناموفق بود.')
    return (data ?? []).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      topic: r.topic as string,
      theme: r.theme as string,
      slideCount: r.slide_count as number,
      language: r.language as string,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }))
  },

  async get(userId, id) {
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    const { data, error } = await supabaseAdmin()
      .from('presentations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    return {
      id: data.id,
      title: data.title,
      topic: data.topic,
      theme: data.theme,
      slideCount: data.slide_count,
      language: data.language,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      audience: data.audience ?? null,
      deckJson:
        typeof data.deck_json === 'string'
          ? data.deck_json
          : JSON.stringify(data.deck_json),
      html: data.html,
    }
  },

  async create(userId, deck) {
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    const { data, error } = await supabaseAdmin()
      .from('presentations')
      .insert({
        user_id: userId,
        title: deck.title,
        topic: deck.topic,
        audience: deck.audience ?? null,
        theme: deck.theme,
        language: deck.language,
        slide_count: deck.slideCount,
        deck_json: deck.deckJson,
        html: deck.html,
      })
      .select(
        'id, title, topic, theme, slide_count, language, created_at, updated_at'
      )
      .single()
    if (error || !data) throw new Error('ذخیره در Supabase ناموفق بود.')
    return {
      id: data.id,
      title: data.title,
      topic: data.topic,
      theme: data.theme,
      slideCount: data.slide_count,
      language: data.language,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async remove(userId, id) {
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    const { error, count } = await supabaseAdmin()
      .from('presentations')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) return false
    return (count ?? 0) > 0
  },
}

/* ── Local (demo) — Prisma + SQLite, lazily imported so that
 * production deployments without a local DB never touch Prisma. ── */

function iso(v: Date | string): string {
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString()
}

const localStore: DeckStore = {
  async list(userId) {
    const { db } = await import('@/lib/db')
    const rows = await db.presentation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        topic: true,
        theme: true,
        slideCount: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) }))
  },

  async get(userId, id) {
    const { db } = await import('@/lib/db')
    const r = await db.presentation.findFirst({ where: { id, userId } })
    if (!r) return null
    return {
      id: r.id,
      title: r.title,
      topic: r.topic,
      theme: r.theme,
      slideCount: r.slideCount,
      language: r.language,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
      audience: r.audience,
      deckJson: r.deckJson,
      html: r.html,
    }
  },

  async create(userId, deck) {
    const { db } = await import('@/lib/db')
    const r = await db.presentation.create({
      data: {
        userId,
        title: deck.title,
        topic: deck.topic,
        audience: deck.audience ?? null,
        theme: deck.theme,
        language: deck.language,
        slideCount: deck.slideCount,
        deckJson: deck.deckJson,
        html: deck.html,
      },
    })
    return {
      id: r.id,
      title: r.title,
      topic: r.topic,
      theme: r.theme,
      slideCount: r.slideCount,
      language: r.language,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    }
  },

  async remove(userId, id) {
    const { db } = await import('@/lib/db')
    const r = await db.presentation.findFirst({ where: { id, userId } })
    if (!r) return false
    await db.presentation.delete({ where: { id } })
    return true
  },
}

export function store(): DeckStore {
  return getAppMode() === 'supabase' ? supabaseStore : localStore
}
