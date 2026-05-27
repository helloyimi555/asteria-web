"use client"

/** 05. セクション区切り（ゴールドの装飾ライン）
 *  ラベルなし：装飾ライン画像（divider-star.png）。
 *  ラベルあり：両側グラデーションライン＋中央テキスト。 */
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
  // 装飾ライン画像
  return (
    <div className={`my-4 flex justify-center ${className}`}>
      <img src="/asteria/assets/divider-star.png" alt="" className="w-full max-w-[320px] opacity-80" />
    </div>
  )
}
