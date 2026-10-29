'use client'

import { useCallback, useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { CreatePanel, GeneratingOverlay } from '@/components/zslide/create-panel'
import { DeckGrid } from '@/components/zslide/deck-grid'
import { PreviewOverlay } from '@/components/zslide/preview-overlay'
import { apiFetch, type SessionUser } from '@/lib/client-auth'
import type { DeckMeta, GeneratePayload } from '@/components/zslide/types'

/* پنل کاربر: ساخت ارائه جدید + کتابخانه ارائه‌ها */

export function Dashboard({
  user,
  initialTab = 'create',
}: {
  user: SessionUser
  initialTab?: 'create' | 'library'
}) {
  const [decks, setDecks] = useState<DeckMeta[]>([])
  const [loaded, setLoaded] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generatingWithImages, setGeneratingWithImages] = useState(false)
  const [preview, setPreview] = useState<DeckMeta | null>(null)
  const { toast } = useToast()

  const loadDecks = useCallback(async () => {
    const res = await apiFetch('/api/presentations')
    if (res.ok) {
      const data = await res.json()
      setDecks(data.decks ?? [])
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    loadDecks()
  }, [loadDecks])

  async function handleGenerate(payload: GeneratePayload) {
    setGenerating(payload.topic)
    setGeneratingWithImages(payload.visualMode === 'image')
    try {
      const res = await apiFetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'تولید پرزنتیشن ناموفق بود.')
      toast({
        title: 'پرزنتیشن آماده شد ✓',
        description: `«${data.deck.title}» با ${data.deck.slideCount} اسلاید ساخته شد.`,
      })
      await loadDecks()
      setPreview(data.deck as DeckMeta)
    } catch (err) {
      toast({
        title: 'خطا در تولید',
        description: err instanceof Error ? err.message : 'خطای ناشناخته',
        variant: 'destructive',
      })
    } finally {
      setGenerating(null)
      setGeneratingWithImages(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await apiFetch(`/api/presentations/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDecks((d) => d.filter((x) => x.id !== id))
      if (preview?.id === id) setPreview(null)
      toast({ title: 'حذف شد', description: 'پرزنتیشن از کتابخانه پاک شد.' })
    } else {
      toast({ title: 'حذف ناموفق بود', variant: 'destructive' })
    }
  }

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 grid gap-8" dir="rtl">
      <section>
        <h1 className="text-2xl font-black">سلام {user.name || 'کاربر'} 👋</h1>
        <p className="text-sm text-[#9AA0A6] mt-2 leading-7">
          از این‌جا پرزنتیشن‌های HTML خود را با هوش مصنوعی بسازید، اجرا کنید و دانلود بگیرید.
        </p>
      </section>

      <Tabs defaultValue={initialTab} dir="rtl" className="grid gap-6">
        <TabsList className="w-fit grid grid-cols-2 bg-white/5">
          <TabsTrigger value="create">ساخت ارائه جدید</TabsTrigger>
          <TabsTrigger value="library">کتابخانه من ({decks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <CreatePanel busy={!!generating} onGenerate={handleGenerate} />
        </TabsContent>

        <TabsContent value="library" className="grid gap-4">
          {loaded && decks.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.02] p-12 text-center">
              <h3 className="font-black">کتابخانه شما خالی است</h3>
              <p className="text-sm text-[#9AA0A6] mt-2">از تب «ساخت ارائه جدید» اولین ارائه‌تان را بسازید.</p>
            </div>
          )}
          <DeckGrid decks={decks} onPreview={setPreview} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      {generating && <GeneratingOverlay topic={generating} withImages={generatingWithImages} />}
      {preview && <PreviewOverlay deck={preview} onBack={() => setPreview(null)} />}
    </main>
  )
}

/* صفحه ارائه‌های من (کتابخانه تمام‌صفحه) */

export function PresentationsPage({ user }: { user: SessionUser }) {
  return <Dashboard user={user} initialTab="library" />
}
