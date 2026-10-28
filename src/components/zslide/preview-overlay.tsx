'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, ExternalLink, Maximize2, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/client-auth'
import type { DeckMeta } from './types'

interface Props {
  deck: DeckMeta
  onBack: () => void
}

export function PreviewOverlay({ deck, onBack }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let alive = true
    ;(async () => {
      try {
        const res = await apiFetch(`/api/presentations/${deck.id}/html`)
        if (!res.ok) throw new Error('load failed')
        const html = await res.text()
        if (!alive) return
        objectUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
        setHtmlUrl(objectUrl)
      } catch {
        if (alive) setError(true)
      }
    })()
    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [deck.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  return (
    <div ref={containerRef} className="fixed inset-0 z-[80] flex flex-col bg-[#0A0B0E]" dir="rtl">
      {/* toolbar */}
      <header className="flex items-center gap-3 px-4 sm:px-6 h-16 shrink-0 border-b border-white/10 bg-[#0E1015]">
        <Button size="sm" variant="outline" onClick={onBack} className="h-9 border-white/15 bg-white/5 hover:bg-white/10 font-bold">
          <ArrowRight className="w-4 h-4 ml-1" /> بازگشت
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-sm sm:text-base truncate">{deck.title}</h2>
          <p className="text-[11px] text-[#9AA0A6] truncate">
            پیش‌نمایش زنده — با کلیدهای جهت‌دار جابه‌جا شوید، O نمای کلی، F تمام‌صفحه
          </p>
        </div>
        {htmlUrl && (
          <a href={htmlUrl} target="_blank" rel="noreferrer" className="hidden sm:block">
            <Button size="sm" variant="outline" className="h-9 border-white/15 bg-white/5 hover:bg-white/10">
              <ExternalLink className="w-4 h-4 ml-1" /> تب جدید
            </Button>
          </a>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-9 border-white/15 bg-white/5 hover:bg-white/10"
          onClick={() => containerRef.current?.requestFullscreen?.()}
        >
          <Maximize2 className="w-4 h-4 ml-1" /> تمام‌صفحه
        </Button>
        {htmlUrl && (
          <a href={htmlUrl} download={`${deck.title.replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || 'presentation'}.html`}>
            <Button size="sm" className="h-9 font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90">
              <Download className="w-4 h-4 ml-1" /> دانلود HTML
            </Button>
          </a>
        )}
      </header>

      {/* live iframe — the actual standalone HTML runs here */}
      <main className="flex-1 min-h-0">
        {error ? (
          <div className="h-full grid place-items-center text-sm text-[#9AA0A6]">
            بارگذاری پرزنتیشن ناموفق بود. دوباره تلاش کنید.
          </div>
        ) : !htmlUrl ? (
          <div className="h-full grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-[#9AA0A6]">
              <Loader2 className="w-7 h-7 animate-spin text-[#8AB4F8]" />
              <p className="text-sm font-bold">در حال آماده‌سازی پیش‌نمایش…</p>
            </div>
          </div>
        ) : (
          <iframe
            src={htmlUrl}
            title={`پیش‌نمایش ${deck.title}`}
            className="w-full h-full border-0 bg-[#0A0B0E]"
            allow="fullscreen"
          />
        )}
      </main>
    </div>
  )
}
