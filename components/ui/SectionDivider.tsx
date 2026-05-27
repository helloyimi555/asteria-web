"use client"
import { useId } from "react"

/** 05. セクション区切り（ゴールドの装飾ライン）
 *  ラベルなし：中央8点星（ゴールドグロー）＋渦巻き装飾＋ダイヤ＋横線の SVG（透過・白箱なし）。
 *  ラベルあり：両側グラデーションライン＋中央テキスト。 */
export function SectionDivider({
  label,
  className = "",
}: {
  label?: string
  className?: string
}) {
  // 複数同時描画でも filter id が衝突しないよう一意化（: は url 参照で避ける）
  const glowId = `divider-glow-${useId().replace(/:/g, "")}`

  if (label) {
    return (
      <div className={`flex items-center gap-2.5 my-5 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/35" />
        <span className="font-serif text-[12px] text-gold/80 tracking-widest whitespace-nowrap">✦ {label} ✦</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/35" />
      </div>
    )
  }

  // 中央8点星＋渦巻き＋ダイヤ＋横線の装飾ライン（SVG・背景透過）
  return (
    <div className={`my-6 flex w-full items-center justify-center ${className}`}>
      <svg viewBox="0 0 320 32" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px]">
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 横線（左） */}
        <line x1="0" y1="16" x2="110" y2="16" stroke="#C9A554" strokeWidth="0.5" strokeOpacity="0.5" />
        {/* 左ダイヤ */}
        <polygon points="110,16 114,12 118,16 114,20" fill="#C9A554" fillOpacity="0.6" />
        {/* 左渦巻き（自然な曲線のフィリグリー） */}
        <path d="M122,16 C129,16 132,10 138,12 C143,14 141,20 136,19 C132,18 132,14 135,15"
          fill="none" stroke="#C9A554" strokeWidth="0.8" strokeOpacity="0.7" strokeLinecap="round" />

        {/* 中央8点星（ゴールドグロー） */}
        <text x="160" y="22" textAnchor="middle" fontSize="16" fill="#C9A554" filter={`url(#${glowId})`}>✦</text>

        {/* 右渦巻き（左右反転） */}
        <path d="M198,16 C191,16 188,10 182,12 C177,14 179,20 184,19 C188,18 188,14 185,15"
          fill="none" stroke="#C9A554" strokeWidth="0.8" strokeOpacity="0.7" strokeLinecap="round" />
        {/* 右ダイヤ */}
        <polygon points="202,16 206,12 210,16 206,20" fill="#C9A554" fillOpacity="0.6" />
        {/* 横線（右） */}
        <line x1="210" y1="16" x2="320" y2="16" stroke="#C9A554" strokeWidth="0.5" strokeOpacity="0.5" />
      </svg>
    </div>
  )
}
