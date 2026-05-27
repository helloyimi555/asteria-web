"use client"
import { Fragment } from "react"

interface ReadingCoverCardProps {
  date: string
  title: string
  theme: string
  keywords?: string[]
  message?: string
}

/** 高級な星読み鑑定書の表紙カード。鑑定結果ページ冒頭に表示する。
 *  背景・装飾は画像アセット（reading-cover-bg.png）に含まれるため、ここではテキストのみ配置する。
 *  props（date / title / theme / keywords / message）で動的データを受け取る。 */
export function ReadingCoverCard({ date, title, theme, keywords = [], message }: ReadingCoverCardProps) {
  return (
    <div
      className="relative mx-auto mt-3 w-full max-w-[390px] overflow-hidden rounded-[28px]"
      style={{
        backgroundImage: "url('/assets/reading-cover-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 px-8 py-10 text-center">
        {/* ヘッダー */}
        <div className="flex items-center justify-center gap-2.5 text-gold/90">
          <span className="text-[10px]">✦</span>
          <span className="font-serif text-[13px] tracking-[0.34em]">ASTERIA READING</span>
          <span className="text-[10px]">✦</span>
        </div>

        {/* 日付 */}
        {date && <p className="mb-1.5 mt-6 text-[14px] text-[#E8E8F0]/85">{date}</p>}

        {/* タイトル（主役） */}
        <h1 className="font-serif text-[clamp(34px,10vw,44px)] font-normal leading-[1.2] text-gold"
          style={{ textShadow: "0 0 32px rgba(201,165,84,.5), 0 0 12px rgba(201,165,84,.35)" }}>
          {title}
        </h1>

        {/* テーマ */}
        {theme && (
          <>
            <div className="mb-3 mt-8 flex items-center justify-center gap-3">
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

        {/* 星からの一言（背景画像の本文欄） */}
        {message && (
          <div
            className="relative mt-2 rounded-2xl px-8 py-10 text-center"
            style={{
              backgroundImage: "url('/assets/reading-message-box.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mb-4 flex items-center justify-center gap-2 text-gold/85">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/45" />
              <span className="text-[11px]">✦</span>
              <span className="text-[12px] tracking-wider">星からの一言</span>
              <span className="text-[11px]">✦</span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/45" />
            </div>
            <p className="whitespace-pre-line font-serif text-[14px] leading-8 text-[#E8E8F0]/90">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
