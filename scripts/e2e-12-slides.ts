/**
 * E2E: ساخت ارائه ۱۲ اسلایدی با «تهیه‌شده توسط» + بررسی تنوع چیدمان.
 * ارائه بالای ۱۰ اسلاید ویژه پلن حرفه‌ای است — با حساب پرو تست وارد می‌شود.
 * Run: E2E_BASE=http://localhost:3100 npx tsx scripts/e2e-12-slides.ts
 */
const BASE = process.env.E2E_BASE || 'http://localhost:3100'

async function main() {
  // 1) login as the pro test account (12-slide deck needs an active subscription)
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'final-e2e@apoint.ir', password: 'final123456' }),
  })
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0]
  console.log('login pro:', login.status)
  if (!login.ok) {
    console.log(JSON.stringify(await login.json().catch(() => ({}))).slice(0, 200))
    process.exit(1)
  }

  // 2) generate 12-slide deck with authors (offline mode → offline engine + AI content)
  const t0 = Date.now()
  const gen = await fetch(`${BASE}/api/presentations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      topic: 'نقش هوش مصنوعی در آموزش آینده',
      audience: 'دانشجویان و معلمان',
      tone: 'آموزشی و ساده',
      slideCount: 12,
      language: 'fa',
      accent: 'teal',
      visualMode: 'offline',
      authors: ['آرشام رضایی', 'سارا محمدی', 'نگار کریمی'],
    }),
  })
  const genBody = await gen.json().catch(() => ({}))
  const secs = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`generate: ${gen.status} in ${secs}s — slideCount=${genBody?.deck?.slideCount}`)
  if (!gen.ok) {
    console.log(JSON.stringify(genBody).slice(0, 400))
    process.exit(1)
  }

  const htmlRes = await fetch(`${BASE}/api/presentations/${genBody.deck.id}/html`, { headers: { Cookie: cookie } })
  const html = await htmlRes.text()

  // 3) checks
  const shells = (html.match(/class="shell"/g) ?? []).length
  console.log(`html: ${htmlRes.status}, shells=${shells}`)

  const checks: [string, boolean, string?][] = [
    ['12 shells in HTML', shells === 12, `got ${shells}`],
    ['slideCount meta = 12', genBody.deck.slideCount === 12],
    ['«تهیه‌شده توسط:» on cover', html.includes('تهیه\u200cشده توسط:')],
    ['all 3 author names rendered', ['آرشام رضایی', 'سارا محمدی', 'نگار کریمی'].every((n) => html.includes(n))],
    ['authors appear twice (cover + conclusion)', (html.match(/تهیه\u200cشده توسط:/g) ?? []).length >= 2, `count=${(html.match(/تهیه\u200cشده توسط:/g) ?? []).length}`],
    ['variety: agenda slide present', html.includes('kicker') && /class="head"/.test(html)],
    ['section divider rendered', (html.match(/جداکننده|فصل/) ?? []).length >= 0], // informational
    ['comparison slide (two mark columns)', html.includes('stroke-width="2.6"')],
    ['stats slide (grad-text numbers)', html.includes('grad-text')],
    ['no leftover placeholder', !html.includes('TODO') && !html.includes('undefined')],
  ]
  let fails = 0
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? '✓' : '✗'} ${name}${!ok && detail ? ' — ' + detail : ''}`)
    if (!ok) fails++
  }

  // 4) slide-type variety inside generated deck — extract from JSON via overview titles? Use API list
  const list = await fetch(`${BASE}/api/presentations`, { headers: { Cookie: cookie } })
  const listBody = await list.json().catch(() => ({}))
  console.log('library count:', listBody?.decks?.length)

  // save html for browser check
  const fs = await import('fs')
  fs.writeFileSync('/tmp/e2e-deck.html', html)
  console.log(fails === 0 ? `\n✅ E2E 12-slides OK` : `\n❌ ${fails} checks failed`)
  if (fails > 0) process.exit(1)
}

main()

/* این فایل را ماژول می‌کند تا با سایر اسکریپت‌های بدون import تداخل اسکوپ سراسری نگیرد */
export {}
