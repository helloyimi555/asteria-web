"use client"

interface ChapterHeadingProps {
  number: number | string
  title:  string
  subtitle?: string
  color?: string   // アクセント色（章ごとに変える）
}

/** 鑑定書の章見出し。左に Chapter 番号バッジ、中央にタイトル＋サブ、右に星装飾。
 *  ASTERIA デザインシステム 04. Chapter見出し */
export function ChapterHeading({ number, title, subtitle, color = "#C9A554" }: ChapterHeadingProps) {
  const num = String(number).padStart(2, "0")
  return (
    <div className="flex items-stretch gap-3 mt-6 mb-3">
      {/* Chapter 番号バッジ */}
      <div className="flex flex-col items-center justify-center shrink-0 rounded-xl px-3.5 py-1.5"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}0D)`,
          border:     `1px solid ${color}55`,
        }}>
        <span className="font-serif text-[8px] tracking-[0.2em] leading-none mb-0.5" style={{ color: `${color}CC` }}>
          Chapter
        </span>
        <span className="font-serif text-[20px] leading-none" style={{ color }}>{num}</span>
      </div>

      {/* タイトル */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h2 className="font-serif text-[16px] text-[#F7F3E7] leading-tight tracking-wide">{title}</h2>
        {subtitle && (
          <p className="font-sans text-[11px] text-white/45 mt-0.5 leading-snug">{subtitle}</p>
        )}
      </div>

      {/* 星装飾 */}
      <div className="shrink-0 flex items-center gap-1 pr-0.5">
        <span className="text-[9px]" style={{ color: `${color}66` }}>✦</span>
        <span className="text-[13px]" style={{ color: `${color}AA` }}>✦</span>
      </div>
    </div>
  )
}
