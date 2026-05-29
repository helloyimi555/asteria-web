"use client"
import { useEffect, useState, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Stars } from "@/components/ui/Stars"
import NatalChart from "@/components/ui/NatalChart"
import { BottomNav } from "@/components/layout/BottomNav"
import { TONE_COLOR } from "@/lib/zodiac"
import { XShareButton } from "@/components/ui/XShareButton"
import { ChapterHeading } from "@/components/ui/ChapterHeading"
import { AlertCard } from "@/components/ui/cards"
import { OrnamentalDivider } from "@/components/asteria-ui"
import { ScoreRing, RelationshipLabel, MetricBar, SCORE_FIELDS as COMPAT_SCORE_FIELDS } from "@/components/ui/CompatScore"
import {
  calcElementBalance, elementPercents, getDominantElement, getElementCompatibility,
  getElementTitle, ELEMENTS, ELEMENT_INFO,
} from "@/lib/elements"
import clsx from "clsx"

// ゴールドグラデカード（シンクロスコア・合言葉用）
const GOLD_CARD_STYLE: CSSProperties = {
  background: "radial-gradient(circle at top, rgba(201,165,84,0.16), rgba(255,255,255,0.045) 42%, rgba(255,255,255,0.025))",
  border: "1px solid rgba(201,165,84,0.35)",
  boxShadow: "0 0 42px rgba(201,165,84,0.14)",
}

const EVAL: Record<string, { c:string; bg:string; bc:string }> = {
  "◎": { c:"#70DDA8", bg:"rgba(112,221,168,.12)", bc:"rgba(112,221,168,.3)" },
  "○": { c:"#70B4FF", bg:"rgba(112,180,255,.12)", bc:"rgba(112,180,255,.3)" },
  "△": { c:"#FFC96E", bg:"rgba(255,201,110,.12)", bc:"rgba(255,201,110,.3)" },
}

const THEME_CARDS = [
  { key:"love",          label:"恋愛・パートナーシップ", icon:"♡", c:"#F07098" },
  { key:"communication", label:"コミュニケーション",      icon:"◎", c:"#70B4FF" },
  { key:"lifestyle",     label:"価値観・ライフスタイル",  icon:"✿", c:"#70DDA8" },
  { key:"caution",       label:"注意が必要なこと",        icon:"△", c:"#FFC96E" },
]

const IMPORTANCE_LABEL_BY_ASPECT: Record<string, string> = {
  conjunction: "相性度",
  trine: "相性度",
  sextile: "相性度",
  opposition: "影響度",
  square: "影響度",
  quincunx: "影響度",
}

export default function CompatResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<any>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("asteria_compat_result")
      if (saved) {
        setResult(JSON.parse(saved))
      } else {
        router.push("/compat")
      }
    } catch {
      router.push("/compat")
    }
  }, [])

  if (!result) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Stars />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-gold/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-[14px]">読み込み中...</p>
        </div>
      </div>
    )
  }

  const { outputs, my_sign, their_sign, synastry } = result
  const overallScore = outputs?.scores?.overall ?? null
  const overallLabel = overallScore !== null
    ? overallScore >= 85 ? "深く繋がれる関係"
    : overallScore >= 70 ? "理解し合えるほど育つ関係"
    : overallScore >= 50 ? "対話で相性を高める関係"
    : "努力でより良くなる関係"
    : ""
  const scoreComment = outputs?.summary || outputs?.advice || ""

  const adviceText = outputs?.advice?.replace(
    "あなたの強い言葉が時に相手を傷つける可能性があることを意識しましょう",
    "あなたのまっすぐな表現が、時にお相手には強く感じられることがあります。"
  )

  const myNatalPositions    = result.my_natal_positions    ?? []
  const theirNatalPositions = result.their_natal_positions ?? []
  const myBalance    = myNatalPositions.length    ? calcElementBalance(myNatalPositions)    : null
  const theirBalance = theirNatalPositions.length ? calcElementBalance(theirNatalPositions) : null
  const myPct        = myBalance    ? elementPercents(myBalance)    : null
  const theirPct     = theirBalance ? elementPercents(theirBalance) : null
  const myDominant    = myBalance    ? getDominantElement(myBalance)    : null
  const theirDominant = theirBalance ? getDominantElement(theirBalance) : null
  const elementCompat = (myDominant && theirDominant)
    ? getElementCompatibility(myDominant, theirDominant) : ""

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        <div className="flex justify-center pt-4 pb-0">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">✦ ASTERIA ✦</span>
        </div>

        {/* 星座バッジ */}
        <div className="flex items-center gap-2.5 pt-3.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(201,165,84,.3)" }}>
            <span className="font-serif text-[14px] text-[#F0F0F8]">{my_sign}</span>
            <span className="text-[10px] text-white/45">あなた</span>
          </div>
          <span className="text-gold text-lg">✦</span>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(201,165,84,.3)" }}>
            <span className="font-serif text-[14px] text-[#F0F0F8]">{their_sign}</span>
            <span className="text-[10px] text-white/45">お相手</span>
          </div>
        </div>

        {/* ヘッドライン */}
        {outputs?.headline && (
          <p className="font-serif text-[13px] italic text-gold leading-7 mt-3 flex items-center gap-1.5">
            <span className="text-[11px]">✦</span>
            <span>{outputs.headline}</span>
            <span className="text-[11px]">✦</span>
          </p>
        )}

        {/* 【1】 ふたりのシンクロスコア（円形リング + ラベル + アイコン付きバー） */}
        {outputs?.scores && (
          <div className="relative overflow-hidden rounded-2xl p-6 mt-3 backdrop-blur-sm" style={GOLD_CARD_STYLE}>
            {/* ヘッダー */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gold/85">
                <span className="text-[10px]">✦</span>
                <span className="font-serif text-[11px] tracking-[0.34em]">ASTERIA READING</span>
                <span className="text-[10px]">✦</span>
              </div>
              <h2
                className="mt-3 font-serif text-[24px] leading-tight text-[#F6F1E4]"
                style={{ textShadow: "0 0 18px rgba(232,184,110,.35)" }}
              >
                ふたりのシンクロスコア
              </h2>
              <p className="mt-1 font-serif text-[12px] tracking-[0.12em] text-[#D9B776]/85">星が導いた、ふたりの相性</p>
            </div>

            {/* リング */}
            <div className="mt-4 flex justify-center">
              <ScoreRing score={outputs.scores.overall ?? 0} />
            </div>

            {/* ラベル枠（後で compat-label-frame.png に差し替え予定） */}
            {overallLabel && <RelationshipLabel label={overallLabel} />}

            {/* 6 項目バー（角丸の枠で囲み、各バーの間にドット区切り） */}
            <div
              className="mt-4 rounded-2xl border border-[#C9A554]/25 px-4 py-4"
              style={{ background: "rgba(8,12,30,0.45)", boxShadow: "inset 0 0 24px rgba(201,165,84,0.05)" }}
            >
              {COMPAT_SCORE_FIELDS.map((field, i) => (
                <div key={field.key}>
                  {i > 0 && (
                    <div className="my-1 flex justify-center gap-2 text-[#D9B776]/35">
                      <span className="text-[8px] leading-none">・</span>
                      <span className="text-[8px] leading-none">・</span>
                      <span className="text-[8px] leading-none">・</span>
                      <span className="text-[8px] leading-none">・</span>
                      <span className="text-[8px] leading-none">・</span>
                    </div>
                  )}
                  <MetricBar
                    icon={field.icon}
                    label={field.label}
                    value={outputs.scores?.[field.key] ?? 0}
                    invert={field.invert}
                  />
                </div>
              ))}
            </div>

            {/* コメント枠 */}
            {scoreComment && (
              <div
                className="mt-6 flex gap-3 rounded-xl border border-gold/30 p-4"
                style={{ background: "rgba(8,12,30,0.55)" }}
              >
                <span className="mt-0.5 shrink-0 text-[14px] text-gold">✦</span>
                <p className="font-serif text-[12.5px] leading-relaxed text-white/85">
                  {scoreComment}
                </p>
              </div>
            )}

            <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/40">
              スコアは良い・悪いの判定ではなく、ふたりの関係に表れやすいテーマの強さを示しています
            </p>
          </div>
        )}

        {/* 01 ふたりの関係 */}
        {outputs?.relationship && (
          <>
            <ChapterHeading number={1} title="ふたりの関係" color="#C9A554" />
            <div className="card p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
              <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
                {outputs.relationship}
              </p>
            </div>
          </>
        )}

        {/* 02 あなたから見たお相手 */}
        {outputs?.from_my_view && (
          <>
            <ChapterHeading number={2} title="あなたから見たお相手" color="#F07098" />
            <div className="card p-4" style={{ borderLeft:"3px solid #F07098" }}>
              <p className="font-serif text-[13px] leading-7 text-[#D0D0E8] font-light">
                {outputs.from_my_view}
              </p>
            </div>
          </>
        )}

        {/* 03 お相手から見たあなた */}
        {outputs?.from_their_view && (
          <>
            <ChapterHeading number={3} title="お相手から見たあなた" color="#70B4FF" />
            <div className="card p-4" style={{ borderLeft:"3px solid #70B4FF" }}>
              <p className="font-serif text-[13px] leading-7 text-[#D0D0E8] font-light">
                {outputs.from_their_view}
              </p>
            </div>
          </>
        )}

        {/* 04 シナストリー（天球の相性） */}
        {synastry?.length > 0 && (
          <>
            <ChapterHeading number={4} title="シナストリー（天球の相性）" color="#C9A554" />
            <div className="card p-4">
            <div className="grid gap-2">
              {synastry.slice(0, 5).map((s: any, i: number) => (
                <div key={i} className="p-3 rounded-[10px]"
                  style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
                  <div className="flex justify-between items-start mb-1.5 flex-wrap gap-1">
                    <span className="text-[12px] text-[#D0D0E8]">
                      あなたの<Link href={`/guide#${String(s.my_planet).toLowerCase()}`} className="text-gold/90 hover:text-gold underline-offset-2 hover:underline">{s.my_planet_ja}</Link> × お相手の<Link href={`/guide#${String(s.their_planet).toLowerCase()}`} className="text-gold/90 hover:text-gold underline-offset-2 hover:underline">{s.their_planet_ja}</Link>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background:`${TONE_COLOR[s.tone]}18`, color:TONE_COLOR[s.tone], border:`1px solid ${TONE_COLOR[s.tone]}30` }}>
                      {s.aspect_ja}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-[3px] rounded-full bg-white/[.06]">
                      <div className="h-full rounded-full" style={{ width:`${s.importance}%`, background:TONE_COLOR[s.tone] }} />
                    </div>
                    <span className="text-[10px] text-white/50 whitespace-nowrap">
                      {IMPORTANCE_LABEL_BY_ASPECT[s.aspect] ?? "相性度"} {s.importance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </>
        )}

        {/* 根拠 toggle */}
        {synastry?.length > 0 && (
          <div className="mt-2.5">
            <button onClick={() => setOpen(o => !o)}
              className="w-full flex items-center justify-center gap-2 py-3 cursor-pointer"
              style={{ background:"rgba(20,25,60,.7)", border:"1px solid rgba(201,165,84,.35)", borderRadius: open ? "11px 11px 0 0" : 11 }}>
              <span className="text-[12px] text-gold">この相性の根拠を見る</span>
              <span className={clsx("text-gold text-[12px] transition-transform duration-200", open && "rotate-180")}>∨</span>
            </button>
            {open && (
              <div className="p-3 border border-gold/20 border-t-0"
                style={{ background:"rgba(15,20,50,.8)", borderRadius:"0 0 11px 11px" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-gold text-[11px]">✦</span>
                  <span className="text-[12px] text-gold font-bold">天体の相性 TOP{Math.min(3, synastry.length)}</span>
                </div>
                {synastry.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-[10px] mb-2"
                    style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>
                    <div className="flex justify-between items-start mb-1.5 flex-wrap gap-1">
                      <span className="text-[12px] text-[#D0D0E8]">
                        あなたの<Link href={`/guide#${String(s.my_planet).toLowerCase()}`} className="text-gold/90 hover:text-gold underline-offset-2 hover:underline">{s.my_planet_ja}</Link> × お相手の<Link href={`/guide#${String(s.their_planet).toLowerCase()}`} className="text-gold/90 hover:text-gold underline-offset-2 hover:underline">{s.their_planet_ja}</Link>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background:`${TONE_COLOR[s.tone]}18`, color:TONE_COLOR[s.tone], border:`1px solid ${TONE_COLOR[s.tone]}30` }}>
                        {s.aspect_ja}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-[3px] rounded-full bg-white/[.06]">
                        <div className="h-full rounded-full" style={{ width:`${s.importance}%`, background:TONE_COLOR[s.tone] }} />
                      </div>
                      <span className="text-[10px] text-white/50 whitespace-nowrap">{s.importance} / 100</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* テーマ別（注意以外をグリッド表示） */}
        <div className="grid grid-cols-2 gap-2.5 mt-6">
          {THEME_CARDS.filter(t => t.key !== "caution").map(({ key, label, icon, c }) => {
            const item = outputs?.[key]
            if (!item) return null
            const ev = EVAL[item.tag] ?? EVAL["○"]
            return (
              <div key={key} className="card p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color:c }} className="text-sm">{icon}</span>
                    <span className="text-[11px] font-bold leading-tight" style={{ color:c }}>{label}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background:ev.bg, border:`1px solid ${ev.bc}`, color:ev.c }}>
                    {item.tag}
                  </span>
                </div>
                <p className="font-sans text-[11px] leading-[1.75] text-[#A0A0C0] font-light">
                  {item.text}
                </p>
              </div>
            )
          })}
        </div>

        {/* 【3】 注意が必要なこと → AlertCard */}
        {outputs?.caution && (
          <div className="mt-2.5">
            <AlertCard title="注意が必要なこと" keyword={outputs.caution.tag ? `相性タグ ${outputs.caution.tag}` : undefined}>
              {outputs.caution.text}
            </AlertCard>
          </div>
        )}

        {/* キーワード */}
        {outputs?.keywords?.length > 0 && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">相性キーワード</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {outputs.keywords.map((kw: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full text-[12px] text-gold"
                  style={{ background:"rgba(201,165,84,.1)", border:"1px solid rgba(201,165,84,.3)" }}>
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 05 エレメント相性 */}
        {myPct && theirPct && myDominant && theirDominant && (
          <>
            <ChapterHeading number={5} title="エレメント相性" color="#C9A554" />
            <div className="card p-4">

            <div className="flex flex-col gap-2.5 mb-3">
              {[
                { label: "あなた",   pct: myPct,    balance: myBalance!,    dom: myDominant },
                { label: "お相手",   pct: theirPct, balance: theirBalance!, dom: theirDominant },
              ].map(({ label, pct, balance, dom }) => (
                <div key={label} className="p-3 rounded-[10px]"
                  style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
                  <div className="flex items-baseline justify-between mb-2.5">
                    <span className="text-[11px] text-white/55">{label}</span>
                    <span className="font-serif text-[12px]" style={{ color: ELEMENT_INFO[dom].color }}>
                      {getElementTitle(balance)}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {ELEMENTS.map(el => (
                      <div key={el}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[12px]" style={{ color: ELEMENT_INFO[el].color }}>
                            {ELEMENT_INFO[el].ja}
                          </span>
                          <span className="text-[12px] text-white/60 tabular-nums">{pct[el]}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[.08] overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct[el]}%`, background: ELEMENT_INFO[el].color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-[10px]"
              style={{ background:"rgba(201,165,84,.06)", border:"1px solid rgba(201,165,84,.2)" }}>
              <div className="text-[11px] mb-1.5 flex items-center gap-1.5">
                <span className="font-serif" style={{ color: ELEMENT_INFO[myDominant].color }}>
                  {ELEMENT_INFO[myDominant].ja}
                </span>
                <span className="text-white/40 text-[10px]">×</span>
                <span className="font-serif" style={{ color: ELEMENT_INFO[theirDominant].color }}>
                  {ELEMENT_INFO[theirDominant].ja}
                </span>
                <span className="text-[10px] text-gold/70 ml-1">の組み合わせ</span>
              </div>
              <p className="text-[12px] text-[#C0C0D8] leading-relaxed font-light">
                {elementCompat}
              </p>
            </div>
            </div>
          </>
        )}

        {/* 06 アドバイス → LuckyCard スタイル（グリーン） */}
        {outputs?.advice && (
          <>
            <ChapterHeading number={6} title="アドバイス" color="#8BC34A" />
            <div className="rounded-2xl p-4"
              style={{ background:"linear-gradient(135deg,rgba(20,44,32,.9),rgba(14,30,22,.9))", border:"1px solid rgba(112,221,168,.28)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ color:"#8BC34A" }}>✦</span>
                <span className="font-serif text-[14px]" style={{ color:"#A8E08F" }}>ふたりへのアドバイス</span>
              </div>
              <p className="font-serif text-[13px] leading-8 text-[#D8E8D0] font-light">
                {adviceText}
              </p>
            </div>
          </>
        )}

        {/* 盛り上がりポイント → ゴールド系（アドバイスのグリーンと色で区別） */}
        {outputs?.highlight && (
          <div className="mt-2.5 rounded-2xl p-4 bg-[#C9A554]/10 border border-[#C9A554]/30">
            <div className="flex items-center gap-1.5 mb-2">
              <span>🌟</span>
              <span className="font-serif text-[14px] text-gold">盛り上がりポイント</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#E8E0C8] font-light">
              {outputs.highlight}
            </p>
          </div>
        )}

        {/* 07 すれ違いやすい場面と対処法 → AlertCard スタイル（レッド） */}
        {outputs?.conflict_scene && (
          <>
            <ChapterHeading number={7} title="すれ違いやすい場面と対処法" color="#F5A623" />
            <div className="rounded-2xl p-4"
              style={{ background:"linear-gradient(135deg,rgba(48,20,26,.9),rgba(28,15,22,.9))", border:"1px solid rgba(240,150,120,.28)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ color:"#F5A623" }}>⚠</span>
                <span className="font-serif text-[14px]" style={{ color:"#F5C77E" }}>こんな時は気をつけて</span>
              </div>
              <p className="font-serif text-[13px] leading-8 text-[#E8D8C8] font-light">
                {outputs.conflict_scene}
              </p>
            </div>
          </>
        )}

        {/* 【4】 ふたりの合言葉 → ゴールドグラデ・装飾ライン・大きなイタリック */}
        {outputs?.magic_phrase && (
          <div className="relative overflow-hidden rounded-2xl p-8 mt-3 text-center backdrop-blur-sm" style={GOLD_CARD_STYLE}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gold text-sm">✦</span>
              <span className="text-[14px] font-bold tracking-[0.18em] text-gold"
                style={{ textShadow:"0 0 14px rgba(201,165,84,.4)" }}>
                ふたりの合言葉
              </span>
              <span className="text-gold text-sm">✦</span>
            </div>
            <OrnamentalDivider />
            <p className="font-serif italic text-gold text-[30px] leading-[1.5] py-3"
              style={{ textShadow:"0 0 34px rgba(201,165,84,.7), 0 0 14px rgba(201,165,84,.5)" }}>
              「{outputs.magic_phrase}」
            </p>
            <OrnamentalDivider />
          </div>
        )}

        {/* 【5】 X でシェア（ゴールド CTA） */}
        <div className="mt-4">
          <XShareButton variant="gold" text={`✦ ${my_sign}×${their_sign}の相性を診断しました。#ASTERIA #相性診断`} />
        </div>

        <button onClick={() => router.push("/compat")}
          className="btn-gold-outline w-full py-3.5 mt-3 rounded-full flex items-center justify-center gap-2">
          <span>←</span><span>別の相性を診断する</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}