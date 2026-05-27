"use client"
import { Fragment } from "react"

interface ReadingCoverCardProps {
  date: string
  title: string
  theme: string
  keywords?: string[]
  message?: string
}

// 内側に散らす星屑（絶対配置・固定クラスで JIT に拾わせる）
const SCATTER = [
  "left-[10%] top-[16%] text-gold/40 text-[10px]",
  "left-[85%] top-[12%] text-gold/30 text-[8px]",
  "left-[16%] top-[44%] text-gold/25 text-[9px]",
  "left-[80%] top-[50%] text-gold/30 text-[9px]",
  "left-[8%] top-[70%] text-gold/30 text-[8px]",
  "left-[88%] top-[74%] text-gold/35 text-[10px]",
]

/** 高級な星読み鑑定書の表紙カード（ハイブリッド構成）。
 *  ・外枠＝ゴールドの装飾フレーム画像（CSS border-image の9スライス。四隅固定・辺伸縮で高さ可変に対応）
 *  ・テキスト/スターバースト/区切り/キーワード/一言ボックス/印章＝CSS・SVG（文字量に追従）
 *  props（date / title / theme / keywords / message）で動的データを受け取る。 */
export function ReadingCoverCard({ date, title, theme, keywords = [], message }: ReadingCoverCardProps) {
  return (
    <div
      className="relative mt-2 w-full overflow-hidden rounded-lg"
      style={{
        background: "radial-gradient(ellipse at 50% 8%, #15244E 0%, #0A1230 52%, #060B1F 100%)",
      }}
    >
      {/* C案：辺をつなぐゴールド線（コーナーの2本目の線に太さ・位置を合わせる。2px・中心≈9px） */}
      <span className="pointer-events-none absolute inset-[8px] rounded-md border-2 border-gold/40" />

      {/* 四隅に corner-ornament.png を反転・回転で配置（細い辺線の上に重なる） */}
      <img src="/asteria/assets/corner-ornament.png" alt="" aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-28 w-28 brightness-110 saturate-[.92]" />
      <img src="/asteria/assets/corner-ornament.png" alt="" aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-28 w-28 -scale-x-100 brightness-110 saturate-[.92]" />
      <img src="/asteria/assets/corner-ornament.png" alt="" aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 -scale-y-100 brightness-110 saturate-[.92]" />
      <img src="/asteria/assets/corner-ornament.png" alt="" aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 -scale-100 brightness-110 saturate-[.92]" />

      {/* 星屑（装飾） */}
      {SCATTER.map((cls, i) => (
        <span key={i} className={`pointer-events-none absolute select-none ${cls}`}>
          {i % 3 === 0 ? "✧" : "✦"}
        </span>
      ))}

      <div className="relative z-10 flex flex-col items-center px-6 pb-32 pt-8 text-center">
        {/* ヘッダー */}
        <div className="flex items-center justify-center gap-2.5 text-gold/90">
          <span className="text-[10px]">✦</span>
          <span className="font-serif text-[13px] tracking-[0.34em]">ASTERIA READING</span>
          <span className="text-[10px]">✦</span>
        </div>

        {/* スターバースト */}
        <Starburst className="mx-auto mt-3" />

        {/* 日付 */}
        {date && <p className="mb-1 mt-2 font-serif text-[14px] text-[#E8E8F0]/85">{date}</p>}

        {/* タイトル */}
        <h1 className="font-serif text-3xl font-normal leading-tight text-gold"
          style={{ textShadow: "0 0 30px rgba(201,165,84,.5), 0 0 12px rgba(201,165,84,.35)" }}>
          {title}
        </h1>

        {/* 装飾ディバイダ */}
        <OrnateDivider className="my-5" />

        {/* テーマ */}
        {theme && (
          <>
            <div className="mb-2.5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-[12px] tracking-[0.25em] text-gold/75">あなたのテーマ</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="mb-5 flex items-center justify-center gap-2.5 font-serif text-[clamp(22px,6.5vw,28px)] leading-snug text-gold"
              style={{ textShadow: "0 0 24px rgba(201,165,84,.5)" }}>
              <span className="text-[16px] text-gold/70">✦</span>
              <span>{theme}</span>
              <span className="text-[16px] text-gold/70">✦</span>
            </p>
          </>
        )}

        {/* キーワード */}
        {keywords.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
            {keywords.map((kw, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="text-[10px] text-gold/60">✦</span>}
                <span className="rounded-full border border-gold/40 bg-gold/[0.06] px-5 py-1.5 text-[13px] text-gold">
                  {kw}
                </span>
              </Fragment>
            ))}
          </div>
        )}

        {/* 星からの一言（CSS の本文欄。文字量に追従し空きが出ない） */}
        {message && (
          <div className="relative mt-1 w-full max-w-[320px] rounded-xl border border-gold/40 px-6 py-6"
            style={{ background: "rgba(8,12,34,0.45)" }}>
            {/* 内側の薄いゴールドボーダー */}
            <span className="pointer-events-none absolute inset-1.5 rounded-lg border border-gold/15" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-center gap-2 text-gold/85">
                <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold/45" />
                <span className="text-[11px]">✦</span>
                <span className="text-[12px] tracking-wider">星からの一言</span>
                <span className="text-[11px]">✦</span>
                <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold/45" />
              </div>
              <p className="whitespace-pre-line font-serif text-[13px] leading-7 text-white/90">
                {message}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 下部のエンブレム（バナー底の線を下辺の細線に乗せる。bottom 値で上下微調整） */}
      <img src="/asteria/assets/cover-seal.png" alt="" aria-hidden
        className="pointer-events-none absolute bottom-[-20px] left-1/2 w-40 -translate-x-1/2 brightness-110 saturate-[.92]" />
    </div>
  )
}

function Starburst({ className = "" }: { className?: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={className} fill="none">
      <defs>
        <filter id="coverBurstGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke="#C9A554" strokeWidth="1" filter="url(#coverBurstGlow)">
        {rays.map((deg, i) => {
          const a = (deg * Math.PI) / 180
          const r2 = i % 2 === 0 ? 24 : 13
          return (
            <line key={i}
              x1={28 + 5 * Math.cos(a)} y1={28 + 5 * Math.sin(a)}
              x2={28 + r2 * Math.cos(a)} y2={28 + r2 * Math.sin(a)} />
          )
        })}
      </g>
      <circle cx="28" cy="28" r="3.2" fill="#C9A554" filter="url(#coverBurstGlow)" />
    </svg>
  )
}

function OrnateDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <svg viewBox="0 0 320 24" className="w-full max-w-[300px]" fill="none">
        <defs>
          <filter id="coverDivGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line x1="0" y1="12" x2="120" y2="12" stroke="#C9A554" strokeWidth="0.5" strokeOpacity="0.5" />
        <polygon points="120,12 124,8 128,12 124,16" fill="#C9A554" fillOpacity="0.6" />
        <path d="M132,12 C139,12 142,6 148,8 C153,10 151,16 146,15 C142,14 142,10 145,11"
          fill="none" stroke="#C9A554" strokeWidth="0.8" strokeOpacity="0.7" strokeLinecap="round" />
        <text x="160" y="18" textAnchor="middle" fontSize="15" fill="#C9A554" filter="url(#coverDivGlow)">✦</text>
        <path d="M188,12 C181,12 178,6 172,8 C167,10 169,16 174,15 C178,14 178,10 175,11"
          fill="none" stroke="#C9A554" strokeWidth="0.8" strokeOpacity="0.7" strokeLinecap="round" />
        <polygon points="192,12 196,8 200,12 196,16" fill="#C9A554" fillOpacity="0.6" />
        <line x1="200" y1="12" x2="320" y2="12" stroke="#C9A554" strokeWidth="0.5" strokeOpacity="0.5" />
      </svg>
    </div>
  )
}

