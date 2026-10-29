'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Play, Download, Trash2, FileCode2, Presentation, Layers, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/client-auth'
import { ACCENTS, faDate, faNum, type DeckMeta } from './types'

interface Props {
  decks: DeckMeta[]
  onPreview: (deck: DeckMeta) => void
  onDelete: (id: string) => void
}

export function DeckGrid({ decks, onPreview, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  async function downloadDeck(d: DeckMeta) {
    setDownloading(d.id)
    try {
      const res = await apiFetch(`/api/presentations/${d.id}/html`)
      if (!res.ok) throw new Error()
      const html = await res.text()
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${d.title.replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || 'presentation'}.html`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
    } catch {
      /* ignore — button state resets */
    } finally {
      setDownloading(null)
    }
  }

  if (decks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.02] p-14 text-center">
        <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-[#8AB4F8]/10 text-[#8AB4F8] mb-4">
          <Presentation className="w-8 h-8" />
        </span>
        <h3 className="font-black text-lg">هنوز پرزنتیشنی ندارید</h3>
        <p className="text-sm text-[#9AA0A6] mt-2 leading-7 max-w-sm mx-auto">
          اولین ارائه خود را از فرم بالا بسازید؛ به‌صورت HTML تک‌فایلی تولید، در همین صفحه اجرا و قابل دانلود می‌شود.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {decks.map((d) => {
        const accent = ACCENTS.find((a) => a.key === d.theme) ?? ACCENTS[0]
        return (
          <Card key={d.id} className="group relative overflow-hidden rounded-3xl border-white/10 bg-[#15171C] p-0 hover:border-white/25 transition-colors">
            {/* mini slide preview strip */}
            <div className="h-24 relative overflow-hidden" style={{ background: `radial-gradient(220px 120px at 85% -20%, ${accent.ring}, transparent 60%), #0E1015` }}>
              <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="h-2 w-16 rounded-full" style={{ background: accent.color }} />
                <span className="font-black text-sm text-[#E8EAED] line-clamp-2 leading-6">{d.title}</span>
              </div>
              <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-[#9AA0A6] bg-black/40 border border-white/10 rounded-full px-2.5 py-1">
                <Layers className="w-3 h-3" /> {faNum(d.slideCount)} اسلاید
              </span>
            </div>

            <div className="p-5 pt-4">
              <p className="text-xs text-[#9AA0A6] line-clamp-1 mb-3">موضوع: {d.topic}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#9AA0A6]">{faDate(d.createdAt)}</span>
                <span className="flex items-center gap-1 text-[11px] text-[#9AA0A6]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent.color }} />
                  {accent.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => onPreview(d)}
                  className="flex-1 h-9 font-bold bg-gradient-to-l from-[#4285F4] to-[#8AB4F8] text-[#0B0C0F] hover:opacity-90"
                >
                  <Play className="w-4 h-4 ml-1" /> نمایش
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 border-white/15 bg-white/5 hover:bg-white/10"
                  title="دانلود HTML"
                  disabled={downloading === d.id}
                  onClick={() => downloadDeck(d)}
                >
                  {downloading === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 border-white/15 bg-white/5 hover:bg-[#F28B82]/15 hover:text-[#F28B82] hover:border-[#F28B82]/40"
                      title="حذف"
                      onClick={() => setDeleting(d.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1E2127] border-white/10" dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف پرزنتیشن؟</AlertDialogTitle>
                      <AlertDialogDescription className="leading-7">
                        «{d.title}» برای همیشه حذف می‌شود و قابل بازگشت نیست.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="bg-white/5 border-white/10">انصراف</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#D93025] hover:bg-[#b42b21] text-white"
                        onClick={() => onDelete(d.id)}
                      >
                        حذف کن
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-l from-transparent via-[#8AB4F8]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        )
      })}
      <p className="sr-only flex items-center gap-1"><FileCode2 /> خروجی HTML</p>
    </div>
  )
}
