"use client"
import Link from "next/link"
import type { ReactNode } from "react"

// ASTERIA デザインシステム 01. カードコンポーネント
// カラー: #090E1F / #0F1530 / #19223D / #C9A554 / #F7F3E7

/** 01-A 通常カード：ゴールドボーダー・星アイコン・任意で「詳細を見る >」フッター */
export function InfoCard({
  title, children, icon = "✦", footerLabel, footerHref,
}: {
  title?: string
  children?: ReactNode
  icon?: string
  footerLabel?: string
  footerHref?: string
}) {
  return (
    <div className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg,#0F1530,#0B1126)", border: "1px solid rgba(201,165,84,.3)" }}>
      {title && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-gold text-sm">{icon}</span>
          <span className="font-serif text-[15px] text-[#F7F3E7]">{title}</span>
        </div>
      )}
      {children && (
        <div className="font-serif text-[13px] leading-[1.85] text-white/75 font-light">{children}</div>
      )}
      {footerLabel && (
        <div className="mt-3 pt-3 border-t border-white/[0.08]">
          {footerHref ? (
            <Link href={footerHref} className="flex items-center justify-between text-[12px] text-gold/80 hover:text-gold">
              <span>{footerLabel}</span><span>›</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between text-[12px] text-gold/80">
              <span>{footerLabel}</span><span>›</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 01-C 注意カード：⚠ アイコン・ダークレッド背景・任意のキーワード */
export function AlertCard({
  title = "注意ポイント", children, keyword,
}: {
  title?: string
  children?: ReactNode
  keyword?: string
}) {
  return (
    <div className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg,rgba(48,20,26,.9),rgba(28,15,22,.9))", border: "1px solid rgba(240,150,120,.28)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: "#F5A623" }}>⚠</span>
        <span className="font-serif text-[15px]" style={{ color: "#F5C77E" }}>{title}</span>
      </div>
      {children && (
        <div className="font-serif text-[13px] leading-[1.85] text-[#E8D8C8] font-light">{children}</div>
      )}
      {keyword && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] text-[11px] text-[#F5A623]/80">
          キーワード：{keyword}
        </div>
      )}
    </div>
  )
}

/** 01-D ラッキーアクションカード：✸ アイコン・ダークグリーン背景・任意のラッキーアイテム */
export function LuckyCard({
  title = "ラッキーアクション", children, item,
}: {
  title?: string
  children?: ReactNode
  item?: string
}) {
  return (
    <div className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg,rgba(20,44,32,.9),rgba(14,30,22,.9))", border: "1px solid rgba(112,221,168,.28)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: "#8BC34A" }}>✸</span>
        <span className="font-serif text-[15px]" style={{ color: "#A8E08F" }}>{title}</span>
      </div>
      {children && (
        <div className="font-serif text-[13px] leading-[1.85] text-[#D8E8D0] font-light">{children}</div>
      )}
      {item && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] text-[11px] text-[#8BC34A]/85">
          ラッキーアイテム：{item}
        </div>
      )}
    </div>
  )
}
