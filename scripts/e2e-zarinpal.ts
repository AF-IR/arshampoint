/**
 * E2E کامل جریان پرداخت زرین‌پال روی سرور واقعی اپ + فیک‌گیت‌وی.
 * پیش‌نیاز:
 *   1) npx tsx scripts/fake-zarinpal.ts            (درگاه ماک روی 3999)
 *   2) سرور اپ با ZARINPAL_MERCHANT_ID و ZARINPAL_BASE_URL=http://localhost:3999
 * Run: E2E_BASE=http://localhost:3100 npx tsx scripts/e2e-zarinpal.ts
 *
 * سناریوها: پرداخت موفق + فعال‌سازی ۳۰ روزه، رفرش کال‌بک (۱۰۱) بدون تمدید،
 * امضای دستکاری‌شده، انصراف از پرداخت (NOK).
 */
const BASE = process.env.E2E_BASE || 'http://localhost:3100'
const GATEWAY = process.env.FAKE_ZP_URL || 'http://localhost:3999'
const DAY_MS = 24 * 60 * 60 * 1000

let pass = 0
let fail = 0
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    pass++
    console.log('✓', name)
  } else {
    fail++
    console.error('✗', name, extra ?? '')
  }
}

async function registerUser(stamp: number, tag: string): Promise<string> {
  const email = `zpe2e-${tag}-${stamp}@apoint.ir`
  const password = 'Test!1234'
  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'تست پرداخت', email, password }),
  })
  const cookie = (reg.headers.get('set-cookie') ?? '').split(';')[0]
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ email, password }),
  })
  return (login.headers.get('set-cookie') ?? '').split(';')[0] || cookie
}

interface Usage {
  plan?: string
  unlimited?: boolean
  periodEnd?: string | null
}
async function usage(cookie: string): Promise<Usage> {
  const res = await fetch(`${BASE}/api/usage`, { headers: { Cookie: cookie } })
  const body = (await res.json().catch(() => ({}))) as { usage?: Usage }
  return body?.usage ?? {}
}

/* یک دور کامل request → StartPay → verify؛ ریدایرکت‌ها دستی دنبال می‌شوند
 * تا هر مرحله قابل بررسی باشد. nok=1 = انصراف از پرداخت */
async function payFlow(
  cookie: string,
  nok: boolean
): Promise<{ ok: boolean; verifyUrl?: string; finalLocation?: string; authority?: string }> {
  const reqRes = await fetch(`${BASE}/api/billing/zarinpal/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({}),
  })
  const reqBody = (await reqRes.json().catch(() => ({}))) as {
    redirectUrl?: string
    authority?: string
    amount?: number
  }
  if (!reqRes.ok || !reqBody.redirectUrl) {
    console.log('request failed:', reqRes.status, JSON.stringify(reqBody).slice(0, 200))
    return { ok: false }
  }
  const startUrl = `${reqBody.redirectUrl}${nok ? '?nok=1' : ''}`
  const startRes = await fetch(startUrl, { redirect: 'manual' })
  const verifyUrl = startRes.headers.get('location')
  if (startRes.status !== 302 || !verifyUrl) {
    console.log('StartPay unexpected:', startRes.status, startRes.headers.get('location'))
    return { ok: false, authority: reqBody.authority }
  }
  const verifyRes = await fetch(verifyUrl, { redirect: 'manual' })
  return {
    ok: true,
    verifyUrl,
    finalLocation: verifyRes.headers.get('location') ?? '',
    authority: reqBody.authority,
  }
}

async function main() {
  const stamp = Date.now()

  /* ── ۱) ثبت‌نام کاربر خریدار ── */
  const cookieA = await registerUser(stamp, 'a')
  check('ثبت‌نام کاربر A', Boolean(cookieA))

  /* ── ۲) شروع پرداخت: request → redirectUrl به سمت فیک‌گیت‌وی ── */
  const reqRes = await fetch(`${BASE}/api/billing/zarinpal/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({}),
  })
  const reqBody = (await reqRes.json().catch(() => ({}))) as {
    redirectUrl?: string
    authority?: string
    amount?: number
  }
  check('request → 200', reqRes.status === 200, String(reqRes.status))
  check(
    'redirectUrl به فیک‌گیت‌وی StartPay اشاره می‌کند',
    Boolean(reqBody.redirectUrl?.startsWith(`${GATEWAY}/pg/StartPay/`)),
    reqBody.redirectUrl
  )
  check('authority غیرخالی', Boolean(reqBody.authority))
  check('مبلغ ۱۴۹۰۰۰۰ ریال', reqBody.amount === 1_490_000, String(reqBody.amount))

  /* ── ۳) رفتن به درگاه → بازگشت به verify → success + کد پیگیری ── */
  const startRes = await fetch(`${reqBody.redirectUrl}`, { redirect: 'manual' })
  const verifyUrl = startRes.headers.get('location') ?? ''
  check('StartPay → 302 به verify با Status=OK', startRes.status === 302 && verifyUrl.includes('Status=OK'), verifyUrl)

  const verifyRes = await fetch(verifyUrl, { redirect: 'manual' })
  const loc = verifyRes.headers.get('location') ?? ''
  /* NextResponse.redirect پیش‌فرض 307 می‌دهد — محتوای Location ملاک است */
  check('verify → redirect به checkout?payment=success', loc.includes('/checkout?payment=success'), loc)
  const ref = new URL(loc).searchParams.get('ref') ?? ''
  check('کد پیگیری در ریدایرکت هست', /^\d{4,12}$/.test(ref), ref)

  /* ── ۴) اشتراک: pro + دقیقاً ۳۰ روز ── */
  const u1 = await usage(cookieA)
  check('usage → plan=pro', u1.plan === 'pro', JSON.stringify(u1))
  check('usage → unlimited', u1.unlimited === true)
  const endMs = u1.periodEnd ? new Date(u1.periodEnd).getTime() - Date.now() : NaN
  check('دوره ≈ ۳۰ روز', endMs > 29.9 * DAY_MS && endMs < 30.05 * DAY_MS, `${(endMs / DAY_MS).toFixed(3)} روز`)
  const periodEndBefore = u1.periodEnd ?? ''

  /* ── ۵) رفرش کال‌بک (کد ۱۰۱) → موفق ولی دوره تمدید نمی‌شود ── */
  const verifyRes2 = await fetch(verifyUrl, { redirect: 'manual' })
  const loc2 = verifyRes2.headers.get('location') ?? ''
  check('رفرش verify → همان success', loc2.includes('payment=success'), loc2)
  const u2 = await usage(cookieA)
  check(
    'رفرش کال‌بک دوره را تمدید نمی‌کند (باگ پولی)',
    u2.periodEnd === periodEndBefore,
    `before=${periodEndBefore} after=${u2.periodEnd}`
  )

  /* ── ۶) امضای دستکاری‌شده → failed و بدون آسیب به اشتراک واقعی ── */
  check('verifyUrl شامل uid و sig است', verifyUrl.includes('uid=') && verifyUrl.includes('sig='))
  /* sig کاربر A جعل می‌شود؛ فقط همین درخواست reject می‌شود نه اشتراک معتبر */
  const tampered = verifyUrl.replace(/sig=[0-9a-f]+/, 'sig=deadbeefdeadbeefdeadbeefdeadbeef')
  const tamperedRes = await fetch(tampered, { redirect: 'manual' })
  const tamperedLoc = tamperedRes.headers.get('location') ?? ''
  check('امضای جعلی → redirect به payment=failed', tamperedLoc.includes('payment=failed'), tamperedLoc)
  /* کاربر A همچنان pro — دستکاری فقط خودش را reject می‌کند */
  check('بعد از دستکاری، اشتراک A سالم ماند', (await usage(cookieA)).plan === 'pro')

  /* ── ۷) انصراف از پرداخت (NOK) → failed و پلن free ── */
  const cookieC = await registerUser(stamp, 'c')
  const cFlow = await payFlow(cookieC, true)
  check('جریان NOK کامل شد', cFlow.ok)
  check('NOK → 302 payment=failed', Boolean(cFlow.finalLocation?.includes('payment=failed')), cFlow.finalLocation)
  const u3 = await usage(cookieC)
  check('پس از انصراف، پلن کاربر C free ماند', u3.plan !== 'pro', JSON.stringify(u3))

  console.log(`\n${fail === 0 ? '✅ E2E پرداخت کامل سبز' : '❌ شکست'} — ${pass} گذرونده، ${fail} رد`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error('E2E crashed:', e)
  process.exit(1)
})

/* این فایل را ماژول می‌کند تا با سایر اسکریپت‌های بدون import تداخل اسکوپ سراسری نگیرد */
export {}
