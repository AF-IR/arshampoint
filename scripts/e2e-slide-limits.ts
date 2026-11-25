/* E2E: سقف تعداد اسلاید بر اساس پلن — روی سرور dev (پورت ۳۰۰۰)
 *   free  + slideCount=12 → 402 proFeature (پیام ارتقا)
 *   free  + slideCount=1  → 200 و دقیقاً ۱ اسلاید (جلد)
 *   pro   + slideCount=14 → 200 و دقیقاً ۱۴ اسلاید
 * اجرا: npx tsx scripts/e2e-slide-limits.ts */
const BASE = process.env.E2E_BASE || 'http://localhost:3000'

interface Jar { cookie: string }
const jars: Record<string, Jar> = { free: { cookie: '' }, pro: { cookie: '' } }

async function api(
  jar: Jar,
  path: string,
  body?: unknown
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${BASE}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jar.cookie ? { Cookie: jar.cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) jar.cookie = setCookie.split(';')[0]
  let json: Record<string, unknown> = {}
  try {
    json = await res.json()
  } catch {}
  return { status: res.status, json }
}

let fail = 0
function check(name: string, cond: boolean, extra = '') {
  console.log(`${cond ? '✓' : '✗'} ${name}${cond ? '' : ` — ${extra}`}`)
  if (!cond) fail++
}

async function main() {
  /* 1) کاربر رایگان تازه */
  const email = `slide-limits-${Date.now()}@apoint.ir`
  const reg = await api(jars.free, '/api/auth/register', {
    email,
    password: 'slide1234',
    name: 'تست سقف اسلاید',
  })
  check('ثبت‌نام کاربر رایگان', reg.status === 200 || reg.status === 201, JSON.stringify(reg.json))

  /* 2) درخواست ۱۲ اسلاید با پلن رایگان → ۴۰۲ */
  const r12 = await api(jars.free, '/api/presentations', {
    topic: 'تست سقف اسلاید پلن رایگان',
    slideCount: 12,
  })
  check('free+12 → 402', r12.status === 402, `status=${r12.status}`)
  check('free+12 → proFeature', r12.json.proFeature === true)
  check(
    'free+12 → پیام ارتقا',
    String(r12.json.error ?? '').includes('پلن حرفه‌ای') || String(r12.json.error ?? '').includes('ارتقا'),
    String(r12.json.error ?? '')
  )

  /* 3) درخواست ۱ اسلاید → ۲۰۰ و دقیقاً ۱ اسلاید */
  const r1 = await api(jars.free, '/api/presentations', {
    topic: 'معرفی واحد tests تیم محصول',
    slideCount: 1,
  })
  check('free+1 → 200', r1.status === 200, `status=${r1.status} ${JSON.stringify(r1.json).slice(0, 200)}`)
  const deck1 = (r1.json.deck ?? r1.json.presentation) as { slides?: unknown[] } | undefined
  const slides1 = (deck1?.slides as unknown[] | undefined) ?? (r1.json.slides as unknown[] | undefined)
  if (slides1) {
    check(`free+1 → دقیقاً ۱ اسلاید (${(slides1 as { type?: string }[]).map((s) => (s as { type?: string }).type)})`, slides1.length === 1)
  } else {
    /* پاسخ ممکنه فقط id برگرداند — از GET کتابخانه می‌خوانیم */
    const lib = await api(jars.free, '/api/presentations')
    const decks = (lib.json.decks ?? []) as { slideCount?: number; slides?: unknown[] }[]
    const mine = decks[0]
    check('free+1 → کتابخانه ۱ اسلاید', (mine?.slideCount ?? mine?.slides?.length ?? -1) === 1, JSON.stringify(lib.json).slice(0, 300))
  }

  /* 4) کاربر پرو (حساب تست اشتراک فعال) → ۱۴ اسلاید */
  const login = await api(jars.pro, '/api/auth/login', {
    email: 'final-e2e@apoint.ir',
    password: 'final123456',
  })
  check('ورود کاربر پرو', login.status === 200, JSON.stringify(login.json).slice(0, 150))
  const usage = await api(jars.pro, '/api/usage')
  check('پلن کاربر = pro', (usage.json.usage as { plan?: string } | undefined)?.plan === 'pro', JSON.stringify(usage.json).slice(0, 150))

  const r14 = await api(jars.pro, '/api/presentations', {
    topic: 'بررسی سقف اسلاید پلن حرفه‌ای آرشام پوینت',
    slideCount: 14,
    style: 'persian',
  })
  check('pro+14 → 200', r14.status === 200, `status=${r14.status} ${JSON.stringify(r14.json).slice(0, 200)}`)
  const deck14 = (r14.json.deck ?? r14.json.presentation) as { slides?: unknown[] } | undefined
  const slides14 = (deck14?.slides as unknown[] | undefined) ?? (r14.json.slides as unknown[] | undefined)
  if (slides14) {
    check(`pro+14 → دقیقاً ۱۴ اسلاید (${slides14.length})`, slides14.length === 14)
  } else {
    const lib = await api(jars.pro, '/api/presentations')
    const decks = (lib.json.decks ?? []) as { slideCount?: number }[]
    check('pro+14 → کتابخانه ۱۴ اسلاید', decks[0]?.slideCount === 14, JSON.stringify(lib.json).slice(0, 300))
  }

  console.log(fail === 0 ? '\n✅ E2E سقف اسلاید کامل سبز' : `\n❌ ${fail} مورد رد`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('E2E crashed:', e)
  process.exit(1)
})

/* این فایل را ماژول می‌کند تا با سایر اسکریپت‌های بدون import تداخل اسکوپ سراسری نگیرد */
export {}
