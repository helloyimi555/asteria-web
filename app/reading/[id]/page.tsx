"use client"
import { useParams, useRouter } from "next/navigation"
import { useReading } from "@/hooks/useReading"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { isLoggedIn, profileApi, type DegreeMeaning } from "@/lib/api"
import clsx from "clsx"
import { useState, useEffect } from "react"
import NatalChart from "@/components/ui/NatalChart"
import { XShareButton } from "@/components/ui/XShareButton"
import { ChapterHeading } from "@/components/ui/ChapterHeading"
import { SectionDivider } from "@/components/ui/SectionDivider"
import { ReadingCoverCard } from "@/components/ui/ReadingCoverCard"
import { formatReadingDateTime, formatReadingPeriodText, formatReadingDateWithYear, formatReadingTitle, inferPeriodId, themeLabel as resolveThemeLabel } from "@/utils/dateUtils"

// 鑑定書の章立て定義（存在するセクションだけ順に Chapter 番号を振る）
const CHAPTER_DEFS = [
  { key: "overall", title: "総合メッセージ",       subtitle: "星からの大切なメッセージ", color: "#C9A554" },
  { key: "love",    title: "恋愛・人間関係",       subtitle: "心のつながりを星が照らす", color: "#F07098" },
  { key: "work",    title: "仕事・行動指針",       subtitle: "あなたの可能性を広げる",   color: "#70B4FF" },
  { key: "health",  title: "健康・コンディション", subtitle: "心身のバランスを整える",   color: "#70DDA8" },
  { key: "caution", title: "注意点",               subtitle: "気をつけたいポイント",     color: "#FFC96E" },
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

/** 文章の先頭から count 文（。！？区切り）を取り出す。カバーカードのテーマ・一言用。
 *  実行時に文字列以外（オブジェクト等）が渡ってもクラッシュしないよう型ガードする。 */
function firstSentences(raw: unknown, count: number): string {
  if (typeof raw !== "string" || !raw) return ""
  const clean = raw.replace(/【.*?】/g, "").trim()
  const parts = clean.match(/[^。！？]+[。！？]?/g) ?? [clean]
  return parts.slice(0, count).join("").trim()
}

/** 総合メッセージのティザー用に、target 文字数の前後で
 *  区切りの良い位置（。！？改行 → 読点）で切り詰めて末尾に「…」を付ける */
function smartTruncate(raw: string, target = 120): string {
  const clean = raw.replace(/【.*?】/g, "").trim()
  if (clean.length <= target) return clean

  // target 付近（target-50 〜 target+40）を探索範囲にする
  const lower  = target - 50
  const window = clean.slice(0, target + 40)

  // 句点系（。！？改行）で target に最も近い区切りを探す
  let cut = -1
  for (const ch of ["。", "！", "？", "\n"]) {
    const idx = window.lastIndexOf(ch)
    if (idx > lower && idx > cut) cut = idx
  }
  // 句点が無ければ読点で代替
  if (cut < 0) {
    const idx = window.lastIndexOf("、")
    if (idx > lower) cut = idx
  }
  // どの区切りも無ければ target で機械的に切る
  if (cut < 0) return clean.slice(0, target).trim() + "…"

  return clean.slice(0, cut).trim() + "…"
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
  const [overallExpanded, setOverallExpanded] = useState(false)
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

  // 表示対象の章（ゲストは総合のみ）。ラッキーアクションの章番号算出にも使う
  const presentChapters = CHAPTER_DEFS.filter(d =>
    (d.key === "overall" || !isGuest) && !!getContent((outputs as any)?.[d.key])
  )
  const luckyChapterNo = presentChapters.length + 1

  // カバーカード用データ（既存 outputs から導出。実行時データの型崩れでも落ちないよう全て文字列/配列に正規化）
  const asStr = (v: unknown): string => (typeof v === "string" ? v : "")
  const overallContent = getContent((outputs as any)?.overall)
  const coverDate    = asStr(formatReadingDateWithYear(reading.created_at))
  const coverTitle   = asStr(formatReadingTitle(reading.theme, inferPeriodId(reading.period_start, reading.period_end), reading.created_at))
  // テーマ：headline → 「{テーマ名}の{タグ}」（例：人間関係の好調）→ テーマラベル
  // ※ outputs.summary / overall の本文は使わない（長文化を防ぐ）
  const rawTag   = asStr(getTag((outputs as any)?.overall))
  const tagLabel = rawTag.includes(" ") ? rawTag.split(" ").slice(1).join(" ").trim() : rawTag  // 絵文字prefixを除去
  const coverTheme =
       asStr(outputs?.headline)
    || (tagLabel ? `${asStr(themeLabel)}の${tagLabel}` : "")
    || asStr(themeLabel)
  const coverKeywords = Array.isArray(outputs?.keywords)
    ? outputs!.keywords!.filter((k): k is string => typeof k === "string").slice(0, 5)
    : []
  // 星からの一言：句点で区切って最初の1文のみ（カバーを縦に収める）
  const coverMessage  = firstSentences(overallContent, 1)

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />

      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        {/* ブランド（ナビゲーションは下部 BottomNav が担当） */}
        <div className="flex justify-center items-center pt-5 pb-0">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">✦ ASTERIA ✦</span>
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

        {/* 鑑定書カバーカード（メタ情報の直下・Chapter 01 の前） */}
        <ReadingCoverCard
          date={coverDate}
          title={coverTitle}
          theme={coverTheme}
          keywords={coverKeywords}
          message={coverMessage}
        />

        {/* Headline */}
        {outputs?.headline && (
          <p className="font-serif text-[13px] italic text-gold leading-7 mt-3">
            {outputs.headline}
          </p>
        )}

        {/* 章立て（総合メッセージ・恋愛・仕事・健康・注意点） */}
        {presentChapters.map((def, i) => {
          const section = (outputs as any)?.[def.key]
          const content = getContent(section)
          const tag     = getTag(section)
          const summary = getSummary(section)
          // 注意点は注意カード（ダークレッド）配色にする
          const isAlert = def.key === "caution"
          const cardStyle = isAlert
            ? { borderLeft: `3px solid ${def.color}`, background: "linear-gradient(135deg,rgba(48,20,26,.85),rgba(24,16,28,.9))", border: "1px solid rgba(240,150,120,.22)" }
            : { borderLeft: `3px solid ${def.color}` }
          return (
            <div key={def.key}>
              {i > 0 && <SectionDivider />}
              <ChapterHeading number={i + 1} title={def.title} subtitle={def.subtitle} color={def.color} />
              <div className={isAlert ? "rounded-2xl p-4" : "card p-4"} style={cardStyle}>
                {(tag || summary) && (
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    {tag && <TagPill tag={tag} />}
                    {summary && <span className="text-[12px] text-white/55 leading-tight">{summary}</span>}
                  </div>
                )}
                {def.key === "overall" ? (
                  isGuest ? (
                    <OverallText text={content} isGuest={isGuest} />
                  ) : overallExpanded ? (
                    <>
                      <OverallText text={content} isGuest={false} />
                      <button type="button" onClick={() => setOverallExpanded(false)}
                        className="mt-3 text-[12px] text-gold/80 hover:text-gold transition-colors">
                        閉じる ∧
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
                        {smartTruncate(content, 120)}
                      </p>
                      <button type="button" onClick={() => setOverallExpanded(true)}
                        className="mt-3 text-[12px] text-gold/80 hover:text-gold transition-colors">
                        続きを読む ∨
                      </button>
                    </>
                  )
                ) : (
                  <p className="font-sans text-[13px] leading-[1.9] text-[#C0C0D8] font-light whitespace-pre-line">{content}</p>
                )}
              </div>
            </div>
          )
        })}

        {/* 06 ラッキーアクション（ネイタルチャートの前） */}
        {!isGuest && outputs?.lucky_action && (
          <>
            <ChapterHeading number={luckyChapterNo} title="ラッキーアクション"
              subtitle="運気を引き寄せるヒント" color="#C9A554" />
            <div className="p-4 rounded-2xl"
              style={{ background:"linear-gradient(135deg,rgba(20,44,32,.9),rgba(14,30,22,.9))", border:"1px solid rgba(112,221,168,.28)" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span style={{ color:"#8BC34A" }}>✸</span>
                <span className="text-[11px] tracking-wider" style={{ color:"#A8E08F" }}>今日のラッキーアクション</span>
              </div>
              <div className="font-serif text-[15px] italic leading-relaxed" style={{ color:"#D8E8D0" }}>
                {outputs.lucky_action}
              </div>
            </div>
          </>
        )}

        {/* 鑑定本文 → ネイタルチャートの区切り */}
        {!isGuest && <SectionDivider label="ネイタルチャート" />}

        {/* 根拠 toggle（ネイタルチャートの直上）*/}
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

        {/* 07 アドバイス - ゲストには非表示 */}
        {!isGuest && outputs?.advice && (
          <>
            <ChapterHeading number={7} title="アドバイス"
              subtitle="今日を生きるための羅針盤" color="#C9A554" />
            <div className="card p-4" style={{ borderLeft: "3px solid #C9A554" }}>
              <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">
                {outputs.advice}
              </p>
            </div>
          </>
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
              <SectionDivider />
              <div className="flex flex-col gap-3 mt-1">
                <XShareButton text={shareText} variant="gold" />
                <button onClick={() => router.push("/reading")}
                  className="btn-gold-outline w-full py-3.5 flex items-center justify-center gap-2 text-[15px]">
                  <span>←</span><span>別の鑑定を行う</span>
                </button>
              </div>
            </>
          )
        })()}
      </div>

      <BottomNav />
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