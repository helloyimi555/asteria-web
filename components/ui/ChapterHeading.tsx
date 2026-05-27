"use client"

interface ChapterHeadingProps {
  number: number | string
  title:  string
  subtitle?: string
  color?: string   // アクセント色（章ごとに変える）
}

// 六角形クリップ（縦長・上下が尖った六角形）
const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"

/** 鑑定書の章見出し。左にゴールドの縦線＋六角形 Chapter バッジ、中央にタイトル＋ゴールドライン、右に星装飾。
 *  ASTERIA デザインシステム 04. Chapter見出し */
export function ChapterHeading({ number, title, subtitle, color = "#C9A554" }: ChapterHeadingProps) {
  const num = String(number).padStart(2, "0")
  return (
    <div className="flex items-stretch gap-3 mt-6 mb-3">
      {/* ゴールドの縦線（2px） */}
      <div className="w-0.5 shrink-0 rounded-full self-stretch"
        style={{ background: `linear-gradient(to bottom, ${color}, ${color}55)` }} />

      {/* 六角形 Chapter バッジ（外周ゴールド＋内側ダークの2層でボーダー表現） */}
      <div className="shrink-0 flex items-center justify-center"
        style={{ width: 52, height: 56, clipPath: HEX_CLIP, background: `${color}AA` }}>
        <div className="flex flex-col items-center justify-center"
          style={{ width: 48, height: 52, clipPath: HEX_CLIP, background: `linear-gradient(135deg, #14193A, #0B1126)` }}>
          <span className="font-serif text-[7px] tracking-[0.18em] leading-none mb-0.5" style={{ color: `${color}CC` }}>
            Chapter
          </span>
          <span className="font-serif text-[19px] leading-none" style={{ color }}>{num}</span>
        </div>
      </div>

      {/* タイトル＋ゴールドライン */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2.5">
          <h2 className="font-serif text-[16px] text-[#F7F3E7] leading-tight tracking-wide whitespace-nowrap">{title}</h2>
          <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${color}66, transparent)` }} />
        </div>
        {subtitle && (
          <p className="font-sans text-[11px] text-white/45 mt-1 leading-snug">{subtitle}</p>
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
