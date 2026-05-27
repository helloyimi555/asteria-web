"use client"

/** 05. セクション区切り（ゴールドの装飾ライン）
 *  両側にグラデーションライン、中央に ✦ ◆ ✦ の装飾。
 *  任意でラベルを中央に表示できる。 */
export function SectionDivider({
  label,
  className = "",
}: {
  label?: string
  className?: string
}) {
  if (label) {
    return (
      <div className={`flex items-center gap-2.5 my-5 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/35" />
        <span className="font-serif text-[12px] text-gold/80 tracking-widest whitespace-nowrap">✦ {label} ✦</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/35" />
      </div>
    )
  }
  // ✦ · · · ✦ · · · ✦ のゴールド装飾ライン
  return (
    <div className={`flex items-center justify-center gap-1.5 my-6 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
      <span className="text-gold/70 text-[10px]">✦</span>
      <span className="text-gold/30 text-[7px] tracking-[0.3em]">···</span>
      <span className="text-gold text-[13px]">✦</span>
      <span className="text-gold/30 text-[7px] tracking-[0.3em]">···</span>
      <span className="text-gold/70 text-[10px]">✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
    </div>
  )
}
