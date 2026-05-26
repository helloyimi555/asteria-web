"use client"
import { useState } from "react"

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
}
const PLANET_COLORS: Record<string, string> = {
  Sun: "#FFD700", Moon: "#C0C0FF", Mercury: "#90EE90", Venus: "#FFB6C1",
  Mars: "#FF6B6B", Jupiter: "#FFA500", Saturn: "#C9A554", Uranus: "#7FDBFF",
  Neptune: "#9B59B6", Pluto: "#E74C3C",
}

// 円上の天体配置半径（コンテナ幅の % で表現。黄道輪の内側に寄せた配置）
const PLANET_RADIUS_PCT = 35

interface PlanetPosition {
  planet: string
  sign_ja: string
  degree: number
  sign_degree: number
  retrograde: boolean
}

interface DegreeMeaning {
  title:  string
  short:  string
  detail: string
}

interface NatalChartProps {
  positions: PlanetPosition[]
  meanings?: Record<string, DegreeMeaning>
}

export default function NatalChart({ positions, meanings }: NatalChartProps) {
  // degree=0（牡羊座0度）が真上、時計回りに進む座標系を維持
  const polarToPct = (degree: number) => {
    const a = (degree - 90) * Math.PI / 180
    return {
      left: 50 + PLANET_RADIUS_PCT * Math.cos(a),
      top:  50 + PLANET_RADIUS_PCT * Math.sin(a),
    }
  }

  return (
    <div className="card p-4 mt-2.5">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-gold text-xs">✦</span>
        <span className="text-[12px] font-bold text-[#F0F0F8]">ネイタルチャート</span>
        <span className="text-[10px] text-white/30 ml-1">出生時の天体配置</span>
      </div>

      <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-full overflow-hidden"
        style={{ background:"radial-gradient(circle at center, rgba(15,20,50,.95) 0%, rgba(8,12,30,.95) 70%, #060920 100%)" }}>

        {/* ゴールドの淡いグロー */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background:"radial-gradient(circle at center, rgba(201,165,84,.10), transparent 55%)" }} />

        {/* 黄道輪（静止） */}
        <img
          src="/asteria/loading/zodiac-ring-transparent.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-90 pointer-events-none select-none"
          draggable={false}
        />

        {/* 中央 ASTERIA ロゴ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32%] pointer-events-none">
          <img
            src="/asteria/loading/center-logo-transparent.png"
            alt="ASTERIA"
            className="w-full object-contain opacity-95 select-none"
            draggable={false}
          />
        </div>

        {/* 天体アイコン */}
        {positions.map((p, i) => {
          const pos = polarToPct(p.degree)
          const color = PLANET_COLORS[p.planet] ?? "#C9A554"
          const symbol = PLANET_SYMBOLS[p.planet] ?? "✦"
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
              style={{
                left:       `${pos.left}%`,
                top:        `${pos.top}%`,
                width:      "7.5%",
                aspectRatio: "1 / 1",
                background: "rgba(10,12,40,.92)",
                border:     `1.2px solid ${color}`,
                boxShadow:  `0 0 8px ${color}40`,
                color,
              }}
            >
              <span style={{ fontSize: 11, lineHeight: 1 }}>{symbol}</span>
              {p.retrograde && (
                <span className="absolute -top-1 -right-1 text-[8px] leading-none"
                  style={{ color }}>℞</span>
              )}
            </div>
          )
        })}
      </div>

      {/* 天体一覧 */}
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {positions.map((p, i) => (
          <PlanetCard key={i} position={p} meaning={meanings?.[p.planet]} />
        ))}
      </div>
    </div>
  )
}

function PlanetCard({ position, meaning }: { position: PlanetPosition; meaning?: DegreeMeaning }) {
  const [expanded, setExpanded] = useState(false)
  const color  = PLANET_COLORS[position.planet] ?? "#C9A554"
  const symbol = PLANET_SYMBOLS[position.planet] ?? "✦"

  return (
    <div className="flex flex-col gap-1.5 px-2 py-2 rounded-lg"
      style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
      <div className="flex items-center gap-2">
        <span style={{ color, fontSize:14 }}>{symbol}</span>
        <div className="min-w-0">
          <div className="text-[10px] text-white/50">{position.planet}</div>
          <div className="text-[11px] text-white/80">
            {position.sign_ja} {position.sign_degree.toFixed(1)}°
            {position.retrograde && <span className="text-[9px] text-gold/60 ml-1">℞</span>}
          </div>
        </div>
      </div>

      {meaning && (
        <>
          {meaning.title && (
            <div className="text-[10px] text-gold/85 font-medium leading-tight">
              {meaning.title}
            </div>
          )}
          {meaning.short && (
            <div className="text-[10px] text-white/55 leading-snug">
              {meaning.short}
            </div>
          )}
          {meaning.detail && (
            <>
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="self-start text-[9px] text-gold/70 hover:text-gold transition-colors">
                {expanded ? "閉じる ∧" : "詳しく見る ∨"}
              </button>
              {expanded && (
                <div className="text-[10px] text-white/70 leading-relaxed pt-1.5 mt-0.5 border-t border-white/[0.06]">
                  {meaning.detail}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}