/* ─────────────────────────────────────────────────────────────
 * Seed script — creates the demo/test account and 2 sample decks.
 * Run:  bun scripts/seed-demo.ts
 * Idempotent: skips whatever already exists.
 * ───────────────────────────────────────────────────────────── */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { generateDeckWithAI } from '../src/lib/deck-ai'
import { generateDeckHTML } from '../src/lib/deck-generator'

/* scrypt hashing — same format as src/lib/auth.ts */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

const db = new PrismaClient({ log: ['warn', 'error'] })

const DEMO = {
  email: 'demo@arshampoint.ir',
  password: '123456',
  name: 'آرشام (دمو)',
}

const SAMPLES = [
  {
    topic: 'هوش مصنوعی مولد برای کسب‌وکارها',
    audience: 'مدیران و صاحبان کسب‌وکار',
    tone: 'حرفه‌ای و رسمی',
    slideCount: 8,
    language: 'fa' as const,
    accent: 'blue',
  },
  {
    topic: 'مهارت‌های ارائه و سخنوری حرفه‌ای',
    audience: 'دانشجویان و مدرسان',
    tone: 'آموزشی و ساده',
    slideCount: 6,
    language: 'fa' as const,
    accent: 'orange',
  },
]

async function main() {
  // 1) demo user
  let user = await db.user.findUnique({ where: { email: DEMO.email } })
  if (!user) {
    user = await db.user.create({
      data: {
        email: DEMO.email,
        name: DEMO.name,
        passwordHash: hashPassword(DEMO.password),
      },
    })
    console.log(`✔ demo user created: ${DEMO.email} / ${DEMO.password}`)
  } else {
    console.log(`• demo user already exists: ${DEMO.email}`)
  }

  // 2) sample decks for the demo user
  const existing = await db.presentation.count({ where: { userId: user.id } })
  if (existing >= 2) {
    console.log(`• demo user already has ${existing} decks — skip generation`)
    return
  }

  let firstHtml: string | null = null

  for (const s of SAMPLES) {
    const already = await db.presentation.findFirst({
      where: { userId: user.id, topic: s.topic },
    })
    if (already) {
      if (!firstHtml) firstHtml = already.html
      continue
    }
    console.log(`… generating: ${s.topic}`)
    try {
      const deck = await generateDeckWithAI({
        topic: s.topic,
        audience: s.audience,
        slideCount: s.slideCount,
        tone: s.tone,
        language: s.language,
        visualMode: 'offline',
      })
      const html = generateDeckHTML(deck, { accent: s.accent as 'blue' })
      await db.presentation.create({
        data: {
          userId: user.id,
          title: deck.title,
          topic: s.topic,
          audience: s.audience,
          theme: s.accent,
          language: deck.language,
          slideCount: deck.slides.length,
          deckJson: JSON.stringify(deck),
          html,
        },
      })
      if (!firstHtml) firstHtml = html
      console.log(`  ✔ «${deck.title}» (${deck.slides.length} slides)`)
    } catch (err) {
      console.error(`  ✖ failed for "${s.topic}":`, err instanceof Error ? err.message : err)
    }
  }

  // 3) public showcase file for the landing page
  if (firstHtml) {
    const outDir = path.join(process.cwd(), 'public', 'samples')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'showcase.html'), firstHtml, 'utf8')
    console.log(`✔ public/samples/showcase.html written (${(firstHtml.length / 1024).toFixed(0)} KB)`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
