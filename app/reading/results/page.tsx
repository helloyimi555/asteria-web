"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { ReadingHistoryCard } from "@/components/ui/ReadingHistoryCard"
import { readingApi } from "@/lib/api"
import type { Reading } from "@/types"

const PAGE_SIZE = 20

export default function ReadingResultsPage() {
  const router = useRouter()
  const [readings, setReadings] = useState<Reading[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)   // 1 始まり
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const offset = (page - 1) * PAGE_SIZE
    // TODO(課金): 無料プランは直近10件まで、プレミアムは全件表示の制限をここに追加予定
    //   例) free プランは offset/limit を clamp、または total を 10 でキャップして導線を出す
    readingApi.list({ status: "completed", limit: PAGE_SIZE, offset }).then((res: any) => {
      const list = Array.isArray(res) ? res : (res.readings ?? [])
      setReadings(list)
      // total が無い API の場合は「取得件数が PAGE_SIZE 未満なら最終ページ」とみなす
      setTotal(typeof res?.total === "number" ? res.total : offset + list.length)
    }).catch(() => {
      setReadings([])
    }).finally(() => setLoading(false))
    // ページ切替時は先頭へスクロール
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = page > 1
  const hasNext = page < totalPages

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

        {!loading && readings.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              {readings.map(r => (
                <ReadingHistoryCard key={r.reading_id} reading={r} />
              ))}
            </div>

            {/* ページネーション */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <div className="w-24">
                {hasPrev && (
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-full py-2.5 rounded-full text-[13px] transition-colors"
                    style={{ border: "1px solid rgba(201,165,84,.4)", color: "#C9A554", background: "rgba(201,165,84,.06)" }}>
                    ← 前へ
                  </button>
                )}
              </div>

              <div className="text-[12px] text-white/55 tabular-nums">
                <span className="text-gold font-bold">{page}</span>
                <span className="mx-1 text-white/30">/</span>
                {totalPages}ページ
              </div>

              <div className="w-24">
                {hasNext && (
                  <button
                    type="button"
                    onClick={() => setPage(p => p + 1)}
                    className="w-full py-2.5 rounded-full text-[13px] transition-colors"
                    style={{ border: "1px solid rgba(201,165,84,.4)", color: "#C9A554", background: "rgba(201,165,84,.06)" }}>
                    次へ →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
