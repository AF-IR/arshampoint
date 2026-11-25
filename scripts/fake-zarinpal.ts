/**
 * فیک‌گیت‌وی زرین‌پال برای تست E2E کامل جریان پرداخت — بدون اینترنت و
 * بدون مرچنت واقعی. همان سه endpoint نسخه v4 را شبیه‌سازی می‌کند:
 *   POST /pg/v4/payment/request.json  → authority (کد ۱۰۰)
 *   GET  /pg/StartPay/<authority>[?nok=1] → ریدایرکت به callback با Status=OK|NOK
 *   POST /pg/v4/payment/verify.json   → ۱۰۰ بار اول، ۱۰۱ در وریفای تکراری،
 *                                       خطای -11 برای authority ناشناس و
 *                                       -50 اگر مبلغ با request فرق کند.
 * Run: npx tsx scripts/fake-zarinpal.ts   (پورت: FAKE_ZP_PORT=3999)
 */
import http from 'http'

const PORT = Number(process.env.FAKE_ZP_PORT ?? 3999)

interface Tx {
  amount: number
  callback: string
  merchant: string
  verified: boolean
  refId: number
}
const txs = new Map<string, Tx>()
let nextRef = 800001

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let s = ''
    req.on('data', (c: Buffer) => {
      s += c
    })
    req.on('end', () => resolve(s))
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

  /* ── request: ساخت authority و ذخیره تراکنش ── */
  if (req.method === 'POST' && url.pathname === '/pg/v4/payment/request.json') {
    const body = JSON.parse((await readBody(req)) || '{}') as {
      merchant_id?: string
      amount?: number
      callback_url?: string
    }
    if (!body.merchant_id || !body.amount || !body.callback_url) {
      return json(res, 200, { errors: { code: -9, message: 'invalid fields' } })
    }
    const authority = `FAKEAUTH${String(Date.now()).slice(-8)}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    txs.set(authority, {
      amount: body.amount,
      callback: body.callback_url,
      merchant: body.merchant_id,
      verified: false,
      refId: nextRef++,
    })
    console.log('[fake-zp] request →', authority, body.amount, 'ریال')
    return json(res, 200, { data: { authority, code: 100, message: 'Success' } })
  }

  /* ── StartPay: ریدایرکت به callback اپ — مثل درگاه واقعی ── */
  if (req.method === 'GET' && url.pathname.startsWith('/pg/StartPay/')) {
    const authority = url.pathname.slice('/pg/StartPay/'.length)
    const tx = txs.get(authority)
    if (!tx) return json(res, 404, { errors: { code: -11, message: 'authority not found' } })
    const nok = url.searchParams.get('nok') === '1'
    const sep = tx.callback.includes('?') ? '&' : '?'
    const location = `${tx.callback}${sep}Authority=${authority}&Status=${nok ? 'NOK' : 'OK'}`
    console.log('[fake-zp] StartPay →', authority, nok ? '(NOK — انصراف)' : '(OK — پرداخت موفق)')
    res.writeHead(302, { Location: location })
    return res.end()
  }

  /* ── verify: ۱۰۰ بار اول، ۱۰۱ تکراری، -50 مغایرت مبلغ ── */
  if (req.method === 'POST' && url.pathname === '/pg/v4/payment/verify.json') {
    const body = JSON.parse((await readBody(req)) || '{}') as {
      authority?: string
      amount?: number
      merchant_id?: string
    }
    const tx = txs.get(body.authority ?? '')
    if (!tx) return json(res, 200, { errors: { code: -11, message: 'authority not found' } })
    if (body.amount !== tx.amount) {
      console.log('[fake-zp] verify → -50 amount mismatch', body.amount, '≠', tx.amount)
      return json(res, 200, { data: { code: -50, message: 'amount mismatch' } })
    }
    if (tx.verified) {
      console.log('[fake-zp] verify → 101 (تکراری)', body.authority)
      return json(res, 200, { data: { code: 101, ref_id: tx.refId, message: 'already verified' } })
    }
    tx.verified = true
    console.log('[fake-zp] verify → 100 OK', body.authority, 'ref', tx.refId)
    return json(res, 200, { data: { code: 100, ref_id: tx.refId, message: 'Verified' } })
  }

  json(res, 404, { errors: { code: -1, message: 'unknown route' } })
})

server.listen(PORT, () => {
  console.log(`[fake-zp] فیک‌گیت‌وی زرین‌پال روی پورت ${PORT} بالا آمد`)
})

/* این فایل را ماژول می‌کند تا با سایر اسکریپت‌های بدون import تداخل اسکوپ سراسری نگیرد */
export {}
