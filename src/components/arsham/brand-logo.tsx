/* ─────────────────────────────────────────────────────────────
 * آرشام پوینت — dedicated brand mark v2 (inline SVG, no requests).
 *
 * Design: a bold "A" monogram (Arsham) whose apex carries a bright,
 * glowing "point" (پوینت) — the dot IS the brand story: the
 * presenter's pointer. A rising crossbar hints at growth charts; a
 * four-point spark marks the AI engine. Tile: cyan→blue→violet flow
 * with a glassy top-left highlight and a soft depth shade at the
 * bottom — premium app-icon feel.
 *
 * Pure server/client-safe component: no hooks, no event handlers,
 * so it can be imported by server components (SEO pages) and
 * client components (headers, auth view) alike.
 * ───────────────────────────────────────────────────────────── */

export const BRAND_GRADIENT =
  'linear-gradient(135deg, #8FC0FF 0%, #4285F4 45%, #7C5CF0 80%, #B36BF5 100%)'

/* دامنه رسمی — کنار نام برند در هدر و فوتر (ماندگار در همه صفحات) */
export function DomainChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-[#8AB4F8]/30 bg-[#8AB4F8]/10 px-1.5 py-[3px] text-[10px] font-bold leading-none text-[#8AB4F8] ${className}`}
      dir="ltr"
    >
      Apoint.ir
    </span>
  )
}

export function BrandMark({
  size = 40,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid place-items-center shrink-0 rounded-[26%] shadow-lg shadow-[#4285F4]/35 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, borderRadius: '26%' }}
      >
        <defs>
          <linearGradient id="apBg" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8FC0FF" />
            <stop offset="0.45" stopColor="#4285F4" />
            <stop offset="0.8" stopColor="#7C5CF0" />
            <stop offset="1" stopColor="#B36BF5" />
          </linearGradient>
          <radialGradient
            id="apHi"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(13 9) rotate(64) scale(26)"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.38" />
            <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.07" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="apShade" x1="24" y1="48" x2="24" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0B0C14" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0B0C14" stopOpacity="0" />
          </linearGradient>
          <filter id="apGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* tile: gradient + glass highlight + depth shade */}
        <rect width="48" height="48" rx="13" fill="url(#apBg)" />
        <rect width="48" height="48" rx="13" fill="url(#apHi)" />
        <rect width="48" height="48" rx="13" fill="url(#apShade)" />

        {/* premium double ring */}
        <rect x="1" y="1" width="46" height="46" rx="12.2" stroke="rgba(255,255,255,.5)" strokeWidth="1.1" />
        <rect x="3.4" y="3.4" width="41.2" height="41.2" rx="10" stroke="rgba(255,255,255,.14)" strokeWidth="1" />

        {/* "A" legs */}
        <path
          d="M12.2 39.2 L24 10.4 L35.8 39.2"
          stroke="#0B0C14"
          strokeWidth="4.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* rising crossbar — chart-like growth */}
        <path
          d="M16.6 30.9 L24 26.3 L31.4 30.9"
          stroke="#0B0C14"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* the point (پوینت) — glowing apex dot */}
        <circle cx="24" cy="7.6" r="5.4" fill="#FFFFFF" opacity="0.3" filter="url(#apGlow)" />
        <circle cx="24" cy="7.6" r="3.2" fill="#FFFFFF" />
        <circle cx="24" cy="7.6" r="1.35" fill="#4285F4" />
        {/* AI spark */}
        <path
          d="M39.8 5.4l1.15 2.35 2.35 1.15-2.35 1.15-1.15 2.35-1.15-2.35-2.35-1.15 2.35-1.15z"
          fill="#FFFFFF"
          opacity="0.95"
        />
      </svg>
    </span>
  )
}
