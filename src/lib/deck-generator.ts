import type { DeckJSON, DeckSlide, DeckAccent, DeckLanguage } from '@/lib/deck-types'
import { DECK_STYLES, styleCss, styleGoogleFamilies, isDeckStyle, type DeckStyle } from '@/lib/deck-styles'

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
  red: {
    dark: { primary: '#F28B82', deep: '#EA6A60', tint: 'rgba(242,139,130,.15)', tintB: 'rgba(242,139,130,.18)', glow: 'rgba(242,139,130,.10)', grad: 'linear-gradient(90deg,#F28B82,#D93025)' },
    light: { primary: '#D93025', deep: '#A50E0E', tint: 'rgba(217,48,37,.09)', tintB: 'rgba(217,48,37,.12)', glow: 'rgba(217,48,37,.06)', grad: 'linear-gradient(90deg,#EA4335,#D93025)' },
  },
  teal: {
    dark: { primary: '#78D9EC', deep: '#4CC4DA', tint: 'rgba(120,217,236,.15)', tintB: 'rgba(120,217,236,.18)', glow: 'rgba(120,217,236,.09)', grad: 'linear-gradient(90deg,#78D9EC,#00ACC1)' },
    light: { primary: '#00838F', deep: '#005F6B', tint: 'rgba(0,131,143,.09)', tintB: 'rgba(0,131,143,.12)', glow: 'rgba(0,131,143,.06)', grad: 'linear-gradient(90deg,#00ACC1,#00838F)' },
  },
  indigo: {
    dark: { primary: '#A3B0F7', deep: '#7C8CF8', tint: 'rgba(163,176,247,.15)', tintB: 'rgba(163,176,247,.18)', glow: 'rgba(163,176,247,.09)', grad: 'linear-gradient(90deg,#A3B0F7,#5C6BC0)' },
    light: { primary: '#3949AB', deep: '#2C3A93', tint: 'rgba(63,81,181,.09)', tintB: 'rgba(63,81,181,.12)', glow: 'rgba(63,81,181,.07)', grad: 'linear-gradient(90deg,#5C6BC0,#3949AB)' },
  },
  gold: {
    dark: { primary: '#FDD663', deep: '#F9C233', tint: 'rgba(253,214,99,.15)', tintB: 'rgba(253,214,99,.18)', glow: 'rgba(253,214,99,.10)', grad: 'linear-gradient(90deg,#FDD663,#F9AB00)' },
    light: { primary: '#B26A00', deep: '#8D5100', tint: 'rgba(178,106,0,.09)', tintB: 'rgba(178,106,0,.12)', glow: 'rgba(178,106,0,.06)', grad: 'linear-gradient(90deg,#F9AB00,#B26A00)' },
  },
  rose: {
    dark: { primary: '#F7A8C4', deep: '#F06292', tint: 'rgba(247,168,196,.15)', tintB: 'rgba(247,168,196,.18)', glow: 'rgba(247,168,196,.10)', grad: 'linear-gradient(90deg,#F7A8C4,#EC407A)' },
    light: { primary: '#C2185B', deep: '#880E4F', tint: 'rgba(194,24,91,.09)', tintB: 'rgba(194,24,91,.12)', glow: 'rgba(194,24,91,.06)', grad: 'linear-gradient(90deg,#EC407A,#C2185B)' },
  },
  lime: {
    dark: { primary: '#C8E06E', deep: '#A8CC3A', tint: 'rgba(200,224,110,.15)', tintB: 'rgba(200,224,110,.18)', glow: 'rgba(200,224,110,.10)', grad: 'linear-gradient(90deg,#C8E06E,#9ECC2E)' },
    light: { primary: '#689F38', deep: '#4E7A28', tint: 'rgba(104,159,56,.10)', tintB: 'rgba(104,159,56,.13)', glow: 'rgba(104,159,56,.06)', grad: 'linear-gradient(90deg,#9CCC65,#689F38)' },
  },
  bronze: {
    dark: { primary: '#E0A878', deep: '#C88A54', tint: 'rgba(224,168,120,.15)', tintB: 'rgba(224,168,120,.18)', glow: 'rgba(224,168,120,.10)', grad: 'linear-gradient(90deg,#E0A878,#B5763A)' },
    light: { primary: '#A05A2C', deep: '#7A421E', tint: 'rgba(160,90,44,.10)', tintB: 'rgba(160,90,44,.13)', glow: 'rgba(160,90,44,.06)', grad: 'linear-gradient(90deg,#C0703C,#A05A2C)' },
  },
  slate: {
    dark: { primary: '#BDC5CF', deep: '#9AA6B5', tint: 'rgba(189,197,207,.14)', tintB: 'rgba(189,197,207,.17)', glow: 'rgba(189,197,207,.09)', grad: 'linear-gradient(90deg,#BDC5CF,#8A97A8)' },
    light: { primary: '#455A64', deep: '#2F4550', tint: 'rgba(69,90,100,.09)', tintB: 'rgba(69,90,100,.12)', glow: 'rgba(69,90,100,.06)', grad: 'linear-gradient(90deg,#607D8B,#455A64)' },
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
#credit{all:unset;cursor:pointer;margin:0 2px;padding:6px 13px;border-radius:10px;font-size:12px;font-weight:700;color:var(--ink-3);border:1px solid var(--line);transition:color .2s,border-color .2s;direction:rtl;white-space:nowrap}
#credit:hover{color:var(--a-primary);border-color:var(--a-tintB)}
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

/* «تهیه‌شده توسط:» — نام اعضا/تهیه‌کنندگان از ورودی کاربر؛
 * روی جلد و اسلاید پایانی درج می‌شود (دوزبانه: فارسی/انگلیسی) */
function authorsLine(deck: DeckJSON, center = false): string {
  const names = (deck.authors ?? []).map((a) => String(a ?? '').trim()).filter(Boolean)
  if (!names.length) return ''
  const label = deck.language === 'fa' ? 'تهیه‌شده توسط:' : 'Prepared by:'
  const sep = deck.language === 'fa' ? '، ' : ', '
  return `<div style="display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px 14px;background:var(--ov);border:1px solid var(--line);border-radius:16px;padding:10px 18px;font-size:14px;max-width:100%;${center ? 'align-self:center;' : ''}">
    <span style="font-weight:800;color:var(--a-primary);display:inline-flex;align-items:center;gap:7px;white-space:nowrap">${svgIcon('users', 16)}${esc(label)}</span>
    <span style="font-weight:600;color:var(--ink-2)">${names.map((n) => esc(n)).join(sep)}</span>
  </div>`
}

/* ── تصویر با جایگزین امن: اگر لینک اصلی شکست، تصویر رزرو نمایش داده می‌شود ── */
function imgTag(url: string, alt: string, seed: string, style = ''): string {
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`
  const safeAlt = esc(alt).slice(0, 120)
  return `<img src="${esc(url)}" alt="${safeAlt}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${fallback}'" style="object-fit:cover;width:100%;height:100%;display:block;${style}">`
}

/* ── کتابخانه نمادهای غیرتصویری (SVG درون‌خطی — بدون هیچ فایل خارجی) ──
   هوش مصنوعی کلید نماد را انتخاب می‌کند؛ اینجا به SVG تبدیل می‌شود.
   همه مسیرها در viewBox ۲۴×۲۴ با stroke=currentColor رندر می‌شوند. */
const ICON_BODIES: Record<string, string> = {
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/>',
  chart: '<path d="M3 21h18"/><path d="M6 21v-8"/><path d="M11 21V8"/><path d="M16 21v-5"/><path d="M21 21V5"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  lightbulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.4c.7.6 1 1.6 1 2.6h6c0-1 .3-2 1-2.6A6 6 0 0 0 12 3z"/>',
  shield: '<path d="M12 3l7 3v5.2c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V6z"/><path d="M9.3 12l1.9 1.9 3.5-3.7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.4 2"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7"/><circle cx="16.8" cy="9.5" r="2.6"/><path d="M15.8 14.6c2.5.3 4.3 1.8 4.9 4.4"/>',
  zap: '<path d="M13 2L4.5 13.5H11L9.5 22 19.5 9.5H13z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.6 15.6L21 21"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12.5l-2.6 4 2.6 4H5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7"/><path d="M3 12.5h18"/>',
  heart: '<path d="M12 20.5C6.6 16.6 3 13.3 3 9.6 3 7.1 5 5 7.5 5c1.8 0 3.4 1 4.5 2.6C13.1 6 14.7 5 16.5 5 19 5 21 7.1 21 9.6c0 3.7-3.6 7-9 10.9z"/>',
  pin: '<path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
}

function svgIcon(name: string, size = 18, extraStyle = ''): string {
  const body = ICON_BODIES[name] ?? `<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;${extraStyle}">${body}</svg>`
}

function renderCover(s: Extract<DeckSlide, { type: 'cover' }>, deck: DeckJSON, styleKey: DeckStyle): string {
  const meta: string[] = []
  if (s.date) meta.push(s.date)
  const authors = authorsLine(deck)
  const variant = DECK_STYLES[styleKey].cover
  /* حالت دارای تصویر: جلد دونیمه با تصویر کنار عنوان (مشترک بین قالب‌ها) */
  if (s.image) {
    return `
  <div style="flex:1;display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;min-height:0">
    <div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:right;gap:22px;min-width:0">
      ${s.badge ? `<span class="chip"><span class="dot"></span>${esc(s.badge)}</span>` : ''}
      <h1 style="font-size:52px;font-weight:900;line-height:1.3">${esc(s.title)}</h1>
      <div style="width:110px;height:6px;border-radius:99px;background:var(--a-grad)"></div>
      ${s.subtitle ? `<p style="font-size:20px;color:var(--ink-2);line-height:1.9">${esc(s.subtitle)}</p>` : ''}
      ${meta.length ? `<div style="display:flex;gap:12px;margin-top:4px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
      ${authors}
    </div>
    <div style="position:relative;height:74%;min-height:0;border-radius:26px;overflow:hidden;box-shadow:var(--shadow-lg)">
      ${imgTag(s.image, s.title, 'cover', 'border-radius:26px')}
      ${s.imageCaption ? `<span style="position:absolute;bottom:0;right:0;left:0;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff;padding:38px 22px 16px;font-size:13px;direction:rtl;text-align:right">${esc(s.imageCaption)}</span>` : ''}
    </div>
  </div>
  ${foot(deck, 0, deck.slides.length)}`
  }

  /* ── واریانت split: متن + پنل گرافیکی با نماد بزرگ (بدون تصویر خارجی) ── */
  if (variant === 'split') {
    const icon = DECK_STYLES[styleKey].panelIcon ?? 'star'
    return `
  <div style="flex:1;display:grid;grid-template-columns:1.08fr .92fr;gap:48px;align-items:center;min-height:0">
    <div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:right;gap:22px;min-width:0">
      ${s.badge ? `<span class="chip"><span class="dot"></span>${esc(s.badge)}</span>` : ''}
      <h1 style="font-size:56px;font-weight:900;line-height:1.28">${esc(s.title)}</h1>
      <div style="width:110px;height:6px;border-radius:99px;background:var(--a-grad)"></div>
      ${s.subtitle ? `<p style="font-size:19px;color:var(--ink-2);line-height:1.9">${esc(s.subtitle)}</p>` : ''}
      ${meta.length ? `<div style="display:flex;gap:12px;margin-top:4px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
      ${authors}
    </div>
    <div style="position:relative;height:78%;min-height:0;border-radius:26px;overflow:hidden;background:linear-gradient(155deg,var(--a-tint),var(--a-glow) 55%,transparent);border:1px solid var(--a-tintB);display:grid;place-items:center">
      <span style="position:absolute;width:340px;height:340px;border-radius:999px;border:1.5px solid var(--a-tintB);top:-90px;left:-90px"></span>
      <span style="position:absolute;width:200px;height:200px;border-radius:999px;background:var(--a-glow);bottom:-60px;right:-60px"></span>
      <span style="position:absolute;width:64px;height:64px;border-radius:18px;background:var(--a-tint);border:1px solid var(--a-tintB);top:52px;right:56px;transform:rotate(14deg)"></span>
      <span style="width:150px;height:150px;border-radius:38px;background:var(--a-grad);display:grid;place-items:center;color:var(--on-accent);box-shadow:var(--shadow-lg);transform:rotate(-6deg)">${svgIcon(icon, 74)}</span>
    </div>
  </div>
  ${foot(deck, 0, deck.slides.length)}`
  }

  /* ── واریانت band: نوار گرادیانی تمام‌عرض دور عنوان ── */
  if (variant === 'band') {
    return `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;min-height:0">
    ${s.badge ? `<span class="chip chip-plain"><span class="dot"></span>${esc(s.badge)}</span>` : ''}
    <div style="width:100%;max-width:1080px;background:var(--a-grad);border-radius:26px;padding:48px 62px;box-shadow:var(--shadow-lg)">
      <h1 style="font-size:52px;font-weight:900;line-height:1.3;color:var(--on-accent)">${esc(s.title)}</h1>
    </div>
    ${s.subtitle ? `<p style="font-size:20px;color:var(--ink-2);line-height:1.9;max-width:880px">${esc(s.subtitle)}</p>` : ''}
    ${meta.length ? `<div style="display:flex;gap:12px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
    ${authorsLine(deck, true)}
  </div>
  ${foot(deck, 0, deck.slides.length)}`
  }

  /* ── واریانت frame: قاب کامل با نقاط تزئینی چهار گوشه ── */
  if (variant === 'frame') {
    const corner = (pos: string) => `<span style="position:absolute;${pos};width:9px;height:9px;border-radius:99px;background:var(--a-primary);box-shadow:0 0 10px var(--a-tintB)"></span>`
    return `
  <div style="flex:1;min-height:0;padding:10px 6px">
    <div style="height:100%;border:1.5px solid var(--a-tintB);border-radius:22px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:24px;padding:44px 56px">
      ${corner('top:16px;right:16px')}${corner('top:16px;left:16px')}${corner('bottom:16px;right:16px')}${corner('bottom:16px;left:16px')}
      ${s.badge ? `<span class="chip"><span class="dot"></span>${esc(s.badge)}</span>` : ''}
      <h1 style="font-size:54px;font-weight:900;line-height:1.3;max-width:960px">${esc(s.title)}</h1>
      <div style="width:96px;height:5px;border-radius:99px;background:var(--a-grad)"></div>
      ${s.subtitle ? `<p style="font-size:20px;color:var(--ink-2);line-height:1.9;max-width:840px">${esc(s.subtitle)}</p>` : ''}
      ${meta.length ? `<div style="display:flex;gap:12px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
      ${authorsLine(deck, true)}
    </div>
  </div>
  ${foot(deck, 0, deck.slides.length)}`
  }

  /* ── واریانت minimal: تایپ درشت هم‌تراز با لبه، بدون شلوغی ── */
  if (variant === 'minimal') {
    return `
  <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:right;gap:26px;padding:0 14px">
    ${s.badge ? `<span class="chip chip-plain">${esc(s.badge)}</span>` : ''}
    <h1 style="font-size:72px;font-weight:900;line-height:1.18;max-width:1060px;letter-spacing:-.015em">${esc(s.title)}</h1>
    ${s.subtitle ? `<p style="font-size:21px;color:var(--ink-2);line-height:1.9;max-width:840px;border-right:4px solid var(--a-primary);padding-right:18px">${esc(s.subtitle)}</p>` : ''}
    ${meta.length ? `<div style="display:flex;gap:12px;margin-top:6px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
    ${authors}
  </div>
  ${foot(deck, 0, deck.slides.length)}`
  }

  /* ── واریانت center: پیش‌فرض کلاسیک ── */
  return `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:26px">
    ${s.badge ? `<span class="chip"><span class="dot"></span>${esc(s.badge)}</span>` : ''}
    <h1 style="font-size:64px;font-weight:900;line-height:1.25;max-width:1000px">${esc(s.title)}</h1>
    <div style="width:110px;height:6px;border-radius:99px;background:var(--a-grad)"></div>
    ${s.subtitle ? `<p style="font-size:22px;color:var(--ink-2);line-height:1.9;max-width:860px">${esc(s.subtitle)}</p>` : ''}
    ${meta.length ? `<div style="display:flex;gap:12px;margin-top:6px">${meta.map((m) => `<span class="chip chip-plain">${esc(m)}</span>`).join('')}</div>` : ''}
    ${authorsLine(deck, true)}
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
  /* حالت فشرده: با ۵ آیتم به بالا ردیف‌ها جمع‌تر می‌شوند تا هیچ کارتی با فوتر تداخل نکند */
  const tight = s.items.length >= 5
  const rows = s.items
    .map((it, i) => {
      const icon = it.icon && ICON_BODIES[it.icon] ? svgIcon(it.icon, tight ? 17 : 20) : ''
      const iconChip = icon
        ? `<span style="width:${tight ? 32 : 40}px;height:${tight ? 32 : 40}px;border-radius:${tight ? 10 : 13}px;background:var(--a-tint);border:1px solid var(--a-tintB);color:var(--a-primary);display:grid;place-items:center;flex-shrink:0">${icon}</span>`
        : `<span class="dot" style="margin-top:${tight ? 9 : 12}px;flex-shrink:0"></span>`
      return it.title
        ? `<div class="card" style="display:flex;gap:${tight ? 12 : 16}px;padding:${tight ? '11px 20px' : '18px 22px'};align-items:flex-start">
            ${it.image ? `<span style="width:120px;height:86px;border-radius:14px;overflow:hidden;flex-shrink:0">${imgTag(it.image, it.title, 'b' + i)}</span>` : iconChip}
            <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
              <span style="font-size:${tight ? 15.5 : 17}px;font-weight:700">${esc(it.title)}</span>
              <span style="font-size:${tight ? 13.8 : 15}px;color:var(--ink-2);line-height:${tight ? 1.65 : 1.85}">${esc(it.text)}</span>
            </div>
          </div>`
        : `<div style="display:flex;gap:${tight ? 12 : 16}px;padding:${tight ? '9px 20px' : '14px 22px'};align-items:flex-start" class="card-tint">
            ${it.image ? `<span style="width:120px;height:86px;border-radius:14px;overflow:hidden;flex-shrink:0">${imgTag(it.image, it.text.slice(0, 60), 'b' + i)}</span>` : iconChip}
            <span style="font-size:${tight ? 14.5 : 16.5}px;line-height:${tight ? 1.7 : 1.9}">${esc(it.text)}</span>
          </div>`
    })
    .join('')
  return `${head(s, deck)}
  <div class="body"><section style="flex:1;display:flex;flex-direction:column;gap:${tight ? 8 : 12}px;justify-content:center;min-height:0">${rows}</section></div>
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
    ${authorsLine(deck, true)}
  </div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderImage(s: Extract<DeckSlide, { type: 'image' }>, deck: DeckJSON, idx: number): string {
  return `
  <div style="flex:1;display:grid;grid-template-columns:1.15fr .85fr;gap:0;min-height:0;border-radius:22px;overflow:hidden;position:relative">
    <div style="position:relative;min-height:0">${imgTag(s.image, s.title, 'slide')}</div>
    <div style="display:flex;flex-direction:column;justify-content:center;gap:16px;padding:40px 42px;background:linear-gradient(160deg,var(--a-tint),transparent 70%);border-right:1px solid var(--line);min-width:0">
      ${s.kicker ? `<div class="kicker"><span class="dot"></span>${esc(s.kicker)}</div>` : ''}
      <h1 style="font-size:30px;font-weight:900;line-height:1.5">${esc(s.title)}</h1>
      ${s.text ? `<p style="font-size:16.5px;color:var(--ink-2);line-height:2">${esc(s.text)}</p>` : ''}
      ${s.caption ? `<span style="font-size:12.5px;color:var(--ink-3);display:flex;align-items:center;gap:8px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="3" stroke="var(--ink-3)" stroke-width="2"/><circle cx="9" cy="10" r="2" fill="var(--ink-3)"/><path d="M5 18l4.5-5 3.5 4 3-3 3 4" stroke="var(--ink-3)" stroke-width="2" stroke-linejoin="round"/></svg>${esc(s.caption)}</span>` : ''}
    </div>
  </div>
  ${foot(deck, idx, deck.slides.length)}`
}

/* ── اسلاید جداکننده بخش: توقف بصری بین فصل‌های ارائه (واریانت قالب) ── */
function renderSection(s: Extract<DeckSlide, { type: 'section' }>, deck: DeckJSON, idx: number, styleKey: DeckStyle): string {
  const variant = DECK_STYLES[styleKey].cover
  /* نوار گرادیانی — قالب‌های band (شب نئون، کلاسیک، شرکتی) */
  if (variant === 'band') {
    return `
  <div style="flex:1;display:grid;place-items:center;min-height:0">
    <div style="background:var(--a-grad);border-radius:26px;padding:50px 68px;text-align:center;max-width:960px;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:18px;align-items:center">
      ${s.kicker ? `<span style="background:rgba(0,0,0,.16);color:var(--on-accent);border-radius:999px;padding:7px 18px;font-weight:800;font-size:13px">${esc(s.kicker)}</span>` : ''}
      <h1 style="font-size:50px;font-weight:900;line-height:1.3;color:var(--on-accent);max-width:820px">${esc(s.title)}</h1>
      ${s.subtitle ? `<p style="font-size:18px;color:var(--on-accent);opacity:.88;line-height:1.9;max-width:760px">${esc(s.subtitle)}</p>` : ''}
    </div>
  </div>
  ${foot(deck, idx, deck.slides.length)}`
  }
  /* قاب — قالب‌های frame (اکادمیک، خط فارسی) */
  if (variant === 'frame') {
    return `
  <div style="flex:1;min-height:0;padding:10px 6px">
    <div style="height:100%;border:1.5px solid var(--a-tintB);border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:20px;padding:40px">
      ${s.kicker ? `<span class="chip"><span class="dot"></span>${esc(s.kicker)}</span>` : ''}
      <h1 style="font-size:48px;font-weight:900;line-height:1.35;max-width:900px">${esc(s.title)}</h1>
      <div style="width:88px;height:5px;border-radius:99px;background:var(--a-grad)"></div>
      ${s.subtitle ? `<p style="font-size:18px;color:var(--ink-2);line-height:1.9;max-width:760px">${esc(s.subtitle)}</p>` : ''}
    </div>
  </div>
  ${foot(deck, idx, deck.slides.length)}`
  }
  return `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:22px">
    ${s.kicker ? `<span class="chip"><span class="dot"></span>${esc(s.kicker)}</span>` : ''}
    <h1 style="font-size:54px;font-weight:900;line-height:1.35;max-width:980px">${esc(s.title)}</h1>
    <div style="width:96px;height:5px;border-radius:99px;background:var(--a-grad)"></div>
    ${s.subtitle ? `<p style="font-size:19px;color:var(--ink-2);line-height:1.9;max-width:800px">${esc(s.subtitle)}</p>` : ''}
  </div>
  ${foot(deck, idx, deck.slides.length)}`
}

/* ── مقایسه دوستونی با نماد تیک/ضربدر (تمام SVG — بدون تصویر) ── */
function renderComparison(s: Extract<DeckSlide, { type: 'comparison' }>, deck: DeckJSON, idx: number): string {
  const col = (c: { heading: string; points: string[] }, good: boolean): string => {
    const color = good ? 'var(--g-green)' : 'var(--g-red)'
    const bg = good ? 'rgba(129,201,149,.16)' : 'rgba(242,139,130,.16)'
    const mark = good
      ? '<path d="M20 6L9 17l-5-5"/>'
      : '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>'
    const rows = c.points
      .map(
        (p) => `<div style="display:flex;gap:10px;align-items:flex-start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-top:5px;flex-shrink:0"><path d="${mark}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-size:15px;line-height:1.8;color:var(--ink-2)">${esc(p)}</span>
        </div>`
      )
      .join('')
    return `<section class="card" style="padding:26px 28px;display:flex;flex-direction:column;gap:14px;min-height:0;border-top:3px solid ${color}">
      <h2 style="font-size:20px;font-weight:800;color:var(--ink);display:flex;align-items:center;gap:11px">
        <span style="width:30px;height:30px;border-radius:999px;display:grid;place-items:center;background:${bg};flex-shrink:0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="${mark}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>${esc(c.heading)}
      </h2>
      <div style="display:flex;flex-direction:column;gap:11px">${rows}</div>
    </section>`
  }
  return `${head(s, deck)}
  <div class="body"><section style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:20px;min-height:0">${col(s.left, true)}${col(s.right, false)}</section></div>
  ${foot(deck, idx, deck.slides.length)}`
}

function renderSlide(s: DeckSlide, deck: DeckJSON, idx: number, styleKey: DeckStyle): string {
  switch (s.type) {
    case 'cover': return renderCover(s, deck, styleKey)
    case 'agenda': return renderAgenda(s, deck, idx)
    case 'bullets': return renderBullets(s, deck, idx)
    case 'two-column': return renderTwoColumn(s, deck, idx)
    case 'stats': return renderStats(s, deck, idx)
    case 'quote': return renderQuote(s, deck, idx)
    case 'image': return renderImage(s, deck, idx)
    case 'timeline': return renderTimeline(s, deck, idx)
    case 'conclusion': return renderConclusion(s, deck, idx)
    case 'section': return renderSection(s, deck, idx, styleKey)
    case 'comparison': return renderComparison(s, deck, idx)
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

/* ── Main entry ──
 * opts.branding (default true): shows the «آرشام پوینت» credit link in the
 * control bar. Pro-plan decks are rendered with branding:false.
 * opts.style: one of the 12 design templates (deck-styles.ts) — changes the
 * whole design language (background, fonts, cover composition, shapes). */
export function generateDeckHTML(
  deck: DeckJSON,
  opts: { accent?: DeckAccent; branding?: boolean; style?: DeckStyle } = {}
): string {
  const accent: DeckAccent = opts.accent ?? 'blue'
  const branding = opts.branding !== false
  const styleKey: DeckStyle = opts.style && isDeckStyle(opts.style) ? opts.style : 'modern'
  const lang = deck.language ?? 'fa'
  const dir = lang === 'fa' ? 'rtl' : 'ltr'
  const total = deck.slides.length

  const shells = deck.slides
    .map((s, i) => {
      const ovTitle =
        s.type === 'quote' ? (s.author ?? s.quote.slice(0, 60)) : ((s as { title?: string }).title ?? deck.title)
      return `<div class="shell" data-i="${i}"><div class="slide" data-ovtitle="${esc(ovTitle)}">${renderSlide(s, deck, i, styleKey)}</div></div>`
    })
    .join('\n')

  const fontFamilies = ['Vazirmatn:wght@100..900', 'Outfit:wght@100..900', ...styleGoogleFamilies(styleKey)]

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}" class="st-${styleKey}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(deck.title)}</title>
<meta name="generator" content="آرشام پوینت (Arsham Point) — ساخت پاورپوینت فارسی با هوش مصنوعی">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fontFamilies.join('&family=')}&display=swap" rel="stylesheet">
<style>
${BASE_CSS}
${accentCss(accent, false)}
${accentCss(accent, true)}
${styleCss(styleKey, false)}
${styleCss(styleKey, true)}
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
  ${branding ? `<a id="credit" href="https://apoint.ir" target="_blank" rel="noopener" title="${lang === 'fa' ? 'ساخته‌شده با آرشام پوینت — ساخت پاورپوینت فارسی با هوش مصنوعی' : 'Made with Arsham Point — Persian AI presentations'}">&#10024; ${lang === 'fa' ? 'آرشام پوینت' : 'Arsham Point'}</a>` : ''}
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
