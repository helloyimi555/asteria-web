"use client"

const SIGNS_JA = ["牡羊座","牡牛座","双子座","蟹座","獅子座","乙女座","天秤座","蠍座","射手座","山羊座","水瓶座","魚座"]
const SIGN_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"]
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
}
const PLANET_COLORS: Record<string, string> = {
  Sun: "#FFD700", Moon: "#C0C0FF", Mercury: "#90EE90", Venus: "#FFB6C1",
  Mars: "#FF6B6B", Jupiter: "#FFA500", Saturn: "#C9A554", Uranus: "#7FDBFF",
  Neptune: "#9B59B6", Pluto: "#E74C3C",
}

interface PlanetPosition {
  planet: string
  sign_ja: string
  degree: number
  sign_degree: number
  retrograde: boolean
}

interface NatalChartProps {
  positions: PlanetPosition[]
}

export default function NatalChart({ positions }: NatalChartProps) {
  const cx = 160
  const cy = 160
  const R_OUTER = 145
  const R_SIGN  = 128
  const R_INNER = 108
  const R_PLANET = 85

  // 度数をSVG角度に変換（0度=牡羊座0度=右、反時計回り）
  const degToAngle = (degree: number) => (degree - 90) * (Math.PI / 180)

  const polarToXY = (r: number, angleDeg: number) => {
    const a = degToAngle(angleDeg)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  return (
    <div className="card p-4 mt-2.5">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-gold text-xs">✦</span>
        <span className="text-[12px] font-bold text-[#F0F0F8]">ネイタルチャート</span>
        <span className="text-[10px] text-white/30 ml-1">出生時の天体配置</span>
      </div>

      <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto block">
        {/* 背景 */}
        <circle cx={cx} cy={cy} r={R_OUTER} fill="rgba(10,12,40,0.8)" stroke="rgba(201,165,84,.3)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R_INNER} fill="none" stroke="rgba(201,165,84,.2)" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={40} fill="rgba(201,165,84,.05)" stroke="rgba(201,165,84,.2)" strokeWidth="0.8" />

        {/* 12星座の区切り線 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30
          const outer = polarToXY(R_OUTER, angle)
          const inner = polarToXY(R_INNER, angle)
          return (
            <line key={i}
              x1={cx} y1={cy} x2={outer.x} y2={outer.y}
              stroke="rgba(201,165,84,.2)" strokeWidth="0.8" />
          )
        })}

        {/* 星座シンボル */}
        {SIGN_SYMBOLS.map((sym, i) => {
          const angle = i * 30 + 15
          const pos = polarToXY(R_SIGN, angle)
          return (
            <text key={i}
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(201,165,84,.6)" fontSize="11">
              {sym}
            </text>
          )
        })}

        {/* 天体 */}
        {positions.map((p, i) => {
          const pos = polarToXY(R_PLANET, p.degree)
          const color = PLANET_COLORS[p.planet] ?? "#C9A554"
          const symbol = PLANET_SYMBOLS[p.planet] ?? "✦"
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r="10"
                fill="rgba(10,12,40,0.9)"
                stroke={color} strokeWidth="1.2" />
              <text x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize="10">
                {symbol}
              </text>
              {p.retrograde && (
                <text x={pos.x + 8} y={pos.y - 8}
                  fill={color} fontSize="7" opacity="0.8">
                  ℞
                </text>
              )}
            </g>
          )
        })}

        {/* 中央ラベル */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="rgba(201,165,84,.7)" fontSize="9" fontFamily="serif">
          ASTERIA
        </text>
        <text x={cx} y={cy + 7} textAnchor="middle" fill="rgba(201,165,84,.4)" fontSize="7">
          ✦
        </text>
      </svg>

      {/* 天体一覧 */}
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {positions.map((p, i) => {
          const color = PLANET_COLORS[p.planet] ?? "#C9A554"
          const symbol = PLANET_SYMBOLS[p.planet] ?? "✦"
          return (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
              <span style={{ color, fontSize:14 }}>{symbol}</span>
              <div>
                <div className="text-[10px] text-white/50">{p.planet}</div>
                <div className="text-[11px] text-white/80">
                  {p.sign_ja} {p.sign_degree.toFixed(1)}°
                  {p.retrograde && <span className="text-[9px] text-gold/60 ml-1">℞</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}