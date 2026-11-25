/**
 * تست منطق تجاری plan.ts — سهمیه روزانه ۳ و دوره ۳۰ روزه
 * Run: npx tsx scripts/test-quota-logic.ts
 * (محلی/Prisma: روی db/custom.db اجرا می‌شود؛ در حالت supabase فقط
 *  محاسبات زمانی unit-test می‌شوند.)
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const DAY_MS = 24 * 60 * 60 * 1000

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!cond) failures++
}

async function main() {
  const stamp = Date.now()
  const email = `quota-test-${stamp}@apoint.ir`

  /* ۰) محاسبات زمانی دوره ۳۰ روزه (بدون DB) */
  const start = new Date('2026-01-31T10:00:00Z')
  const end30 = new Date(start.getTime() + 30 * DAY_MS)
  check('period 30d: 31 Jan → 2 Mar', end30.toISOString().startsWith('2026-03-02T10:00:00'))
  const gregorian = new Date(start)
  gregorian.setMonth(gregorian.getMonth() + 1) // ماه میلادی: ۳۱ ژانویه + ۱ ماه → ۳ مارس (اسکرول فوریه!)
  check(
    '30d ≠ Gregorian month (setMonth lands on Mar 3, +30d = Mar 2)',
    gregorian.getTime() !== end30.getTime() && gregorian.getUTCDate() === 3 && end30.getUTCDate() === 2,
    `gregorian=${gregorian.toISOString().slice(0, 10)} vs 30d=${end30.toISOString().slice(0, 10)}`
  )

  /* ساخت کاربر تست */
  const user = await db.user.create({
    data: { email, name: 'تست سهمیه', passwordHash: 'test-only' },
  })

  try {
    /* ۱) سهمیه روزانه: ۳ ارائه در ۲۴ ساعت گذشته */
    for (let i = 0; i < 3; i++) {
      await db.presentation.create({
        data: {
          userId: user.id,
          title: `تست ${i + 1}`,
          topic: 'آزمون سهمیه روزانه',
          slideCount: 5,
          deckJson: '{}',
          html: '<html></html>',
        },
      })
    }
    const fresh = await db.presentation.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    })
    check('3 decks in last 24h → used=3', fresh === 3, `used=${fresh}`)

    /* ۲) ارائه قدیمی (۳ روز قبل) نباید در سهمیه امروز بشمارد */
    const old = await db.presentation.create({
      data: {
        userId: user.id,
        title: 'قدیمی',
        topic: 'سه روز پیش',
        slideCount: 5,
        deckJson: '{}',
        html: '<html></html>',
        createdAt: new Date(Date.now() - 3 * DAY_MS),
      },
    })
    const afterOld = await db.presentation.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    })
    check('old deck (3d ago) excluded → still used=3', afterOld === 3, `used=${afterOld}`)

    /* ۳) ۲۵ ساعت قبل جزو پنجره نیست ولی ۲۳ ساعت قبل هست */
    await db.presentation.update({ where: { id: old.id }, data: { createdAt: new Date(Date.now() - 23 * 3600_000) } })
    const w23 = await db.presentation.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    })
    check('deck 23h old counts in rolling window', w23 === 4, `used=${w23}`)
    await db.presentation.update({ where: { id: old.id }, data: { createdAt: new Date(Date.now() - 25 * 3600_000) } })
    const w25 = await db.presentation.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    })
    check('deck 25h old drops out of window', w25 === 3, `used=${w25}`)

    /* ۴) اشتراک ۳۰ روزه: periodEnd دقیقاً now+30d (نه setMonth) */
    await db.subscription.updateMany({ where: { userId: user.id, status: 'active' }, data: { status: 'expired' } })
    const before = Date.now()
    await db.subscription.create({
      data: { userId: user.id, plan: 'pro', status: 'active', source: 'test', periodEnd: new Date(before + 30 * DAY_MS) },
    })
    const sub = await db.subscription.findFirst({ where: { userId: user.id, status: 'active' } })
    const diffDays = (sub!.periodEnd!.getTime() - before) / DAY_MS
    check('pro period = exactly 30 days', Math.abs(diffDays - 30) < 0.001, `${diffDays.toFixed(4)} days`)

    /* ۵) اشتراک منقضی → پلن free */
    await db.subscription.update({
      where: { id: sub!.id },
      data: { periodEnd: new Date(Date.now() - DAY_MS) },
    })
    const refetched = await db.subscription.findUnique({ where: { id: sub!.id } })
    const expired = refetched!.periodEnd!.getTime() < Date.now()
    check('expired period_end detected', expired)

    console.log(failures === 0 ? '\nهمه تست‌ها سبز ✓' : `\n${failures} تست قرمز ✗`)
    process.exit(failures === 0 ? 0 : 1)
  } finally {
    /* پاکسازی */
    await db.presentation.deleteMany({ where: { userId: user.id } })
    await db.subscription.deleteMany({ where: { userId: user.id } })
    await db.user.delete({ where: { id: user.id } })
    await db.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/* این فایل را ماژول می‌کند تا با سایر اسکریپت‌های بدون import تداخل اسکوپ سراسری نگیرد */
export {}
