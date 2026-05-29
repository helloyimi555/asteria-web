"use client"
import { type ReactElement } from "react"

type IconType = "heart" | "shield" | "chat" | "scales" | "star" | "moon"

export type ScoreField = {
  key: string
  label: string
  icon: IconType
  /** true の場合、表示値は 100 - raw（caution など「低い方が良い」項目向け） */
  invert?: boolean
}

export const SCORE_FIELDS: ScoreField[] = [
  { key: "love",          label: "恋愛",   icon: "heart" },
  { key: "trust",         label: "信頼感", icon: "shield" },
  { key: "communication", label: "会話",   icon: "chat" },
  { key: "values",        label: "価値観", icon: "scales" },
  { key: "growth",        label: "将来性", icon: "star" },
  { key: "caution",       label: "安心感", icon: "moon", invert: true },
]

/* =========================================================
 * Icons（line/fill 形状はゴールドの細線で統一）
 * ======================================================= */
function Icon({ type, className }: { type: IconType; className?: string }): ReactElement {
  const cls = className ?? "h-4 w-4"
  switch (type) {
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 21s-7-4.6-7-10.5A4.5 4.5 0 0112 6.5 4.5 4.5 0 0119 10.5C19 16.4 12 21 12 21z" />
        </svg>
      )
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
          <path d="M12 3l8 3v6c0 4.6-3.4 8.5-8 10-4.6-1.5-8-5.4-8-10V6l8-3z" />
        </svg>
      )
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
          <path d="M20 5H4v11h4l-1.5 3 4.5-3H20V5z" />
        </svg>
      )
    case "scales":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v18" />
          <path d="M5 21h14" />
          <path d="M5 8h14" />
          <path d="M5 8l-2.5 5.5a3.5 3.5 0 007 0L7 8" />
          <path d="M19 8l-2.5 5.5a3.5 3.5 0 007 0L21 8" />
        </svg>
      )
    case "star":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 2l2.5 6.7L21 9.5l-5 4.4 1.6 6.7L12 17.1l-5.6 3.5L8 13.9 3 9.5l6.5-.8L12 2z" />
        </svg>
      )
    case "moon":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M21 12.6A8.5 8.5 0 1111.4 3a7 7 0 009.6 9.6z" />
        </svg>
      )
  }
}

/* =========================================================
 * ScoreRing：大きな円形プログレスリング
 * ======================================================= */
export function ScoreRing({ score, size = 260 }: { score: number; size?: number }): ReactElement {
  const s = Math.max(0, Math.min(100, Math.round(score)))
  const center = size / 2
  const radius = center - 22
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - s / 100)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="block h-full w-full">
        <defs>
          <linearGradient id="compatRingGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0D880" />
            <stop offset="50%" stopColor="#C9A554" />
            <stop offset="100%" stopColor="#8A6E2F" />
          </linearGradient>
          <filter id="compatRingGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        {/* 装飾：背面の細い同心円 */}
        <circle cx={center} cy={center} r={radius + 12} fill="none" stroke="rgba(201,165,84,0.08)" strokeWidth="0.7" />
        <circle cx={center} cy={center} r={radius - 12} fill="none" stroke="rgba(201,165,84,0.06)" strokeWidth="0.5" />
        {/* トラック */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(201,165,84,0.16)" strokeWidth="6" />
        {/* グロー（下層） */}
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#compatRingGold)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            filter="url(#compatRingGlow)"
            opacity="0.55"
          />
          {/* 本体のアーク */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#compatRingGold)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </g>
        {/* リング上端に飾り星 */}
        <text x={center} y={center - radius + 5} textAnchor="middle" fontSize="14" fill="#E7D08A">✦</text>
      </svg>
      {/* 中央の数字 */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-serif font-bold leading-none text-[#E7D08A]"
          style={{ fontSize: Math.round(size * 0.34), textShadow: "0 0 30px rgba(201,165,84,.6), 0 0 12px rgba(201,165,84,.4)" }}
        >
          {s}
        </div>
        <div className="mt-1 font-serif text-[13px] tracking-wider text-gold/70">/100</div>
      </div>
    </div>
  )
}

/* =========================================================
 * RelationshipLabel：スコア下の「深く繋がれる関係」枠
 *   ※ compat-label-frame.png が公開されたら背景画像に差し替える前提。
 *     現状は CSS のみで控えめにフレーム化。
 * ======================================================= */
export function RelationshipLabel({ label }: { label: string }): ReactElement {
  return (
    <div className="my-6 flex w-full items-center justify-center gap-3 text-gold/85">
      <span className="h-px max-w-[80px] flex-1 bg-gradient-to-r from-transparent via-gold/40 to-gold/70" />
      <span className="text-[10px]">✦</span>
      <div className="relative px-6 py-2">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <span
          className="font-serif text-[15px] tracking-[0.08em] text-[#E7D08A]"
          style={{ textShadow: "0 0 16px rgba(201,165,84,.4)" }}
        >
          {label}
        </span>
      </div>
      <span className="text-[10px]">✦</span>
      <span className="h-px max-w-[80px] flex-1 bg-gradient-to-l from-transparent via-gold/40 to-gold/70" />
    </div>
  )
}

/* =========================================================
 * MetricBar：アイコン＋ラベル＋ゴールドバー＋数値
 * ======================================================= */
export function MetricBar({
  icon, label, value, invert = false,
}: { icon: IconType; label: string; value: number; invert?: boolean }): ReactElement {
  const raw = Math.max(0, Math.min(100, Math.round(value)))
  const displayValue = invert ? 100 - raw : raw
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gold"
        style={{ background: "rgba(201,165,84,0.08)", border: "1px solid rgba(201,165,84,0.45)" }}
      >
        <Icon type={icon} className="h-4 w-4" />
      </span>
      <span className="w-14 shrink-0 font-serif text-[13px] text-[#F0F0F8]/90">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${displayValue}%`,
            background: "linear-gradient(90deg, #F0D880 0%, #C9A554 60%, #B8923F 100%)",
            boxShadow: "0 0 10px rgba(201,165,84,0.55)",
          }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-serif text-[15px] font-bold text-[#E7D08A]">
        {displayValue}
      </span>
    </div>
  )
}
