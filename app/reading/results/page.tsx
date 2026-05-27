"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { ReadingHistoryCard } from "@/components/ui/ReadingHistoryCard"
import { readingApi } from "@/lib/api"
import type { Reading } from "@/types"

export default function ReadingResultsPage() {
  const router = useRouter()
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 全件表示（ページネーション不要のため大きめの上限）
    readingApi.list({ limit: 100 }).then((res: any) => {
      const list = Array.isArray(res) ? res : (res.readings ?? [])
      setReadings(list.filter((r: any) => r.status === "completed"))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5">
        <div className="pt-9 pb-2">
          <Link href="/mypage"
            className="text-[12px] text-white/45 hover:text-white/75 transition-colors inline-flex items-center gap-1">
            ← マイページに戻る
          </Link>
        </div>
        <div className="pb-5 flex items-center gap-2.5">
          <span className="text-gold text-sm">✦</span>
          <h1 className="font-serif text-xl text-[#F0F0F8]">鑑定履歴</h1>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
          <span className="text-gold text-sm">✦</span>
        </div>

        {loading && (
          <div className="text-center text-white/40 py-12">読み込み中...</div>
        )}

        {!loading && readings.length === 0 && (
          <div className="text-center text-white/40 py-12">
            <p className="mb-4">まだ鑑定履歴がありません</p>
            <button onClick={() => router.push("/reading")}
              className="btn-gold px-6 py-3 text-[14px]">
              鑑定を始める
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {readings.map(r => (
            <ReadingHistoryCard key={r.reading_id} reading={r} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
