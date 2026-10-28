/* ── DeckJSON — the structured AI output format ──
   The AI generates this; deck-generator.ts renders it as a
   standalone single-file HTML presentation (RTL, dual-theme). */

export type DeckLanguage = 'fa' | 'en'

export interface DeckCoverSlide {
  type: 'cover'
  badge?: string
  title: string
  subtitle?: string
  author?: string
  date?: string
}

export interface DeckAgendaSlide {
  type: 'agenda'
  kicker?: string
  title: string
  items: string[]
}

export interface DeckBulletsSlide {
  type: 'bullets'
  kicker?: string
  title: string
  items: { title?: string; text: string }[]
}

export interface DeckTwoColumnSlide {
  type: 'two-column'
  kicker?: string
  title: string
  columns: { heading: string; items: string[] }[]
}

export interface DeckStatsSlide {
  type: 'stats'
  kicker?: string
  title: string
  stats: { value: string; label: string; hint?: string }[]
  footnote?: string
}

export interface DeckQuoteSlide {
  type: 'quote'
  quote: string
  author?: string
  role?: string
}

export interface DeckTimelineSlide {
  type: 'timeline'
  kicker?: string
  title: string
  steps: { label: string; title: string; text: string }[]
}

export interface DeckConclusionSlide {
  type: 'conclusion'
  title: string
  points: string[]
  cta?: string
}

export type DeckSlide =
  | DeckCoverSlide
  | DeckAgendaSlide
  | DeckBulletsSlide
  | DeckTwoColumnSlide
  | DeckStatsSlide
  | DeckQuoteSlide
  | DeckTimelineSlide
  | DeckConclusionSlide

export interface DeckJSON {
  title: string
  subtitle?: string
  author?: string
  language: DeckLanguage
  slides: DeckSlide[]
}

export const DECK_ACCENTS = ['blue', 'green', 'orange', 'purple'] as const
export type DeckAccent = (typeof DECK_ACCENTS)[number]

export const ACCENT_LABELS: Record<DeckAccent, string> = {
  blue: 'آبی گوگلی',
  green: 'سبز',
  orange: 'نارنجی',
  purple: 'بنفش',
}

export function isValidDeck(value: unknown): value is DeckJSON {
  if (!value || typeof value !== 'object') return false
  const deck = value as DeckJSON
  return (
    typeof deck.title === 'string' &&
    deck.title.trim().length > 0 &&
    Array.isArray(deck.slides) &&
    deck.slides.length > 0 &&
    deck.slides.every((s) => s && typeof s === 'object' && typeof s.type === 'string')
  )
}
