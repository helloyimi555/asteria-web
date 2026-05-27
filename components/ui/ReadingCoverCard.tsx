"use client"
import { Fragment } from "react"

interface ReadingCoverCardProps {
  date: string
  title: string
  theme: string
  keywords?: string[]
  message?: string
}

/** 鑑定書のカバーカード。鑑定結果ページ冒頭に表示する、ゴールド装飾の表紙風カード。
 *  ASTERIA デザインシステム「鑑定結果サマリーカード」をフルカバーに拡張したもの。 */
export function ReadingCoverCard({ date, title, theme, keywords = [], message }: ReadingCoverCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl mt-3"
      style={{
        background: "radial-gradient(circle at 50% 16%, #15244E 0%, #0A1230 48%, #060B1F 100%)",
        border: "1px solid rgba(201,165,84,.55)",
        boxShadow: "0 0 50px rgba(201,165,84,.12)",
      }}>
      {/* 内側の二重ボーダー */}
      <div className="pointer-events-none absolute inset-2.5 rounded-[20px]"
        style={{ border: "1px solid rgba(201,165,84,.28)" }} />

      <div className="relative px-6 py-8 text-center">
        {/* ヘッダー */}
        <div className="flex items-center justify-center gap-2.5 text-gold/90">
          <span className="text-[10px]">✦</span>
          <span className="font-serif text-[13px] tracking-[0.34em]">ASTERIA READING</span>
          <span className="text-[10px]">✦</span>
        </div>

        {/* スターバースト */}
        <Starburst className="mx-auto mt-3 mb-4" />

        {/* 日付 */}
        {date && <p className="text-[14px] text-[#E8E8F0]/85 mb-1.5">{date}</p>}

        {/* タイトル */}
        <h1 className="font-serif text-[clamp(28px,8vw,36px)] leading-tight text-gold"
          style={{ textShadow: "0 0 28px rgba(201,165,84,.45)" }}>
          {title}
        </h1>

        {/* 装飾ディバイダ */}
        <div className="flex items-center justify-center gap-2 my-5">
          <span className="h-px w-20 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-gold/50 text-[8px]">✦</span>
          <span className="text-gold text-[14px]">✦</span>
          <span className="text-gold/50 text-[8px]">✦</span>
          <span className="h-px w-20 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* テーマラベル */}
        {theme && (
          <>
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="h-px w-9 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-[12px] tracking-[0.2em] text-gold/70">あなたのテーマ</span>
              <span className="h-px w-9 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="font-serif text-[clamp(22px,6.5vw,28px)] text-gold mb-5"
              style={{ textShadow: "0 0 24px rgba(201,165,84,.5)" }}>
              {theme}
            </p>
          </>
        )}

        {/* キーワード */}
        {keywords.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 flex-wrap mb-6">
            {keywords.map((kw, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="text-gold/60 text-[10px]">✦</span>}
                <span className="px-5 py-2 rounded-full text-[14px] text-gold"
                  style={{ border: "1px solid rgba(201,165,84,.4)", background: "rgba(201,165,84,.06)" }}>
                  {kw}
                </span>
              </Fragment>
            ))}
          </div>
        )}

        {/* 星からの一言 */}
        {message && (
          <div className="relative mt-2 px-5 py-6 rounded-xl"
            style={{ border: "1px solid rgba(201,165,84,.3)", background: "rgba(255,255,255,.025)" }}>
            <div className="flex items-center justify-center gap-2 mb-3 text-gold/85">
              <span className="h-px w-7 bg-gradient-to-r from-transparent to-gold/40" />
              <span className="text-[11px]">✦</span>
              <span className="text-[12px] tracking-wider">星からの一言</span>
              <span className="text-[11px]">✦</span>
              <span className="h-px w-7 bg-gradient-to-l from-transparent to-gold/40" />
            </div>
            <p className="font-serif text-[14px] leading-8 text-[#E8E8F0]/85 whitespace-pre-line">
              {message}
            </p>
          </div>
        )}

        {/* 下部シール */}
        <Seal className="mx-auto mt-6" />
      </div>
    </div>
  )
}

function Starburst({ className = "" }: { className?: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={className} fill="none">
      <g stroke="#C9A554" strokeWidth="1">
        {rays.map((deg, i) => {
          const a = (deg * Math.PI) / 180
          const r1 = 5
          const r2 = i % 2 === 0 ? 24 : 13
          return (
            <line key={i}
              x1={28 + r1 * Math.cos(a)} y1={28 + r1 * Math.sin(a)}
              x2={28 + r2 * Math.cos(a)} y2={28 + r2 * Math.sin(a)} />
          )
        })}
      </g>
      <circle cx="28" cy="28" r="3.2" fill="#C9A554" />
    </svg>
  )
}

function Seal({ className = "" }: { className?: string }) {
  const rays = [0, 30, 60, 90, 120, 150]
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" className={className} fill="none">
      <circle cx="25" cy="25" r="21" stroke="#C9A554" strokeWidth="1.5" fill="rgba(201,165,84,.07)" />
      <circle cx="25" cy="25" r="15.5" stroke="#C9A554" strokeWidth="0.7" opacity="0.55" />
      <g stroke="#C9A554" strokeWidth="0.9">
        {rays.map((deg, i) => {
          const a = (deg * Math.PI) / 180
          return (
            <line key={i}
              x1={25 - 13 * Math.cos(a)} y1={25 - 13 * Math.sin(a)}
              x2={25 + 13 * Math.cos(a)} y2={25 + 13 * Math.sin(a)} />
          )
        })}
      </g>
      <circle cx="25" cy="25" r="2.4" fill="#C9A554" />
    </svg>
  )
}
