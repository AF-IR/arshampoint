/**
 * تست واحد helpers زرین‌پال — انتخاب درگاه (پروداکشن/سندباکس/سفارشی)،
 * مبلغ، امضا و کد پیگیری. بدون سرور و بدون شبکه.
 * Run: npx tsx scripts/test-zarinpal.ts
 */
import { zarinpalGateway, zarinpalAmount, paymentSignature, safeRefId } from '../src/lib/zarinpal'

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

/* چند متغیر محیطی را موقتاً می‌گذارد و در پایان برمی‌گرداند */
function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const old: Record<string, string | undefined> = {}
  for (const k of Object.keys(vars)) old[k] = process.env[k]
  try {
    for (const [k, v] of Object.entries(vars)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
    return fn()
  } finally {
    for (const [k, v] of Object.entries(old)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  }
}

/* ── ۱) درگاه پیش‌فرض = پروداکشن ── */
check(
  'default gateway → production',
  withEnv({ ZARINPAL_BASE_URL: undefined, ZARINPAL_SANDBOX: undefined }, () => {
    const g = zarinpalGateway()
    return (
      g.request === 'https://payment.zarinpal.com/pg/v4/payment/request.json' &&
      g.verify === 'https://payment.zarinpal.com/pg/v4/payment/verify.json' &&
      g.startPay === 'https://payment.zarinpal.com/pg/StartPay/'
    )
  })
)

/* ── ۲) سندباکس رسمی ── */
check(
  'ZARINPAL_SANDBOX=1 → sandbox.zarinpal.com',
  withEnv({ ZARINPAL_SANDBOX: '1', ZARINPAL_BASE_URL: undefined }, () =>
    zarinpalGateway().request.startsWith('https://sandbox.zarinpal.com/pg/v4/')
  )
)

/* ── ۳) درگاه سفارشی بر سندباکس مقدم است + اسلش پایانی حذف می‌شود ── */
check(
  'ZARINPAL_BASE_URL overrides sandbox, strips trailing slash',
  withEnv({ ZARINPAL_SANDBOX: '1', ZARINPAL_BASE_URL: 'http://localhost:3999/' }, () => {
    const g = zarinpalGateway()
    return (
      g.request === 'http://localhost:3999/pg/v4/payment/request.json' &&
      g.startPay === 'http://localhost:3999/pg/StartPay/'
    )
  })
)

/* ── ۴) مبلغ: پیش‌فرض، کف ۱۰ هزار ریال، مقدار سفارشی ── */
check(
  'amount default 1490000',
  withEnv({ ZARINPAL_AMOUNT_RIALS: undefined }, () => zarinpalAmount() === 1_490_000)
)
check(
  'amount clamped to ≥10000',
  withEnv({ ZARINPAL_AMOUNT_RIALS: '5000' }, () => zarinpalAmount() === 10_000)
)
check(
  'amount env override',
  withEnv({ ZARINPAL_AMOUNT_RIALS: '2000000' }, () => zarinpalAmount() === 2_000_000)
)

/* ── ۵) امضای HMAC: پایدار، ۳۲ رقم هگز، متمایز بین کاربرها ── */
const sig1 = paymentSignature('user-aaa')
const sig1b = paymentSignature('user-aaa')
const sig2 = paymentSignature('user-bbb')
check('signature deterministic', sig1 === sig1b)
check('signature is 32 hex chars', /^[0-9a-f]{32}$/.test(sig1), sig1)
check('signature differs per user', sig1 !== sig2)

/* ── ۶) کد پیگیری: فقط رقم، سقف ۱۲، نامعتبر → undefined ── */
check('safeRefId keeps digits', safeRefId(123456) === '123456')
check('safeRefId strips garbage', safeRefId('ab98cd76') === '9876')
check(
  'safeRefId caps at 12 digits',
  (safeRefId('1234567890123456') ?? '').length === 12 && safeRefId('1234567890123456') === '123456789012'
)
check('safeRefId empty → undefined', safeRefId('') === undefined && safeRefId(null) === undefined)
check('safeRefId garbage-only → undefined', safeRefId('—') === undefined)

console.log(`\n${fail === 0 ? '✅ همه تست‌ها سبز' : '❌ شکست'} — ${pass} گذرونده، ${fail} رد`)
if (fail > 0) process.exit(1)

/* این فایل را ماژول می‌کند تا با سایر اسکریپت‌های بدون import تداخل اسکوپ سراسری نگیرد */
export {}
