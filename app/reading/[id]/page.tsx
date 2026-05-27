"use client"
import { useParams, useRouter } from "next/navigation"
import { useReading } from "@/hooks/useReading"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { TopNav } from "@/components/layout/TopNav"
import { isLoggedIn, profileApi, type DegreeMeaning } from "@/lib/api"
import clsx from "clsx"
import { useState, useEffect } from "react"
import NatalChart from "@/components/ui/NatalChart"
import { XShareButton } from "@/components/ui/XShareButton"
import { formatReadingDateTime, formatReadingPeriodText, themeLabel as resolveThemeLabel } from "@/utils/dateUtils"

const THEME_CARDS = [
  { key:"work",    label:"仕事運",  icon:"💼", c:"#70B4FF", bg:"rgba(112,180,255,.15)" },
  { key:"love",    label:"恋愛運",  icon:"♡",  c:"#F07098", bg:"rgba(240,112,152,.15)" },
  { key:"health",  label:"健康運",  icon:"◎",  c:"#70DDA8", bg:"rgba(112,221,168,.15)" },
  { key:"caution", label:"注意点",  icon:"△",  c:"#FFC96E", bg:"rgba(255,201,110,.15)" },
]

// セクションのタグ色（バックエンドが返す4種）
const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  "🌟 絶好調": { bg: "#1a2e00", color: "#8bc34a" },
  "✨ 好調":   { bg: "#002233", color: "#4fc3f7" },
  "⚠️ 注意":  { bg: "#3d2200", color: "#f5a623" },
  "😶 低調":  { bg: "#2a1a1a", color: "#ef9f9f" },
}

// 旧データ(string) と新データ({tag,summary,content}) の両対応ヘルパー
function getContent(section: any): string {
  if (!section) return ""
  if (typeof section === "string") return section
  return section.content ?? ""
}
function getTag(section: any): string | undefined {
  if (!section || typeof section === "string") return undefined
  return section.tag
}
function getSummary(section: any): string | undefined {
  if (!section || typeof section === "string") return undefined
  return section.summary
}

function TagPill({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] ?? { bg: "rgba(255,255,255,.06)", color: "#C9A554" }
  return (
    <span style={{
      background:   style.bg,
      color:        style.color,
      borderRadius: 20,
      padding:      "3px 10px",
      fontSize:     12,
      whiteSpace:   "nowrap",
      lineHeight:   1.2,
    }}>
      {tag}
    </span>
  )
}

export default function ReadingResultPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const { data: reading, isLoading } = useReading(id)
  const [open,  setOpen] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [meanings, setMeanings] = useState<Record<string, DegreeMeaning>>({})

  useEffect(() => {
    setIsGuest(!isLoggedIn())
  }, [])

  useEffect(() => {
    const profileId = reading?.birth_profile_id
    if (!profileId || isGuest) return
    let cancelled = false
    profileApi.getNatalMeaning(profileId)
      .then(res => {
        if (cancelled) return
        const map: Record<string, DegreeMeaning> = {}
        for (const m of res.meanings ?? []) {
          if (m?.planet) map[m.planet] = m
        }
        setMeanings(map)
      })
      .catch(() => { /* graceful: 意味文なしで天体だけ表示 */ })
    return () => { cancelled = true }
  }, [reading?.reading_id, reading?.birth_profile_id, isGuest])

  if (isLoading || reading?.status === "pending" || reading?.status === "processing") {
    return <LoadingView />
  }
  if (!reading || reading.status === "failed") {
    return <ErrorView onBack={() => router.push("/reading")} />
  }

  const { outputs } = reading
  const themeLabel = resolveThemeLabel(reading.theme)

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />
      <div className="hidden md:block"><TopNav /></div>

      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        {/* Nav (モバイル: ブランドのみ。ナビゲーションは BottomNav が担当) */}
        <div className="flex justify-center items-center pt-4 pb-0 md:hidden">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">ASTERIA</span>
        </div>

        {/* 鑑定メタ情報（テーマ・対象期間・実行日時） */}
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background:"rgba(201,165,84,.1)", border:"1px solid rgba(201,165,84,.3)", color:"#C9A554" }}>
              ✦ {themeLabel}
            </span>
            {reading.period_start && (
              <span className="text-[11px] text-white/55">
                {formatReadingPeriodText("", reading.period_start, reading.period_end)}
              </span>
            )}
          </div>
          {reading.created_at && (
            <div className="text-[10px] text-white/35 mt-1.5 tracking-wider">
              鑑定日時：{formatReadingDateTime(reading.created_at)}
            </div>
          )}
        </div>

        {/* Headline */}
        {outputs?.headline && (
          <p className="font-serif text-[13px] italic text-gold leading-7 mt-3">
            {outputs.headline}
          </p>
        )}

        {/* メインテーマ */}
        {outputs?.overall && (() => {
          const overallTag     = getTag(outputs.overall)
          const overallSummary = getSummary(outputs.overall)
          const overallContent = getContent(outputs.overall)
          return (
            <div className="card mt-3 p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-gold text-sm">✦</span>
                <span className="font-sans text-[13px] font-bold text-[#F0F0F8]">{themeLabel}</span>
                {overallTag && <TagPill tag={overallTag} />}
                {overallSummary && (
                  <span className="text-[13px] text-white/55 leading-tight">{overallSummary}</span>
                )}
              </div>
              <OverallText text={overallContent} isGuest={isGuest} />
            </div>
          )
        })()}

        {/* 根拠 toggle */}
        {!isGuest && (
          <div className="mt-2.5">
            <button onClick={() => setOpen(o => !o)}
              className="w-full card flex items-center justify-center gap-2 py-3 cursor-pointer"
              style={{ borderRadius: open ? "12px 12px 0 0" : 12 }}>
              <span className="text-[12px] text-white/50">この鑑定の根拠を見る</span>
              <span className={clsx("text-gold text-[12px] transition-transform duration-200",
                open && "rotate-180")}>∨</span>
            </button>
            {open && (
              <div className="p-3 border border-white/[0.08] border-t-0"
                style={{ background:"rgba(15,20,50,.8)", borderRadius:"0 0 12px 12px" }}>
                <p className="text-[12px] text-white/40 text-center py-2">
                  天体データは鑑定完了後に表示されます
                </p>
              </div>
            )}
          </div>
        )}

        {/* ネイタルチャート */}
        {!isGuest && reading.natal_positions?.length > 0 && (
          <NatalChart positions={reading.natal_positions} meanings={meanings} />
        )}

        {/* テーマ別 2x2 - ゲストには非表示 */}
        {!isGuest && (
          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            {THEME_CARDS.map(({ key, label, icon, c, bg }) => {
              const section = (outputs as any)?.[key]
              const content = getContent(section)
              if (!content) return null
              const tag     = getTag(section)
              const summary = getSummary(section)
              return (
                <div key={key} className="card p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ background:bg, border:`1px solid ${c}30`, color:c }}>
                      {icon}
                    </div>
                    {tag && <TagPill tag={tag} />}
                  </div>
                  <div className="text-[12px] font-bold mb-1" style={{ color:c }}>{label}</div>
                  {summary && (
                    <div className="text-[11px] text-white/55 leading-relaxed mb-1.5">{summary}</div>
                  )}
                  <p className="font-sans text-[11px] leading-[1.75] text-[#A0A0C0] font-light">{content}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* キーワード - ゲストには非表示 */}
        {!isGuest && (outputs?.keywords as any)?.length > 0 && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">運命のキーワード</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(outputs.keywords as any[]).map((kw: string, i: number) => (
                <span key={i}
                  className="px-3 py-1 rounded-full text-[12px] text-gold"
                  style={{ background:"rgba(201,165,84,.1)", border:"1px solid rgba(201,165,84,.3)" }}>
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ラッキーアクション - ゲストには非表示 */}
        {!isGuest && outputs?.lucky_action && (
          <div className="mt-2.5 p-4 rounded-xl"
            style={{ background:"linear-gradient(135deg,rgba(120,80,10,.85),rgba(80,50,5,.85))", border:"1px solid rgba(201,165,84,.3)" }}>
            <div className="text-[11px] text-gold tracking-wider mb-1.5">✦ ラッキーアクション</div>
            <div className="font-serif text-[15px] italic text-[#F0D880] leading-relaxed">
              {outputs.lucky_action}
            </div>
          </div>
        )}

        {/* アドバイス - ゲストには非表示 */}
        {!isGuest && outputs?.advice && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">アドバイス</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">
              {outputs.advice}
            </p>
          </div>
        )}

        {/* ゲストのペイウォール */}
        {isGuest && (
          <div className="mt-4 p-5 rounded-xl text-center"
            style={{ background:"linear-gradient(135deg,rgba(30,20,60,.95),rgba(20,15,50,.95))", border:"1px solid rgba(201,165,84,.3)" }}>
            <div className="text-gold text-lg mb-2">✦</div>
            <h3 className="font-serif text-[15px] text-[#F0F0F8] mb-2">続きを読む・再鑑定する</h3>
            <p className="text-[12px] text-white/50 mb-4 leading-6">
              会員登録（無料）で<br />全文表示・全テーマ・履歴保存が使えます
            </p>
            <button onClick={() => router.push("/auth/register")}
              className="btn-gold w-full py-3.5 text-[14px] mb-2">
              無料で会員登録する
            </button>
            <button onClick={() => router.push("/auth/login")}
              className="text-[12px] text-white/40 hover:text-white/70">
              すでにアカウントをお持ちの方
            </button>
          </div>
        )}

        {/* Back */}
        {!isGuest && (() => {
          const sunSignJa = reading.natal_positions?.find((p: any) => p.planet === "Sun")?.sign_ja ?? ""
          const sunSign   = sunSignJa.replace(/座$/, "")
          const shareText = sunSign
            ? `✦ ${sunSign}座の運勢を占いました。#ASTERIA #占星術`
            : `✦ 運勢を占いました。#ASTERIA #占星術`
          return (
            <>
              <div className="mt-4">
                <XShareButton text={shareText} />
              </div>
              <button onClick={() => router.push("/reading")}
                className="btn-gold-outline w-full py-3.5 mt-3 flex items-center justify-center gap-2">
                <span>←</span><span>別の鑑定を行う</span>
              </button>
            </>
          )
        })()}
      </div>

      <div className="md:hidden"><BottomNav /></div>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <Stars />
      <div className="relative z-10 text-center">
        <div className="font-serif text-[13px] tracking-widest text-gold mb-4">✦ ASTERIA</div>
        <div className="w-20 h-20 rounded-full border-2 border-gold/30 border-t-gold
                        animate-spin mx-auto mb-6" />
        <p className="text-[15px] text-[#F0F0F8] mb-2">あなたの未来の流れを読み解いています..</p>
        <p className="text-[12px] text-white/45">天体の配置を計算し、AIがストーリーを紡ぎます</p>
      </div>
    </div>
  )
}

function OverallText({ text, isGuest }: { text: string; isGuest: boolean }) {
  const parts = text.split(/(?=【)/)

  // ゲストは最初の段落のみ表示してフェードアウト
  const displayParts = isGuest ? parts.slice(0, 1) : parts

  if (displayParts.length <= 1 && !isGuest) {
    return (
      <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">{text}</p>
    )
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        {displayParts.map((part, i) => {
          if (!part.trim()) return null
          const match = part.match(/^【(.+?)】(.*)$/s)
          if (match) {
            return (
              <div key={i}>
                <div className="text-[12px] font-bold text-gold/80 mb-1.5">【{match[1]}】</div>
                <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
                  {match[2].trim()}
                </p>
              </div>
            )
          }
          return (
            <p key={i} className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
              {part.trim()}
            </p>
          )
        })}
      </div>
      {isGuest && (
        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background:"linear-gradient(to bottom, transparent, rgba(10,12,30,0.95))" }} />
      )}
    </div>
  )
}

function ErrorView({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <Stars />
      <div className="relative z-10 text-center">
        <p className="text-[16px] text-[#F0F0F8] mb-2">エラーが発生しました</p>
        <p className="text-[12px] text-white/45 mb-6">しばらくしてからもう一度お試しください</p>
        <button onClick={onBack} className="btn-gold px-8 py-3 text-[14px]">
          戻る
        </button>
      </div>
    </div>
  )
}