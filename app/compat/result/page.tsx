"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Stars } from "@/components/ui/Stars"
import NatalChart from "@/components/ui/NatalChart"
import { BottomNav } from "@/components/layout/BottomNav"
import { TONE_COLOR } from "@/lib/zodiac"
import { XShareButton } from "@/components/ui/XShareButton"
import {
  calcElementBalance, elementPercents, getDominantElement, getElementCompatibility,
  getElementTitle, ELEMENTS, ELEMENT_INFO,
} from "@/lib/elements"
import clsx from "clsx"

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

const SCORE_FIELDS = [
  { key: "love", label: "恋愛・ときめき", color: "#F07098" },
  { key: "trust", label: "安心感・信頼", color: "#70DDA8" },
  { key: "communication", label: "会話のしやすさ", color: "#70B4FF" },
  { key: "values", label: "価値観の一致", color: "#D4AF37" },
  { key: "growth", label: "成長し合う力", color: "#A37DFF" },
  { key: "caution", label: "すれ違い注意度", color: "#FFA94D" },
]

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
    ? overallScore >= 85 ? "◎ 深く惹かれ合う関係"
    : overallScore >= 70 ? "○ 理解し合えるほど育つ関係"
    : overallScore >= 50 ? "△ 対話で相性を高める関係"
    : "努力でより良くなる関係"
    : ""

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

        {outputs?.scores && (
          <div className="card mt-3 p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-gold text-sm">✦</span>
              <span className="font-sans text-[13px] font-bold text-[#F0F0F8]">星のシンクロスコア</span>
            </div>
            <div className="grid gap-4">
              <div className="text-center">
                <div className="text-[44px] font-bold text-[#F0F0F8]">{outputs.scores.overall ?? 0} / 100</div>
                <div className="mt-2 text-[13px] font-semibold text-[#D0D0E8]">{overallLabel}</div>
              </div>
              <div className="grid gap-3">
                {SCORE_FIELDS.map(({ key, label, color }) => {
                  const score = outputs.scores?.[key] ?? 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] text-[#E8E8FF]">{label}</span>
                        <span className="text-[12px] text-white/60">{score} / 100</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[.08] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${Math.max(0, Math.min(100, score))}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-white/40 leading-5 pt-3 border-t border-white/10">
                スコアは良い・悪いの判定ではなく、ふたりの関係に表れやすいテーマの強さを示しています
              </p>
            </div>
          </div>
        )}

        {/* ふたりの関係 */}
        {outputs?.relationship && (
          <div className="card mt-3 p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-gold text-sm">✦</span>
              <span className="font-sans text-[13px] font-bold text-[#F0F0F8]">ふたりの関係</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
              {outputs.relationship}
            </p>
          </div>
        )}

        {outputs?.from_my_view && (
          <div className="card mt-2.5 p-4" style={{ borderLeft:"3px solid #F07098" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#F07098] text-sm">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">あなたから見たお相手</span>
            </div>
            <p className="font-serif text-[13px] leading-7 text-[#D0D0E8] font-light">
              {outputs.from_my_view}
            </p>
          </div>
        )}

        {outputs?.from_their_view && (
          <div className="card mt-2.5 p-4" style={{ borderLeft:"3px solid #70B4FF" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#70B4FF] text-sm">☽</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">お相手から見たあなた</span>
            </div>
            <p className="font-serif text-[13px] leading-7 text-[#D0D0E8] font-light">
              {outputs.from_their_view}
            </p>
          </div>
        )}

        {/* シナストリー TOP5 */}
        {synastry?.length > 0 && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">シナストリー（天体の相性）</span>
            </div>
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

        {/* テーマ別 2×2 */}
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          {THEME_CARDS.map(({ key, label, icon, c }) => {
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

        {/* ふたりのエレメント相性 */}
        {myPct && theirPct && myDominant && theirDominant && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">ふたりのエレメント相性</span>
            </div>

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
                  <div className="space-y-1.5">
                    {ELEMENTS.map(el => (
                      <div key={el} className="flex items-center gap-2">
                        <span className="text-[10px] w-4 shrink-0" style={{ color: ELEMENT_INFO[el].color }}>
                          {ELEMENT_INFO[el].ja}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-white/[.08] overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: `${pct[el]}%`, background: ELEMENT_INFO[el].color }} />
                        </div>
                        <span className="text-[10px] text-white/55 w-8 text-right tabular-nums">{pct[el]}%</span>
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
        )}

        {/* アドバイス */}
        {outputs?.advice && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">アドバイス</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">
              {adviceText}
            </p>
          </div>
        )}

{/* 盛り上がりポイント */}
        {outputs?.highlight && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">ふたりの盛り上がりポイント</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">
              {outputs.highlight}
            </p>
          </div>
        )}

        {/* すれ違いシーン */}
        {outputs?.conflict_scene && (
          <div className="card mt-2.5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[#FFC96E] text-xs">△</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">すれ違いやすい場面と対処法</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">
              {outputs.conflict_scene}
            </p>
          </div>
        )}

        {/* 合言葉 */}
        {outputs?.magic_phrase && (
          <div className="card mt-2.5 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-gold text-xs">✦</span>
              <span className="text-[12px] font-bold text-[#F0F0F8]">ふたりの合言葉</span>
              <span className="text-gold text-xs">✦</span>
            </div>
            <p className="font-serif text-[16px] text-gold leading-8">
              「{outputs.magic_phrase}」
            </p>
          </div>
        )}

        <div className="mt-4">
          <XShareButton text={`✦ ${my_sign}×${their_sign}の相性を診断しました。#ASTERIA #相性診断`} />
        </div>

        <button onClick={() => router.push("/compat")}
          className="btn-gold-outline w-full py-3.5 mt-3 rounded-full flex items-center justify-center gap-2">
          <span>←</span><span>別の相性を診断する</span>
        </button>
      </div>

      <div className="md:hidden"><BottomNav /></div>
    </div>
  )
}