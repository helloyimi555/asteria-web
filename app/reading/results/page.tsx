"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { readingApi } from "@/lib/api"
import type { Reading } from "@/types"

const THEME_LABEL: Record<string, string> = {
  general:      "総合運",
  work:         "仕事運",
  love:         "恋愛運",
  health:       "健康運",
  money:        "金運",
  relationship: "人間関係",
}

const PERIOD_LABEL = (r: Reading) => {
  if (!r.period_start || !r.period_end) return ""
  return `${r.period_start} 〜 ${r.period_end}`
}

export default function ReadingResultsPage() {
  const router = useRouter()
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    readingApi.list({ limit: 20 }).then(res => {
      setReadings(res.readings.filter(r => r.status === "completed"))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5">
        <div className="pt-9 pb-5 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white/70">
            ←
          </button>
          <h1 className="font-serif text-xl text-[#F0F0F8]">過去の鑑定</h1>
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

        <div className="space-y-3">
          {readings.map(r => (
            <button key={r.reading_id} onClick={() => router.push(`/reading/${r.reading_id}`)}
              className="card w-full p-4 text-left hover:border-gold/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold text-[#F0F0F8]">
                  {THEME_LABEL[r.theme] ?? r.theme}
                </span>
                <span className="text-[11px] text-white/30">
                  {new Date(r.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
              {r.outputs?.overall && (
                <p className="text-[12px] text-white/50 leading-relaxed line-clamp-2">
                  {r.outputs.overall}
                </p>
              )}
              <div className="text-[11px] text-gold/60 mt-2">
                {PERIOD_LABEL(r)}
              </div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}