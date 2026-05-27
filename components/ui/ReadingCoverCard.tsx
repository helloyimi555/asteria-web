"use client"
import { Fragment } from "react"

interface ReadingCoverCardProps {
  date: string
  title: string
  theme: string
  keywords?: string[]
  message?: string
}

// 散りばめる星屑（絶対配置・Tailwind の固定クラスで JIT に拾わせる）
const SCATTER = [
  "left-[9%] top-[13%] text-gold/45 text-[11px]",
  "left-[86%] top-[9%] text-gold/30 text-[8px]",
  "left-[18%] top-[34%] text-gold/25 text-[9px]",
  "left-[78%] top-[40%] text-gold/35 text-[10px]",
  "left-[6%] top-[52%] text-gold/30 text-[8px]",
  "left-[91%] top-[58%] text-gold/25 text-[9px]",
  "left-[14%] top-[72%] text-gold/35 text-[10px]",
  "left-[84%] top-[78%] text-gold/40 text-[11px]",
  "left-[50%] top-[6%] text-gold/30 text-[8px]",
  "left-[33%] top-[88%] text-gold/25 text-[9px]",
]

/** 高級な星読み鑑定書の表紙カード。鑑定結果ページ冒頭に表示する。
 *  ASTERIA デザインシステムの鑑定結果サマリーを、縦長の表紙風に拡張したもの。
 *  props（date / title / theme / keywords / message）で動的データを受け取る。 */
export function ReadingCoverCard({ date, title, theme, keywords = [], message }: ReadingCoverCardProps) {
  return (
    <div
      className="relative mx-auto mt-3 w-full max-w-[390px] overflow-hidden rounded-[28px]"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0C1530 0%, #070B1D 55%, #04060F 100%)" }}
    >
      {/* 二重ゴールドボーダー */}
      <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-gold/45" />
      <div className="pointer-events-none absolute inset-5 rounded-[18px] border border-gold/20" />

      {/* 右上の薄いホロスコープ円（同心円3重） */}
      <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 opacity-[0.12]">
        <div className="absolute inset-0 rounded-full border border-gold/70" />
        <div className="absolute inset-7 rounded-full border border-gold/50" />
        <div className="absolute inset-14 rounded-full border border-gold/40" />
      </div>

      {/* 星屑 */}
      {SCATTER.map((cls, i) => (
        <span key={i} className={`pointer-events-none absolute select-none ${cls}`}>
          {i % 3 === 0 ? "✧" : "✦"}
        </span>
      ))}

      {/* 四隅のゴールド角飾り（L字） */}
      <span className="pointer-events-none absolute left-[18px] top-[18px] h-5 w-5 rounded-tl border-l-2 border-t-2 border-gold/70" />
      <span className="pointer-events-none absolute right-[18px] top-[18px] h-5 w-5 rounded-tr border-r-2 border-t-2 border-gold/70" />
      <span className="pointer-events-none absolute bottom-[18px] left-[18px] h-5 w-5 rounded-bl border-b-2 border-l-2 border-gold/70" />
      <span className="pointer-events-none absolute bottom-[18px] right-[18px] h-5 w-5 rounded-br border-b-2 border-r-2 border-gold/70" />

      {/* コンテンツ */}
      <div className="relative z-10 px-8 py-10 text-center">
        {/* ヘッダー */}
        <div className="flex items-center justify-center gap-2.5 text-gold/90">
          <span className="text-[10px]">✦</span>
          <span className="font-serif text-[13px] tracking-[0.34em]">ASTERIA READING</span>
          <span className="text-[10px]">✦</span>
        </div>

        {/* スターバースト */}
        <div className="my-4 text-[26px] leading-none text-gold"
          style={{ textShadow: "0 0 22px rgba(201,165,84,.65), 0 0 8px rgba(201,165,84,.5)" }}>
          ✦
        </div>

        {/* 日付 */}
        {date && <p className="mb-1.5 text-[14px] text-[#E8E8F0]/85">{date}</p>}

        {/* タイトル（主役） */}
        <h1 className="font-serif text-[clamp(34px,10vw,44px)] font-normal leading-[1.2] text-gold"
          style={{ textShadow: "0 0 32px rgba(201,165,84,.5), 0 0 12px rgba(201,165,84,.35)" }}>
          {title}
        </h1>

        {/* 装飾ディバイダ */}
        <div className="my-6 flex items-center justify-center gap-2.5">
          <span className="h-px w-20 bg-gradient-to-r from-transparent via-gold/40 to-gold/55" />
          <span className="text-[7px] text-gold/50">◆</span>
          <span className="text-base text-gold" style={{ textShadow: "0 0 12px rgba(201,165,84,.6)" }}>✦</span>
          <span className="text-[7px] text-gold/50">◆</span>
          <span className="h-px w-20 bg-gradient-to-l from-transparent via-gold/40 to-gold/55" />
        </div>

        {/* テーマ */}
        {theme && (
          <>
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-[12px] tracking-[0.25em] text-gold/75">あなたのテーマ</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="mb-7 flex items-center justify-center gap-2.5 font-serif text-[clamp(24px,7vw,30px)] leading-snug text-gold"
              style={{ textShadow: "0 0 24px rgba(201,165,84,.5)" }}>
              <span className="text-[16px] text-gold/70">✦</span>
              <span>{theme}</span>
              <span className="text-[16px] text-gold/70">✦</span>
            </p>
          </>
        )}

        {/* キーワード */}
        {keywords.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5">
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

        {/* 星からの一言（鑑定書の本文欄風） */}
        {message && (
          <div className="relative mt-2 rounded-2xl border border-gold/35 bg-white/[0.02] px-6 py-7">
            {/* 内側の薄いゴールドボーダー */}
            <span className="pointer-events-none absolute inset-2.5 rounded-xl border border-gold/15" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-center gap-2 text-gold/85">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/45" />
                <span className="text-[11px]">✦</span>
                <span className="text-[12px] tracking-wider">星からの一言</span>
                <span className="text-[11px]">✦</span>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/45" />
              </div>
              <p className="whitespace-pre-line font-serif text-[14px] leading-8 text-[#E8E8F0]/85">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* 下部の印章風ゴールドバッジ */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-gold/[0.08] text-[22px] text-gold"
            style={{ boxShadow: "0 0 22px rgba(201,165,84,.28)" }}>
            <span className="pointer-events-none absolute inset-1.5 rounded-full border border-gold/30" />
            <span className="relative">✺</span>
          </div>
        </div>
      </div>
    </div>
  )
}
