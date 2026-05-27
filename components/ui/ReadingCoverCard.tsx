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
 *  全幅の背景画像（cover-bg-wide.png）の上にテキストを重ね、
 *  「星からの一言」は上下キャップ＋中央伸縮の3分割画像で組む。
 *  props（date / title / theme / keywords / message）で動的データを受け取る。 */
export function ReadingCoverCard({ date, title, theme, keywords = [], message }: ReadingCoverCardProps) {
  return (
    <div
      className="relative mx-auto mt-3 w-full overflow-hidden rounded-[28px]"
      style={{ maxHeight: "85vh", backgroundColor: "#04060F" }}
    >
      {/* 背景フレーム（全幅・コンテンツ高に合わせて被覆） */}
      <img
        src="/asteria/assets/cover-bg-wide.png"
        alt=""
        className="pointer-events-none absolute inset-0 w-full h-full object-cover"
      />

      {/* コンテンツ（背景上に重ねる。高さはこの要素が決める） */}
      <div className="relative z-10 flex flex-col items-center px-8 pb-8 pt-4 text-center">
        {/* ヘッダー */}
        <div className="flex items-center justify-center gap-2.5 text-gold/90">
          <span className="text-[10px]">✦</span>
          <span className="font-serif text-[13px] tracking-[0.34em]">ASTERIA READING</span>
          <span className="text-[10px]">✦</span>
        </div>

        {/* 日付 */}
        {date && <p className="mb-1 mt-4 font-serif text-[14px] text-[#E8E8F0]/85">{date}</p>}

        {/* タイトル（主役） */}
        <h1 className="font-serif text-3xl font-normal leading-tight text-gold"
          style={{ textShadow: "0 0 32px rgba(201,165,84,.5), 0 0 12px rgba(201,165,84,.35)" }}>
          {title}
        </h1>

        {/* テーマ */}
        {theme && (
          <>
            <div className="mb-2.5 mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-[12px] tracking-[0.25em] text-gold/75">あなたのテーマ</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="mb-4 flex items-center justify-center gap-2.5 font-serif text-[clamp(22px,6.5vw,28px)] leading-snug text-gold"
              style={{ textShadow: "0 0 24px rgba(201,165,84,.5)" }}>
              <span className="text-[16px] text-gold/70">✦</span>
              <span>{theme}</span>
              <span className="text-[16px] text-gold/70">✦</span>
            </p>
          </>
        )}

        {/* キーワード */}
        {keywords.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
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

        {/* 星からの一言（上下キャップ＋中央伸縮の3分割画像） */}
        {message && (
          <div className="relative mt-4 w-full">
            {/* 上部画像 */}
            <img src="/asteria/assets/message-box-top.png" alt="" aria-hidden className="block w-full" />
            {/* 中部（テキスト部分・背景を縦伸縮） */}
            <div
              className="relative -mt-px w-full"
              style={{
                backgroundImage: "url('/asteria/assets/message-box-mid.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <p className="whitespace-pre-line px-8 py-4 text-center font-serif text-sm leading-7 text-white/90">
                {message}
              </p>
            </div>
            {/* 下部画像 */}
            <img src="/asteria/assets/message-box-bottom.png" alt="" aria-hidden className="-mt-px block w-full" />
          </div>
        )}
      </div>
    </div>
  )
}
