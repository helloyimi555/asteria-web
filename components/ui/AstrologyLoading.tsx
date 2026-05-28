"use client"
import { useEffect, useState } from "react"

type AstrologyLoadingProps = {
  className?: string
  /** タイトル（例：「今週の総合運」）。指定しなければ「鑑定中」 */
  title?: string
  /** 日付（例：「2026年5月28日」）。指定しなければ今日の日付 */
  date?: string
  message?: string
  subMessage?: string
}

const STEPS = [
  "出生情報を解析中",
  "天体配置を計算中",
  "アスペクトを読み解き中",
  "鑑定文を生成中",
  "鑑定書を仕上げ中",
]
const STEP_INTERVAL_MS = 2500

function todayJa(): string {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default function AstrologyLoading({
  className = "",
  title = "鑑定中",
  date,
  message = "星読み中...",
  subMessage = "星があなたの運命を読み解いています。まもなく鑑定書が完成します。",
}: AstrologyLoadingProps) {
  const [step, setStep] = useState(0)
  const displayDate = date ?? todayJa()

  // 自動進行（最終ステップで停止）
  useEffect(() => {
    if (step >= STEPS.length - 1) return
    const t = setTimeout(() => setStep((s) => s + 1), STEP_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [step])

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[#04060F] px-4 py-6 text-[#F6F1E4] ${className}`}
    >
      {/* 鑑定書カード（背景画像と同じ縦横比に固定して、ホイールが画像どおりに収まるように） */}
      <div
        className="relative flex w-full max-w-[420px] flex-col items-center overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "853 / 1844",
          maxHeight: "92vh",
          backgroundColor: "#080C1E",
          backgroundImage: "url('/asteria/assets/loading-bg.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
      {/* 上部：ヘッダー＋日付＋タイトル */}
      <div className="relative z-10 mt-10 w-full px-6 text-center">
        <div className="flex items-center justify-center gap-2.5 text-gold/90">
          <span className="text-[10px]">✦</span>
          <span className="font-serif text-[13px] tracking-[0.34em]">ASTERIA READING</span>
          <span className="text-[10px]">✦</span>
        </div>
        {displayDate && (
          <p className="mt-4 font-serif text-[14px] text-[#E8E8F0]/85">{displayDate}</p>
        )}
        {title && (
          <h1
            className="mt-2 font-serif text-3xl tracking-wide text-gold"
            style={{ textShadow: "0 0 30px rgba(201,165,84,.55), 0 0 12px rgba(201,165,84,.35)" }}
          >
            {title}
          </h1>
        )}

        {/* 状態テキスト（鑑定中の直下。背景の12宮の円にかからないよう上に置く） */}
        <p
          className="mt-5 text-center font-serif text-[20px] tracking-wide text-[#F6F1E4]"
          style={{ textShadow: "0 0 14px rgba(201,165,84,.35)" }}
        >
          {message}
        </p>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-[#F6F1E4]/65">
          {subMessage}
        </p>
      </div>

      {/* 中央スペーサー（背景画像のホイールがここに見える） */}
      <div className="flex-1" />

      {/* 下部：区切り＋チェックリスト */}
      <div className="relative z-10 mb-10 w-full px-6">
        {/* 装飾区切り */}
        <div className="mb-4 flex items-center justify-center gap-2 text-gold/70">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-xs">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* 進捗チェックリスト */}
        <ol
          className="space-y-0 overflow-hidden rounded-xl border border-gold/30"
          style={{ background: "rgba(8,12,30,0.55)", backdropFilter: "blur(4px)" }}
        >
          {STEPS.map((label, i) => {
            const done = i < step
            const current = i === step
            return (
              <li
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i < STEPS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                  style={{
                    background: done
                      ? "rgba(201,165,84,0.35)"
                      : current
                      ? "rgba(201,165,84,0.18)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${done || current ? "rgba(201,165,84,0.6)" : "rgba(255,255,255,0.18)"}`,
                    color: done ? "#04060F" : current ? "#C9A554" : "rgba(255,255,255,0.45)",
                    boxShadow: current ? "0 0 16px rgba(201,165,84,0.55)" : "none",
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`flex-1 text-[13px] ${
                    done ? "text-white/80" : current ? "text-gold font-medium" : "text-white/40"
                  }`}
                >
                  {i + 1}. {label}
                </span>
                {/* 右側のコンスタレーション装飾（点線で結ばれた小さな星座風。状態でトーン変化） */}
                <svg
                  aria-hidden
                  width="64"
                  height="22"
                  viewBox="0 0 64 22"
                  className={`ml-auto shrink-0 ${
                    done ? "text-gold/60" : current ? "text-gold animate-pulse" : "text-white/20"
                  }`}
                  fill="none"
                >
                  <g stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.2 1.6" opacity="0.55">
                    <line x1="6" y1="16" x2="22" y2="5" />
                    <line x1="22" y1="5" x2="40" y2="14" />
                    <line x1="40" y1="14" x2="58" y2="6" />
                  </g>
                  <g fill="currentColor">
                    <circle cx="6" cy="16" r="1.1" />
                    <circle cx="40" cy="14" r="0.9" />
                  </g>
                  <text x="22" y="8.5" textAnchor="middle" fontSize="10" fill="currentColor">✦</text>
                  <text x="58" y="10" textAnchor="middle" fontSize="12" fill="currentColor">✧</text>
                </svg>
              </li>
            )
          })}
        </ol>
      </div>
      </div>
    </section>
  )
}
