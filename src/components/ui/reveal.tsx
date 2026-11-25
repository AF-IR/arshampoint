'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ظهور تدریجی هنگام ورود به دید (scroll reveal) —
 * با IntersectionObserver سبک، بدون هیچ کتابخانه‌ای.
 * «reduced-motion» و مرورگرهای بدون observer: فوراً نمایان. */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number /* میلی‌ثانیه — برای پلکانی شدن آیتم‌های یک ردیف */
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${shown ? 'reveal-in' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
