/**
 * تست استخر کلیدهای هوش مصنوعی — فرمت پرانتز، جداکننده‌های دیگر و failover.
 * Run: npx tsx scripts/test-key-pool.ts
 */
import { aiApiKeys } from '../src/lib/mode'
import { callZaiHttp } from '../src/lib/deck-ai'

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

/* ── ماک fetch برای سناریوهای failover ── */
type FetchCall = { auth: string; status: number }
interface FetchMock {
  calls: FetchCall[]
  install(statusByCallIndex: number[] | ((i: number) => number)): void
}
const mock: FetchMock = {
  calls: [],
  install(statusFn) {
    this.calls = []
    const real = globalThis.fetch
    let i = 0
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      const auth = String(
        (init?.headers as Record<string, string> | undefined)?.Authorization ?? ''
      )
      const status = typeof statusFn === 'function' ? statusFn(i) : statusFn[i]
      this.calls.push({ auth, status })
      i++
      if (status === 200) {
        return new Response(
          JSON.stringify({ choices: [{ message: { content: 'پاسخ موفق از کلید سالم' } }] }),
          { status: 200 }
        )
      }
      return new Response(JSON.stringify({ error: `mock ${status}` }), { status })
    }) as typeof fetch
    ;(globalThis as { __realFetch?: typeof fetch }).__realFetch = real
  },
}
function restoreFetch() {
  const holder = globalThis as { __realFetch?: typeof fetch }
  if (holder.__realFetch) globalThis.fetch = holder.__realFetch
}
function withEnv<T>(keys: string | undefined, fn: () => T): T {
  const old = process.env.ZAI_API_KEY
  if (keys === undefined) delete process.env.ZAI_API_KEY
  else process.env.ZAI_API_KEY = keys
  try {
    return fn()
  } finally {
    if (old === undefined) delete process.env.ZAI_API_KEY
    else process.env.ZAI_API_KEY = old
  }
}

/* ۱) بدون متغیر → استخر خالی (حالت SDK) */
check(
  'no env → empty pool',
  withEnv(undefined, () => aiApiKeys().length === 0)
)

/* ۲) تک‌کلید بدون پرانتز */
check(
  'single key',
  withEnv('aaaaaaaaaaaaaaaaaaaaaaaa', () => aiApiKeys().length === 1)
)

/* ۳) فرمت پرانتز — خواسته کاربر: «در یک متغیر و با پرانتز از هم جدا می‌شوند» */
check(
  'parenthesized pool of 5',
  withEnv('(key-one-aaaaaaaaaaaa)(key-two-aaaaaaaaaaaa)(key-three-aaaaaaaaaa)(key-four-aaaaaaaaaa)(key-five-aaaaaaaaaa)', () => {
    const k = aiApiKeys()
    return k.length === 5 && k[0] === 'key-one-aaaaaaaaaaaa' && k[4] === 'key-five-aaaaaaaaaa'
  })
)

/* ۴) پرانتز + فاصله و خط جدید بین کلیدها */
check(
  'parens with whitespace/newlines',
  withEnv(' ( key-a-aaaaaaaaaaaa )\n( key-b-aaaaaaaaaaaa )', () => aiApiKeys().length === 2)
)

/* ۵) جداکننده ویرگول/لوله */
check(
  'comma/pipe separators tolerated',
  withEnv('key-a-aaaaaaaaaaaa, key-b-aaaaaaaaaaaa | key-c-aaaaaaaaaaaa', () => aiApiKeys().length === 3)
)

/* ۶) کلیدهای تکراری حذف می‌شوند */
check(
  'dedupe',
  withEnv('(dup-key-aaaaaaaaaaaa)(dup-key-aaaaaaaaaaaa)(other-key-aaaaaaaaaa)', () => aiApiKeys().length === 2)
)

/* ۷) توکن‌های خیلی کوتاه (نامعتبر) فیلتر می‌شوند */
check(
  'short junk filtered',
  withEnv('(ab)(real-key-aaaaaaaaaaaaaa)', () => aiApiKeys().length === 1)
)

/* ۸) انتخاب رندوم: با ۵ کلید، نقطه شروع بین فراخوانی‌ها تغییر می‌کند
 * (آماری — با استخر ۵تایی و ۴۰ تلاش، نباید همیشه از ایندکس ۰ شروع شود) */
withEnv('(k1-aaaaaaaaaaaaaaaa)(k2-aaaaaaaaaaaaaaaa)(k3-aaaaaaaaaaaaaaaa)(k4-aaaaaaaaaaaaaaaa)(k5-aaaaaaaaaaaaaaaa)', () => {
  const firsts = new Set<number>()
  for (let i = 0; i < 40; i++) {
    const keys = aiApiKeys()
    const start = Math.floor(Math.random() * keys.length)
    firsts.add(start)
  }
  check('random start varies across calls', firsts.size >= 3, `distinct=${firsts.size}`)
})

/* ── ۹) failover واقعی با ماک fetch ──
 * ترتیب وضعیت‌ها بر اساس «ترتیب فراخوانی» است نه ایندکس کلید، چون نقطه
 * شروع رندوم است؛ در هر سناریو باید چرخش بین کلیدهای «متفاوت» دیده شود.
 * (داخل تابع async — tsx به‌صورت CJS ترجمه می‌کند و top-level await ندارد) */
async function failoverTests(): Promise<void> {
  const MSGS = [
  { role: 'system' as const, content: 'تست' },
  { role: 'user' as const, content: 'سلام' },
]
const POOL3 = '(key-aaa-0001-aaaaaaaa)(key-aaa-0002-aaaaaaaa)(key-aaa-0003-aaaaaaaa)'

/* ۴۲۹ → ۴۰۱ → ۲۰۰: دو کلید اول مشکل‌دار، سومی جواب می‌دهد */
mock.install([429, 401, 200])
await withEnv(POOL3, async () => {
  const r = await callZaiHttp(MSGS)
  check('failover 429→401→200 پاسخ موفق', r.content.includes('موفق'), r.content.slice(0, 50))
  check('سه فراخوانی با سه کلید متفاوت', new Set(mock.calls.map((c) => c.auth)).size === 3, JSON.stringify(mock.calls))
  check('کلید سوم (بعد از دو شکست) پاسخ داد', mock.calls[2]?.status === 200)
})

/* ۴۰۱ → ۲۰۰: کلید باطل‌شده نباید درخواست را بترکاند (رفتار مستند README) */
mock.install([401, 200])
await withEnv('(key-aaa-0001-aaaaaaaa)(key-aaa-0002-aaaaaaaa)', async () => {
  const r = await callZaiHttp(MSGS)
  check('failover 401→200 پاسخ موفق', r.content.length > 0)
  check('دو فراخوانی با دو کلید متفاوت', mock.calls.length === 2 && new Set(mock.calls.map((c) => c.auth)).size === 2, JSON.stringify(mock.calls))
})

/* همه کلیدها ۴۲۹ → پیام فارسی «شلوغ» (آخرین خطا سطح بالا می‌آید) */
mock.install([429, 429, 429])
await withEnv(POOL3, async () => {
  try {
    await callZaiHttp(MSGS)
    check('همه-۴۲۹ باید شکست بخورد', false)
  } catch (e) {
    const msg = (e as Error).message
    check('همه-۴۲۹ → پیام شلوغی فارسی', msg.includes('شلوغ'), msg)
    check('همه-۴۲۹ → هر سه کلید امتحان شد', mock.calls.length === 3, String(mock.calls.length))
  }
})

/* ۴۰۰ غیرقابل‌تلاش‌مجدد → شکست فوری فقط با یک فراخوانی */
mock.install([400, 200, 200])
await withEnv(POOL3, async () => {
  try {
    await callZaiHttp(MSGS)
    check('۴۰۰ باید شکست بخورد', false)
  } catch (e) {
    const msg = (e as Error).message
    check('۴۰۰ → شکست فوری (بدون چرخش کلید)', mock.calls.length === 1, String(mock.calls.length))
    check('۴۰۰ → پیام فارسی بدون لو رفتن سرویس زیرین', msg.includes('آرشام پوینت') && !msg.toLowerCase().includes('z.ai'), msg)
  }
})

  restoreFetch()
}

void failoverTests().then(() => {
  console.log(`\n${fail === 0 ? '✅ همه تست‌ها سبز' : '❌ شکست'} — ${pass} گذرونده، ${fail} رد`)
  if (fail > 0) process.exit(1)
})
