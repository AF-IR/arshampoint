/**
 * فعال‌سازی دستی pro برای کاربر آزمایشی (تست دور زدن سهمیه).
 * Run: npx tsx scripts/activate-pro-test.ts <email>
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const email = process.argv[2]
if (!email) {
  console.error('usage: tsx scripts/activate-pro-test.ts <email>')
  process.exit(1)
}

async function main() {
  const user = await db.user.findFirst({ where: { email } })
  if (!user) throw new Error('user not found: ' + email)
  await db.subscription.updateMany({ where: { userId: user.id, status: 'active' }, data: { status: 'expired' } })
  const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000)
  await db.subscription.create({
    data: { userId: user.id, plan: 'pro', status: 'active', source: 'manual-test', periodEnd },
  })
  console.log('pro activated for', email, 'until', periodEnd.toISOString())
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
