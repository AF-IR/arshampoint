/* تست واحد: planSlideTypes باید دقیقاً n اسلاید برای هر n از ۱ تا ۱۴ بسازد
 * + سقف‌های plan-limits + برش fixStructure. اجرا: npx tsx scripts/test-slide-limits.ts */
import { planSlideTypes, topicSeed, fixStructure } from '../src/lib/deck-ai'
import type { DeckJSON, DeckSlide } from '../src/lib/deck-types'
import {
  MIN_SLIDES, MAX_SLIDES_FREE, MAX_SLIDES_PRO, maxSlidesForPlan, slidesUpgradeMessage,
} from '../src/lib/plan-limits'

const stub = (type: string) =>
  ({ type, title: 't' } as unknown as DeckSlide)
const deckOf = (...types: string[]): DeckJSON =>
  ({ title: 't', language: 'fa', slides: types.map(stub) } as unknown as DeckJSON)

let pass = 0
let fail = 0

function check(name: string, cond: boolean, extra = '') {
  if (cond) {
    pass++
    console.log(`✓ ${name}`)
  } else {
    fail++
    console.log(`✗ ${name} ${extra}`)
  }
}

for (let n = 1; n <= 14; n++) {
  for (const mode of ['offline', 'image'] as const) {
    const plan = planSlideTypes(n, mode, topicSeed(`تست ${n}`))
    const label = `n=${n} (${mode}) → ${plan.length} اسلاید`
    check(label, plan.length === n, `انتظار ${n}`)
    check(`n=${n} first=cover`, plan[0] === 'cover')
    check(`n=${n} last=conclusion`, n === 1 ? plan.length === 1 : plan[plan.length - 1] === 'conclusion')
    /* بدون دو اسلاید یکسان متوالی */
    const dup = plan.some((t, i) => i > 0 && plan[i - 1] === t && t !== 'bullets')
    check(`n=${n} بدون تکرار متوالی غیرbullets`, !dup)
  }
}

/* اولویت کاربر با n کوچک */
const pref = planSlideTypes(2, 'offline', topicSeed('pref'), ['stats'])
check('n=2 با pref → cover+conclusion', pref.length === 2 && pref[0] === 'cover' && pref[1] === 'conclusion')

/* سقف‌های پلن */
check('MIN_SLIDES=1', MIN_SLIDES === 1)
check('MAX_SLIDES_FREE=10', MAX_SLIDES_FREE === 10, String(MAX_SLIDES_FREE))
check('MAX_SLIDES_PRO=14', MAX_SLIDES_PRO === 14, String(MAX_SLIDES_PRO))
check('maxSlidesForPlan(free)=10', maxSlidesForPlan('free') === 10)
check('maxSlidesForPlan(pro)=14', maxSlidesForPlan('pro') === 14)
const msg = slidesUpgradeMessage(12, 10)
check('پیام ارتقا شامل ۱۲ و ۱۰', msg.includes('۱۲') && msg.includes('۱۰'))

/* برش fixStructure: تک‌اسلایدی و دوتایی دقیق */
const f1 = fixStructure(deckOf('cover', 'conclusion'), 1)
check('fixStructure want=1 → فقط جلد', f1.slides.length === 1 && f1.slides[0].type === 'cover', String(f1.slides.length))
const f2 = fixStructure(deckOf('cover', 'bullets', 'conclusion'), 2)
check('fixStructure want=2 → cover+conclusion', f2.slides.length === 2 && f2.slides[1].type === 'conclusion', JSON.stringify(f2.slides.map((s) => (s as { type?: string }).type)))
const f3 = fixStructure(deckOf('cover', 'bullets', 'stats', 'conclusion'), 3)
check('fixStructure want=3 → ۳ اسلاید', f3.slides.length === 3, String(f3.slides.length))
const f4 = fixStructure(deckOf('bullets', 'cover', 'stats', 'conclusion'), 4)
check('fixStructure جلد سرجای اول + conclusion آخر', f4.slides[0].type === 'cover' && f4.slides[3].type === 'conclusion', JSON.stringify(f4.slides.map((s) => (s as { type?: string }).type)))

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} گذرونده، ${fail} رد`)
process.exit(fail === 0 ? 0 : 1)
