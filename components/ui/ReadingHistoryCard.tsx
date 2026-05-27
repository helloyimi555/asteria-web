"use client"
import Link from "next/link"
import type { Reading } from "@/types"
import { formatReadingTitle, formatReadingDate, inferPeriodId } from "@/utils/dateUtils"
import { getThemeConfig } from "@/utils/themeConfig"

/** 鑑定履歴カード（マイページ・履歴一覧で共通利用）
 *  タイトル：期間＋テーマ＋対象期間の日付括弧、サブ：鑑定実行日 */
export function ReadingHistoryCard({ reading: r }: { reading: Reading }) {
  const cfg = getThemeConfig(r.theme)
  const period = inferPeriodId(r.period_start, r.period_end)

  return (
    <Link href={`/reading/${r.reading_id}`}
      className="card p-3.5 flex items-center gap-3 hover:border-gold/20 transition-colors"
      style={{ borderLeft: `3px solid ${cfg.color}` }}>
      <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}55`, color: cfg.color }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-[#F0F0F8] font-medium mb-0.5">
          {formatReadingTitle(r.theme, period, r.created_at, r.period_start, r.period_end)}
        </div>
        <div className="text-[11px] text-white/35">
          {formatReadingDate(r.created_at)}に鑑定
        </div>
      </div>
      <div className="flex items-center gap-1 text-gold shrink-0">
        <span className="text-[12px]">結果を見る</span>
        <span className="text-sm">→</span>
      </div>
    </Link>
  )
}
