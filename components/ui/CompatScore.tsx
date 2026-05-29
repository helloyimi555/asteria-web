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
            <stop offset="0%" stopColor="#FFE6B0" />
            <stop offset="35%" stopColor="#F0C16A" />
            <stop offset="65%" stopColor="#C99848" />
            <stop offset="100%" stopColor="#6E4D18" />
          </linearGradient>
          <filter id="compatRingGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {/* 装飾：背面・前面の同心円（多層） */}
        <circle cx={center} cy={center} r={radius + 24} fill="none" stroke="rgba(232,184,110,0.06)" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={radius + 16} fill="none" stroke="rgba(232,184,110,0.14)" strokeWidth="0.7" />
        <circle cx={center} cy={center} r={radius + 9}  fill="none" stroke="rgba(232,184,110,0.10)" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={radius - 9}  fill="none" stroke="rgba(232,184,110,0.10)" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={radius - 16} fill="none" stroke="rgba(232,184,110,0.14)" strokeWidth="0.7" />
        <circle cx={center} cy={center} r={radius - 24} fill="none" stroke="rgba(232,184,110,0.06)" strokeWidth="0.5" />
        {/* トラック */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(232,184,110,0.20)" strokeWidth="12" />
        {/* グロー（下層） */}
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#compatRingGold)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            filter="url(#compatRingGlow)"
            opacity="0.6"
          />
          {/* 本体のアーク */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#compatRingGold)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </g>
        {/* リング上端に飾り星 */}
        <text x={center} y={center - radius + 5} textAnchor="middle" fontSize="14" fill="#F0C870">✦</text>
      </svg>
      {/* 中央の数字 */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-serif font-bold leading-none text-[#F0C870]"
          style={{
            fontSize: Math.round(size * 0.36),
            textShadow: "0 0 14px rgba(232,184,110,.4), 0 0 3px rgba(240,200,112,.35)",
          }}
        >
          {s}
        </div>
        <div className="mt-1 font-serif text-[13px] tracking-wider text-[#D9B776]/85">/100</div>
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
    <div className="flex w-full justify-center">
      <div className="relative flex w-full max-w-[420px] items-center justify-center aspect-[1700/280]">
        {/* 装飾フレーム画像（compat-label-frame.png） */}
        <img
          src="/asteria/assets/compat-label-frame.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        {/* 中央テキスト */}
        <span
          className="relative font-serif text-[15px] tracking-[0.10em] text-[#F0C870]"
          style={{ textShadow: "0 0 14px rgba(232,184,110,.45), 0 0 4px rgba(240,200,112,.35)" }}
        >
          {label}
        </span>
      </div>
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
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#F0C870]"
        style={{ background: "rgba(232,184,110,0.10)", border: "1px solid rgba(232,184,110,0.50)" }}
      >
        <Icon type={icon} className="h-4 w-4" />
      </span>
      <span className="w-14 shrink-0 font-serif text-[13px] text-[#F0F0F8]/90">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${displayValue}%`,
            background: "linear-gradient(90deg, #FFE6B0 0%, #F0C16A 45%, #C99848 80%, #8A6B28 100%)",
            boxShadow: "0 0 12px rgba(232,184,110,0.65)",
          }}
        />
      </div>
      <span
        className="w-10 shrink-0 text-right font-serif text-[20px] font-bold leading-none text-[#F0C870]"
        style={{ textShadow: "0 0 10px rgba(232,184,110,0.45)" }}
      >
        {displayValue}
      </span>
    </div>
  )
}
