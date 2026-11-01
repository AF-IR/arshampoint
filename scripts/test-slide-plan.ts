/**
 * تست چیدمان قطعی اسلایدها (رفع باگ «بیش از ۸ اسلاید کار نمی‌کند»)
 * Run: npx tsx scripts/test-slide-plan.ts
 *
 *  ۱) planSlideTypes برای هر تعداد ۴ تا ۱۴ دقیقاً همان تعداد اسلاید می‌دهد
 *  ۲) اسلاید اول cover و آخرین conclusion است
 *  ۳) هیچ دو اسلاید پشت‌سرِهم هم‌نوع نیستند (تنوع چیدمان)
 *  ۴) ترکیب با موضوع عوض می‌شود (دو موضوع متفاوت، دو ساختار متفاوت)
 *  ۵) حالت تصویری فقط همان‌جا اسلاید image دارد
 *  ۶) اولویت کاربر حرفه‌ای در چیدمان ظاهر می‌شود
 *  ۷) fixStructure: cover اول، conclusion آخر، برش هوشمند تعداد اضافه
 */
import { planSlideTypes, topicSeed, fixStructure } from '../src/lib/deck-ai'
import type { DeckJSON } from '../src/lib/deck-types'

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!cond) failures++
}

const uniq = (a: string[]) => Array.from(new Set(a))

function main() {
  /* ── ۱) تعداد دقیق برای همه ۴ تا ۱۴ ── */
  for (let n = 4; n <= 14; n++) {
    for (const visual of ['offline', 'image'] as const) {
      const seed = topicSeed(`موضوع تست شماره ${n} ${visual}`)
      const plan = planSlideTypes(n, visual, seed)
      check(`count n=${n} ${visual} → ${plan.length}`, plan.length === n, plan.join(','))
    }
  }

  /* ── ۲) ساختار: cover اول، conclusion آخر ── */
  for (let n = 4; n <= 14; n++) {
    const plan = planSlideTypes(n, 'offline', topicSeed('ارائه آزمایشی'))
    check(`structure n=${n}`, plan[0] === 'cover' && plan[plan.length - 1] === 'conclusion')
  }

  /* ── ۳) هیچ دو پشت‌سرِهم هم‌نوع ── */
  let adjOk = true
  for (let n = 4; n <= 14; n++) {
    for (const visual of ['offline', 'image'] as const) {
      const plan = planSlideTypes(n, visual, topicSeed('نوسان چیدمان'))
      for (let i = 1; i < plan.length; i++) {
        if (plan[i] === plan[i - 1]) {
          adjOk = false
          console.log(`   collision at n=${n} ${visual}: ${plan.join(',')}`)
        }
      }
    }
  }
  check('no two consecutive same-type slides (all n, both modes)', adjOk)

  /* ── ۴) تنوع بین موضوع‌ها ── */
  const topics = ['هوش مصنوعی در آموزش', 'بازاریابی دیجیتال', 'تاریخ ایران باستان', 'سلامت روان']
  const sigs = topics.map((t) => planSlideTypes(12, 'offline', topicSeed(t)).join('|'))
  check('different topics → different 12-slide structures', uniq(sigs).length >= 3, sigs.length + ' sigs, ' + uniq(sigs).length + ' unique')

  /* تنوع درونی هر ارائه */
  const innerDiverse = topics.every((t) => {
    const plan = planSlideTypes(12, 'offline', topicSeed(t))
    return uniq(plan).length >= 6
  })
  check('each 12-slide deck uses ≥6 distinct types', innerDiverse)

  /* ── ۵) image فقط در حالت تصویری ── */
  const off = planSlideTypes(12, 'offline', topicSeed('آموزش'))
  const img = planSlideTypes(12, 'image', topicSeed('آموزش'))
  check('offline plan has no image slides', !off.includes('image'), off.join(','))
  check('image plan includes image slides', img.includes('image'), img.join(','))

  /* ── ۶) اولویت کاربر حرفه‌ای ── */
  const pref = planSlideTypes(12, 'offline', topicSeed('آموزش'), ['timeline', 'comparison'])
  const counts = pref.reduce<Record<string, number>>((m, t) => ({ ...m, [t]: (m[t] ?? 0) + 1 }), {})
  check('preferred layouts dominate the plan', (counts['timeline'] ?? 0) + (counts['comparison'] ?? 0) >= 5, JSON.stringify(counts))
  const single = planSlideTypes(10, 'offline', topicSeed('آموزش'), ['stats'])
  const sc = single.reduce<Record<string, number>>((m, t) => ({ ...m, [t]: (m[t] ?? 0) + 1 }), {})
  check('single preferred type alternates (no adjacency)', (sc['stats'] ?? 0) >= 3 && !single.some((t, i) => i > 0 && t === 'stats' && single[i - 1] === 'stats'), JSON.stringify(sc))

  /* ── ۷) fixStructure ── */
  const mkSlide = (type: string, title: string): unknown => ({ type, title, points: ['x'], items: ['x'], steps: [{ label: '۱', title: 't', text: 'x' }], stats: [{ value: '۱', label: 'l' }], columns: [{ heading: 'a', items: ['x'] }, { heading: 'b', items: ['y'] }], left: { heading: 'a', points: ['x'] }, right: { heading: 'b', points: ['y'] }, quote: 'q' })
  const deckShuffled: DeckJSON = {
    title: 'تست',
    language: 'fa',
    slides: [
      mkSlide('bullets', 'اول'),
      mkSlide('conclusion', 'پایان'),
      mkSlide('cover', 'جلد'),
      mkSlide('stats', 'آمار'),
      mkSlide('two-column', 'ستون'),
      mkSlide('timeline', 'زمان'),
      mkSlide('quote', 'نقل'),
      mkSlide('bullets', 'میان'),
      mkSlide('bullets', 'دیگر'),
      mkSlide('agenda', 'فهرست'),
    ] as DeckJSON['slides'],
  }
  const fixed = fixStructure(deckShuffled, 6)
  check('fixStructure: cover first', fixed.slides[0].type === 'cover')
  check('fixStructure: conclusion last', fixed.slides[fixed.slides.length - 1].type === 'conclusion')
  check('fixStructure: trimmed to want', fixed.slides.length === 6, `got ${fixed.slides.length}`)

  const shortDeck: DeckJSON = {
    title: 'تست',
    language: 'fa',
    slides: [mkSlide('cover', 'جلد'), mkSlide('bullets', 'الف'), mkSlide('bullets', 'ب')] as DeckJSON['slides'],
  }
  const kept = fixStructure(shortDeck, 12)
  check('fixStructure: short deck untouched', kept.slides.length === 3)

  console.log(failures === 0 ? '\n✅ همه تست‌ها سبز است' : `\n❌ ${failures} تست شکست خورد`)
  if (failures > 0) process.exit(1)
}

main()
