import type { DeckJSON, DeckSlide, DeckAccent, DeckLanguage } from '@/lib/deck-types'

/* ═════════ DeckHTML Generator ═════════
   Renders DeckJSON as a standalone single-file HTML presentation
   (RTL Persian, 1280x720 canvas, midnight/daylight dual theme,
   keyboard + touch navigation, overview, print support). */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const faNum = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)])

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* ── Accent palettes (dark + light) ── */
interface AccentPal {
  primary: string
  deep: string
  tint: string
  tintB: string
  glow: string
  grad: string
}
const ACCENTS: Record<DeckAccent, { dark: AccentPal; light: AccentPal }> = {
  blue: {
    dark: { primary: '#8AB4F8', deep: '#669DF6', tint: 'rgba(138,180,248,.15)', tintB: 'rgba(138,180,248,.16)', glow: 'rgba(138,180,248,.09)', grad: 'linear-gradient(90deg,#8AB4F8,#4285F4)' },
    light: { primary: '#1A73E8', deep: '#185ABC', tint: 'rgba(26,115,232,.09)', tintB: 'rgba(26,115,232,.12)', glow: 'rgba(26,115,232,.07)', grad: 'linear-gradient(90deg,#4285F4,#1A73E8)' },
  },
  green: {
    dark: { primary: '#81C995', deep: '#5BB974', tint: 'rgba(129,201,149,.15)', tintB: 'rgba(129,201,149,.18)', glow: 'rgba(129,201,149,.09)', grad: 'linear-gradient(90deg,#81C995,#34A853)' },
    light: { primary: '#188038', deep: '#0D652D', tint: 'rgba(24,128,56,.09)', tintB: 'rgba(24,128,56,.12)', glow: 'rgba(24,128,56,.06)', grad: 'linear-gradient(90deg,#34A853,#188038)' },
  },
  orange: {
    dark: { primary: '#FFB75F', deep: '#F5A03C', tint: 'rgba(255,183,95,.15)', tintB: 'rgba(255,183,95,.18)', glow: 'rgba(255,183,95,.10)', grad: 'linear-gradient(90deg,#FFB75F,#F29900)' },
    light: { primary: '#E8710A', deep: '#B06000', tint: 'rgba(232,113,10,.10)', tintB: 'rgba(232,113,10,.13)', glow: 'rgba(232,113,10,.07)', grad: 'linear-gradient(90deg,#F9AB00,#E8710A)' },
  },
  purple: {
    dark: { primary: '#C58AF9', deep: '#A142F4', tint: 'rgba(197,138,249,.16)', tintB: 'rgba(197,138,249,.20)', glow: 'rgba(197,138,249,.10)', grad: 'linear-gradient(90deg,#C58AF9,#A142F4)' },
    light: { primary: '#9334E6', deep: '#7627BB', tint: 'rgba(147,52,230,.10)', tintB: 'rgba(147,52,230,.13)', glow: 'rgba(147,52,230,.07)', grad: 'linear-gradient(90deg,#A142F4,#9334E6)' },
  },
}

/* ── Base CSS (theme-agnostic + neutral vars) ── */
const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;background:var(--page);direction:rtl;font-family:'Vazirmatn',Tahoma,'Segoe UI',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
:root{
  --bg:#15171C;--bg-tint:#191C22;--surface:#1E2127;
  --ink:#E8EAED;--ink-2:#C4C7CC;--ink-3:#9AA0A6;--on-accent:#0B0C0F;
  --line:rgba(255,255,255,.10);--line-2:rgba(255,255,255,.16);
  --ov:rgba(255,255,255,.06);--ov2:rgba(255,255,255,.12);
  --page:#0A0B0E;--glass:rgba(12,13,16,.78);--pill:rgba(20,22,27,.92);
  --shadow:0 1px 2px rgba(0,0,0,.45),0 14px 34px rgba(0,0,0,.5);
  --shadow-lg:0 24px 70px rgba(0,0,0,.6);
  --slide-g1:var(--a-glow);--slide-g2:rgba(242,139,130,.05);
  --g-red:#F28B82;--g-yellow:#FDD663;--g-green:#81C995;
  --num:'Outfit','Vazirmatn',sans-serif;
}
html.light{
  --bg:#F6F8FC;--bg-tint:#EEF2F8;--surface:#FFFFFF;
  --ink:#202124;--ink-2:#3C4043;--ink-3:#5F6368;--on-accent:#FFFFFF;
  --line:rgba(0,0,0,.10);--line-2:rgba(0,0,0,.16);
  --ov:rgba(0,0,0,.04);--ov2:rgba(0,0,0,.08);
  --page:#E8ECF3;--glass:rgba(255,255,255,.85);--pill:rgba(255,255,255,.95);
  --shadow:0 1px 2px rgba(60,64,67,.18),0 14px 34px rgba(60,64,67,.14);
  --shadow-lg:0 24px 70px rgba(60,64,67,.28);
  --slide-g2:rgba(234,67,53,.04);
  --g-red:#D93025;--g-yellow:#E8A200;--g-green:#188038;
}
html.tswap *,html.tswap *::before,html.tswap *::after{transition:background-color .42s ease,color .42s ease,border-color .42s ease,box-shadow .42s ease,opacity .3s ease!important}
#stage{position:fixed;inset:0 0 64px 0;display:grid;place-items:center;overflow:hidden}
.shell{position:absolute;width:1280px;height:720px;transform:scale(var(--s,1));transform-origin:center center;visibility:hidden}
.shell.active{visibility:visible}
.slide{position:relative;width:1280px;height:720px;overflow:hidden;display:flex;flex-direction:column;padding:52px 60px;background:radial-gradient(900px 420px at 85% -10%,var(--slide-g1),transparent 60%),radial-gradient(700px 380px at 0% 110%,var(--slide-g2),transparent 60%),var(--bg);animation:slideIn .5s ease both}
@keyframes slideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.slide{animation:none}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow)}
.card-tint{background:var(--bg-tint);border:1px solid var(--line);border-radius:20px}
.card-soft{background:var(--a-tint);border:1px solid var(--a-tintB);border-radius:20px}
.chip{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:7px 16px;font-weight:700;font-size:13.5px;background:var(--a-tint);color:var(--a-primary);border:1px solid var(--a-tintB)}
.chip-plain{background:var(--ov);color:var(--ink-2);border:1px solid var(--line)}
.dot{width:10px;height:10px;border-radius:999px;display:inline-block;background:var(--a-primary);box-shadow:0 0 10px var(--a-tintB)}
.kicker{font-size:13.5px;font-weight:700;color:var(--a-primary);letter-spacing:.02em;margin-bottom:10px;display:flex;align-items:center;gap:8px}
h1.title{font-size:38px;font-weight:800;line-height:1.3;color:var(--ink)}
.head{flex-shrink:0;margin-bottom:26px}
.head .rule{width:64px;height:5px;border-radius:99px;background:var(--a-grad);margin-top:14px}
.body{flex:1;min-height:0;display:flex;flex-direction:column}
.foot{flex-shrink:0;margin-top:22px;padding-top:14px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--ink-3)}
.foot .n{font-family:var(--num);font-weight:600}
.grad-text{background:var(--a-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.num{font-family:var(--num)}

/* ── Control bar ── */
#bar{position:fixed;right:0;bottom:0;left:0;height:64px;display:flex;align-items:center;gap:14px;padding:0 22px;background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);z-index:40;direction:ltr}
#bar button{all:unset;cursor:pointer;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;color:var(--ink-2);font-size:17px;transition:background .2s,color .2s}
#bar button:hover{background:var(--ov2);color:var(--ink)}
#bar button:disabled{opacity:.28;cursor:default}
#counter{font-family:var(--num);font-weight:600;font-size:14px;color:var(--ink-2);min-width:64px;text-align:center;direction:ltr}
#dots{display:flex;gap:7px;flex:1;justify-content:center;align-items:center;overflow-x:auto;padding:4px}
#dots::-webkit-scrollbar{display:none}
#dots .d{width:9px;height:9px;border-radius:99px;background:var(--ov2);cursor:pointer;transition:all .25s;flex-shrink:0}
#dots .d.on{background:var(--a-primary);width:26px;box-shadow:0 0 8px var(--a-tintB)}
#prog{position:absolute;top:-2px;right:0;height:2.5px;background:var(--a-grad);border-radius:99px;transition:width .35s ease;width:0}
.sep{width:1px;height:22px;background:var(--line)}

/* ── Overview ── */
#ovWrap{position:fixed;inset:0;background:var(--glass);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:60;display:none;overflow:auto;padding:46px 60px}
#ovWrap.open{display:block}
#ovGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;max-width:1240px;margin:0 auto}
#ovWrap h3{color:var(--ink-2);font-size:15px;margin:0 auto 18px;max-width:1240px;font-weight:700}
.ov-item{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px;cursor:pointer;transition:all .2s;display:flex;gap:12px;align-items:flex-start;color:var(--ink)}
.ov-item:hover{border-color:var(--a-primary);transform:translateY(-2px);box-shadow:var(--shadow)}
.ov-item.cur{border-color:var(--a-primary);background:var(--a-tint)}
.ov-item .i{font-family:var(--num);font-weight:700;font-size:13px;color:var(--a-primary);background:var(--a-tint);border-radius:9px;padding:3px 9px;flex-shrink:0}
.ov-item .t{font-size:13.5px;font-weight:600;line-height:1.6}

/* ── Toast ── */
#toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--pill);border:1px solid var(--line);color:var(--ink);padding:10px 22px;border-radius:999px;font-size:13.5px;font-weight:600;opacity:0;transition:all .3s;z-index:80;pointer-events:none;box-shadow:var(--shadow-lg)}
#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

@media print{
  html,body{overflow:visible;background:#fff}
  #bar,#ovWrap,#toast{display:none!important}
  #stage{position:static;inset:auto}
  .shell{position:relative;visibility:visible!important;transform:none!important;page-break-after:always;break-after:page;margin:0 auto}
  @page{size:1280px 720px;margin:0}
}
`

function accentCss(accent: DeckAccent, light: boolean): string {
  const p = ACCENTS[accent][light ? 'light' : 'dark']
  return `:root${light ? '.light' : ''}{--a-primary:${p.primary};--a-deep:${p.deep};--a-tint:${p.tint};--a-tintB:${p.tintB};--a-glow:${p.glow};--a-grad:${p.grad}}`
}

/* ── Slide body renderers ── */

function head(slide: { kicker?: string; title: string }, deck: DeckJSON): string {
  const kicker = slide.kicker
    ? `<div class="kicker"><span class="dot"></span>${esc(slide.kicker)}</div>`
    : ''
  return `<header class="head">${kicker}<h1 class="title">${esc(slide.title)}</h1><div class="rule"></div></header>`
}

function foot(deck: DeckJSON, idx: number, total: number): string {
  const lang = deck.language
  const n = lang === 'fa' ? faNum(idx + 1) : String(idx + 1)
  const t = lang === 'fa' ? faNum(total) : String(total)
  return `<footer class="foot"><span>${esc(deck.title)}</span><span class="n">${n} / ${t}</span></footer>`
}

function renderCover(s: Extract<DeckSlide, { type: 'cover' }>, deck: DeckJSON): string {
  const meta: string[] = []
  if (s.author) meta.push(s.author)
  if (s.date) meta.push(s.date)
  return `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:26px">
    ${s.badge ? `<span class="chip"><span class="dot"></span>${esc(s.badge)}</span>` : ''}
    <h1 style="font-size:64px;font-weight:900;line-height:1.25;max-width:1000px">${esc(s.title)}</h1>
    <div style="width:110px;height:6px;border-radius:99px;background:var(--a-grad)"></div>
    ${s.subtitle ? `<p style="font-size:22px;color:var(--ink-2);line-height:1.9;max-width:860px">${esc(s.subtitle)}</p>` : ''}
    ${meta.length ? `<div style="display:flex;gap:12px;margin-top:6px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
  </div>
  ${foot(deck, 0, deck.slides.length)}`
}

function renderAgenda(s: Extract<DeckSlide, { type: 'agenda' }>, deck: DeckJSON, idx: number): string {
  const lang = deck.language
  const two = s.items.length > 4
  const items = s.items
    .map((it, i) => {
      const n = lang === 'fa' ? faNum(i + 1) : String(i + 1)
      return `<div class="card" style="display:flex;align-items:center;gap:18px;padding:20px 24px">
        <span class="num" style="width:44px;height:44px;border-radius:14px;background:var(--a-tint);border:1px solid var(--a-tintB);color:var(--a-primary);font-weight:800;font-size:19px;display:grid;place-items:center;flex-shrink:0">${n}</span>
        <span style="font-size:17.5px;font-weight:600;line-height:1.7">${esc(it)}</span>
      </div>`
    })
    .join('')
  return `${head(s, deck)}
  <div class="body"><section style="flex:1;display:grid;grid-template-columns:${two ? '1fr 1fr' : '1fr'};gap:16px;align-content:${two ? 'stretch' : 'start'}">${items}</section></div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderBullets(s: Extract<DeckSlide, { type: 'bullets' }>, deck: DeckJSON, idx: number): string {
  const rows = s.items
    .map((it) =>
      it.title
        ? `<div class="card" style="display:flex;gap:16px;padding:18px 22px;align-items:flex-start">
            <span class="dot" style="margin-top:9px"></span>
            <div style="display:flex;flex-direction:column;gap:4px;min-width:0">
              <span style="font-size:17px;font-weight:700">${esc(it.title)}</span>
              <span style="font-size:15px;color:var(--ink-2);line-height:1.85">${esc(it.text)}</span>
            </div>
          </div>`
        : `<div style="display:flex;gap:16px;padding:14px 22px;align-items:flex-start" class="card-tint">
            <span class="dot" style="margin-top:9px"></span>
            <span style="font-size:16.5px;line-height:1.9">${esc(it.text)}</span>
          </div>`
    )
    .join('')
  return `${head(s, deck)}
  <div class="body"><section style="flex:1;display:flex;flex-direction:column;gap:12px;justify-content:center">${rows}</section></div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderTwoColumn(s: Extract<DeckSlide, { type: 'two-column' }>, deck: DeckJSON, idx: number): string {
  const cols = s.columns
    .map(
      (c, ci) => `<section class="${ci % 2 === 0 ? 'card' : 'card-soft'}" style="padding:26px 28px;display:flex;flex-direction:column;gap:14px;min-height:0">
        <h2 style="font-size:20px;font-weight:800;color:${ci % 2 === 0 ? 'var(--a-primary)' : 'var(--ink)'};display:flex;align-items:center;gap:10px">
          <span class="dot"></span>${esc(c.heading)}
        </h2>
        <div style="display:flex;flex-direction:column;gap:11px">
          ${c.items
            .map(
              (it) => `<div style="display:flex;gap:10px;align-items:flex-start">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style="margin-top:5px;flex-shrink:0"><path d="M20 6L9 17l-5-5" stroke="var(--a-primary)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span style="font-size:15px;line-height:1.8;color:var(--ink-2)">${esc(it)}</span>
              </div>`
            )
            .join('')}
        </div>
      </section>`
    )
    .join('')
  return `${head(s, deck)}
  <div class="body"><section style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:20px;min-height:0">${cols}</section></div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderStats(s: Extract<DeckSlide, { type: 'stats' }>, deck: DeckJSON, idx: number): string {
  const lang = deck.language
  const fix = (v: string) => (lang === 'fa' ? v.replace(/\d/g, (d) => FA_DIGITS[Number(d)]) : v)
  const cards = s.stats
    .map(
      (st) => `<div class="card" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:30px 18px;text-align:center">
        <span class="num grad-text" style="font-size:52px;font-weight:800;line-height:1.1">${esc(fix(st.value))}</span>
        <span style="font-size:15.5px;font-weight:700">${esc(st.label)}</span>
        ${st.hint ? `<span style="font-size:12.5px;color:var(--ink-3);line-height:1.7">${esc(st.hint)}</span>` : ''}
      </div>`
    )
    .join('')
  return `${head(s, deck)}
  <div class="body">
    <section style="flex:1;display:flex;gap:18px;align-items:stretch;min-height:0">${cards}</section>
    ${s.footnote ? `<div class="card-soft" style="margin-top:18px;padding:14px 22px;display:flex;align-items:center;gap:12px;flex-shrink:0"><span class="dot" style="flex-shrink:0"></span><span style="font-size:14px;font-weight:600;line-height:1.7">${esc(s.footnote)}</span></div>` : ''}
  </div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderQuote(s: Extract<DeckSlide, { type: 'quote' }>, deck: DeckJSON, idx: number): string {
  return `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:0 70px">
    <span class="grad-text" style="font-size:90px;font-weight:900;line-height:.6;font-family:Georgia,serif">&#187;</span>
    <p style="font-size:30px;font-weight:700;line-height:2;max-width:980px">${esc(s.quote)}</p>
    <div style="width:80px;height:5px;border-radius:99px;background:var(--a-grad)"></div>
    ${s.author ? `<div style="display:flex;flex-direction:column;gap:4px;align-items:center"><span style="font-size:17px;font-weight:800">${esc(s.author)}</span>${s.role ? `<span style="font-size:13.5px;color:var(--ink-3)">${esc(s.role)}</span>` : ''}</div>` : ''}
  </div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderTimeline(s: Extract<DeckSlide, { type: 'timeline' }>, deck: DeckJSON, idx: number): string {
  const lang = deck.language
  const steps = s.steps
    .map((st, i) => {
      const n = lang === 'fa' ? faNum(st.label) : st.label
      return `<div style="flex:1;display:flex;flex-direction:column;gap:14px;min-width:0">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="num" style="width:42px;height:42px;border-radius:999px;background:var(--a-grad);color:var(--on-accent);font-weight:800;font-size:16px;display:grid;place-items:center;flex-shrink:0">${esc(n)}</span>
          ${i < s.steps.length - 1 ? `<div style="flex:1;height:2.5px;background:var(--a-tintB);border-radius:99px"></div>` : ''}
        </div>
        <div class="card" style="padding:18px 20px;display:flex;flex-direction:column;gap:6px;flex:1">
          <span style="font-size:16px;font-weight:800">${esc(st.title)}</span>
          <span style="font-size:13.5px;color:var(--ink-2);line-height:1.8">${esc(st.text)}</span>
        </div>
      </div>`
    })
    .join('')
  return `${head(s, deck)}
  <div class="body"><section style="flex:1;display:flex;gap:16px;align-items:stretch;padding-top:8px">${steps}</section></div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderConclusion(s: Extract<DeckSlide, { type: 'conclusion' }>, deck: DeckJSON, idx: number): string {
  const points = s.points
    .map(
      (p) => `<div class="card" style="display:flex;gap:14px;padding:16px 22px;align-items:center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><circle cx="12" cy="12" r="11" fill="var(--a-tint)"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="var(--a-primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span style="font-size:16px;font-weight:600;line-height:1.8">${esc(p)}</span>
      </div>`
    )
    .join('')
  return `${head(s, deck)}
  <div class="body" style="justify-content:center;gap:22px">
    <section style="display:flex;flex-direction:column;gap:12px">${points}</section>
    ${s.cta ? `<div style="display:flex;justify-content:center"><span style="background:var(--a-grad);color:var(--on-accent);border-radius:999px;padding:13px 34px;font-size:15.5px;font-weight:800;box-shadow:var(--shadow)">${esc(s.cta)}</span></div>` : ''}
  </div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderSlide(s: DeckSlide, deck: DeckJSON, idx: number): string {
  switch (s.type) {
    case 'cover': return renderCover(s, deck)
    case 'agenda': return renderAgenda(s, deck, idx)
    case 'bullets': return renderBullets(s, deck, idx)
    case 'two-column': return renderTwoColumn(s, deck, idx)
    case 'stats': return renderStats(s, deck, idx)
    case 'quote': return renderQuote(s, deck, idx)
    case 'timeline': return renderTimeline(s, deck, idx)
    case 'conclusion': return renderConclusion(s, deck, idx)
    default: return renderBullets({ type: 'bullets', title: String((s as { title?: string }).title ?? deck.title), items: [] }, deck, idx)
  }
}

/* ── Player JS (navigation, theme, overview, fullscreen, swipe) ── */
function playerScript(total: number, lang: DeckLanguage): string {
  const fa = lang === 'fa'
  const labels = fa
    ? { overview: 'نمای کلی (کلید O)', theme: 'تغییر تم روشن/تیره', fs: 'تمام‌صفحه', next: 'اسلاید بعدی', prev: 'اسلاید قبلی', end: 'پایان ارائه', start: 'اسلاید اول' }
    : { overview: 'Overview (key O)', theme: 'Toggle light/dark theme', fs: 'Fullscreen', next: 'Next slide', prev: 'Previous slide', end: 'End of deck', start: 'First slide' }
  return `
(function(){
  var N=${total},cur=0;
  var FA='۰۱۲۳۴۵۶۷۸۹';
  function fa(n){return String(n).replace(/\\d/g,function(d){return FA[d]})}
  var shells=[].slice.call(document.querySelectorAll('.shell'));
  var dotsW=document.getElementById('dots'),counter=document.getElementById('counter'),prog=document.getElementById('prog');
  var bPrev=document.getElementById('bPrev'),bNext=document.getElementById('bNext');
  var ovWrap=document.getElementById('ovWrap'),stage=document.getElementById('stage');
  function fmt(n){return ${fa ? 'fa(n)' : 'String(n)'}} /* eslint-disable-line */
  function fmtN(n){${fa ? 'return fa(n)' : 'return String(n)'}}
  dotsW.innerHTML='';
  for(var i=0;i<N;i++){(function(i){var d=document.createElement('span');d.className='d';d.title=fmtN(i+1);d.onclick=function(){go(i)};dotsW.appendChild(d)})(i)}
  var dots=[].slice.call(dotsW.children);
  function go(i){
    if(i<0)i=0;if(i>N-1)i=N-1;
    if(i===cur&&shells[cur].className.indexOf('active')>-1){}
    shells.forEach(function(s,j){s.classList.toggle('active',j===i)});
    dots.forEach(function(d,j){d.classList.toggle('on',j===i)});
    counter.textContent=fmtN(i+1)+' / '+fmtN(N);
    prog.style.width=((i+1)/N*100)+'%';
    bPrev.disabled=i===0;bNext.disabled=i===N-1;
    cur=i;
  }
  function fit(){
    var vw=window.innerWidth,vh=window.innerHeight-64;
    var s=Math.min(vw/1280,vh/720);
    document.documentElement.style.setProperty('--s',s);
  }
  window.addEventListener('resize',fit);fit();
  bPrev.onclick=function(){go(cur-1)};
  bNext.onclick=function(){go(cur+1)};
  document.getElementById('bTheme').onclick=function(){
    document.documentElement.classList.add('tswap');
    var el=document.documentElement;el.classList.toggle('light');
    try{localStorage.setItem('zslide-theme',el.classList.contains('light')?'light':'dark')}catch(e){}
    setTimeout(function(){el.classList.remove('tswap')},480);
  };
  document.getElementById('bFs').onclick=function(){
    if(document.fullscreenElement){document.exitFullscreen()}
    else{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}
  };
  var ov=document.getElementById('ovWrap');
  function buildOv(){
    var g=document.getElementById('ovGrid');g.innerHTML='';
    var h=document.createElement('h3');h.textContent='${esc(labels.overview)}';g.parentNode.insertBefore(h,g);
    shells.forEach(function(sh,i){
      var card=document.createElement('div');card.className='ov-item'+(i===cur?' cur':'');
      var t=sh.querySelector('[data-ovtitle]');
      var title=t?t.getAttribute('data-ovtitle'):(''+(i+1));
      card.innerHTML='<span class="i">'+fmtN(i+1)+'</span><span class="t"></span>';
      card.querySelector('.t').textContent=title;
      card.onclick=function(){go(i);ov.classList.remove('open')};
      g.appendChild(card);
    });
  }
  function toggleOv(){if(ov.classList.contains('open')){ov.classList.remove('open')}else{buildOv();ov.classList.add('open')}}
  document.getElementById('bOv').onclick=toggleOv;
  ov.addEventListener('click',function(e){if(e.target===ov)ov.classList.remove('open')});
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'||e.key===' '||e.key==='PageDown'){e.preventDefault();go(cur+1)}
    else if(e.key==='ArrowRight'||e.key==='PageUp'){e.preventDefault();go(cur-1)}
    else if(e.key==='ArrowDown'){e.preventDefault();go(cur+1)}
    else if(e.key==='ArrowUp'){e.preventDefault();go(cur-1)}
    else if(e.key==='Home'){e.preventDefault();go(0)}
    else if(e.key==='End'){e.preventDefault();go(N-1)}
    else if(e.key==='o'||e.key==='O'){toggleOv()}
    else if(e.key==='Escape'){ov.classList.remove('open')}
    else if(e.key==='f'||e.key==='F'){document.getElementById('bFs').click()}
  });
  var tx=null;
  stage.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  stage.addEventListener('touchend',function(e){
    if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;
    if(Math.abs(dx)>50){ if(dx>0)go(cur+1); else go(cur-1); }
    tx=null;
  },{passive:true});
  try{if(localStorage.getItem('zslide-theme')==='light')document.documentElement.classList.add('light')}catch(e){}
  go(0);
})();`
}

/* ── Main entry ── */
export function generateDeckHTML(
  deck: DeckJSON,
  opts: { accent?: DeckAccent } = {}
): string {
  const accent: DeckAccent = opts.accent ?? 'blue'
  const lang = deck.language ?? 'fa'
  const dir = lang === 'fa' ? 'rtl' : 'ltr'
  const total = deck.slides.length

  const shells = deck.slides
    .map((s, i) => {
      const ovTitle =
        s.type === 'quote' ? (s.author ?? s.quote.slice(0, 60)) : ((s as { title?: string }).title ?? deck.title)
      return `<div class="shell" data-i="${i}"><div class="slide" data-ovtitle="${esc(ovTitle)}">${renderSlide(s, deck, i)}</div></div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(deck.title)}</title>
<meta name="generator" content="ZSlide — AI Presentation Generator (Z.ai)">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
<style>
${BASE_CSS}
${accentCss(accent, false)}
${accentCss(accent, true)}
</style>
</head>
<body>
<main id="stage" aria-label="${esc(deck.title)}">
${shells}
</main>
<nav id="bar" aria-label="کنترل ارائه">
  <div id="prog"></div>
  <button id="bPrev" title="${esc(labelsSafe(lang).prev)}" aria-label="${esc(labelsSafe(lang).prev)}">&#8250;</button>
  <div id="counter" aria-live="polite">1 / ${lang === 'fa' ? faNum(total) : total}</div>
  <button id="bNext" title="${esc(labelsSafe(lang).next)}" aria-label="${esc(labelsSafe(lang).next)}">&#8249;</button>
  <div class="sep"></div>
  <div id="dots" role="tablist" aria-label="اسلایدها"></div>
  <div class="sep"></div>
  <button id="bOv" title="${esc(labelsSafe(lang).overview)}" aria-label="${esc(labelsSafe(lang).overview)}">&#8862;</button>
  <button id="bTheme" title="${esc(labelsSafe(lang).theme)}" aria-label="${esc(labelsSafe(lang).theme)}">&#9681;</button>
  <button id="bFs" title="${esc(labelsSafe(lang).fs)}" aria-label="${esc(labelsSafe(lang).fs)}">&#9974;</button>
</nav>
<div id="ovWrap"><div id="ovGrid"></div></div>
<div id="toast" role="status"></div>
<script>${playerScript(total, lang)}</script>
</body>
</html>`
}

function labelsSafe(lang: DeckLanguage) {
  return lang === 'fa'
    ? { overview: 'نمای کلی (کلید O)', theme: 'تغییر تم روشن/تیره', fs: 'تمام‌صفحه', next: 'اسلاید بعدی', prev: 'اسلاید قبلی' }
    : { overview: 'Overview (O)', theme: 'Toggle theme', fs: 'Fullscreen', next: 'Next', prev: 'Previous' }
}
