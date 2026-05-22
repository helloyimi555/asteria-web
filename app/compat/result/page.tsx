"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useState, Suspense } from "react"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { TopNav } from "@/components/layout/TopNav"
import { getSunSign, TONE_COLOR } from "@/lib/zodiac"
import type { ZodiacSign } from "@/types"
import clsx from "clsx"

// 評価タグスタイル
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

// モック相性データ（API実装後は差し替え）
function buildMockResult(mySign: ZodiacSign, theirSign: ZodiacSign, rel: string) {
  return {
    headline:      "価値観の違いが、互いの成長を促す関係です",
    relationship:  `堅実で安定を大切にする${mySign.sign}と、自由と冒険を求める${theirSign.sign}。アプローチや考え方は異なりますが、その違いが視野を広げ、新しい可能性をもたらしてくれます。互いに尊重し、それぞれのペースを認め合うことで、信頼が深まる関係へと発展します。`,
    love:          { tag:"◎", text:"お互いの魅力に惹かれ合い、刺激し合える関係です。価値観の違いが新鮮さを保ち、深い絆を育てます。" },
    communication: { tag:"○", text:"考え方のペースが異なることがありますが、対話を重ねるほど理解が深まり、信頼が強くなっていきます。" },
    lifestyle:     { tag:"○", text:"大切にしていることに違いはあっても、互いの価値観を学び合うことで、より豊かな暮らしを築けます。" },
    caution:       { tag:"△", text:"自由を重んじるお相手に対して、束縛を感じさせないよう注意。決断のタイミングのズレにも気をつけましょう。" },
    keywords:      ["刺激し合う","補完関係","成長促進"],
    good_timing:        "7/12(日)・8/3(月)・9/15(火)",
    good_timing_reason: "新しい一歩を踏み出したり、関係を深めるのに適した日です。",
    advice:        "違いを楽しみ、相手の世界を尊重する姿勢が、ふたりの未来を明るくします。小さな気づきや感謝を言葉にすると、より良い関係が育っていきます。",
  }
}

function SignBadge({ sign, label }: { sign:ZodiacSign; label:string }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
      style={{ background:"rgba(255,255,255,.06)", border:`1px solid ${sign.color}30` }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background:`${sign.color}18`, border:`1.5px solid ${sign.color}45`, color:sign.color }}>
        {sign.symbol}
      </div>
      <div>
        <div className="font-serif text-[14px] text-[#F0F0F8] font-semibold">{sign.sign}</div>
        <div className="text-[10px] text-white/45">{label}</div>
      </div>
    </div>
  )
}

function CompatResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const myDateStr    = searchParams.get("my")    ?? ""
  const theirDateStr = searchParams.get("their") ?? ""
  const rel          = searchParams.get("rel")   ?? "partner"

  const mySign    = useMemo(() => getSunSign(myDateStr),    [myDateStr])
  const theirSign = useMemo(() => getSunSign(theirDateStr), [theirDateStr])

  if (!mySign || !theirSign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-white/50 mb-4">情報が不足しています</p>
          <button onClick={() => router.push("/compat")} className="btn-gold px-6 py-3 text-[14px]">
            戻る
          </button>
        </div>
      </div>
    )
  }

  const result = buildMockResult(mySign, theirSign, rel)

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />
      <div className="hidden md:block"><TopNav /></div>

      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        {/* Header */}
        <div className="flex justify-center pt-4 pb-0 md:hidden">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">✦ ASTERIA ✦</span>
        </div>

        {/* 2 sign badges */}
        <div className="flex items-center gap-2.5 pt-3.5 flex-wrap">
          <SignBadge sign={mySign}    label="あなた" />
          <span className="text-gold text-lg flex-shrink-0">✦</span>
          <SignBadge sign={theirSign} label="お相手" />
        </div>

        {/* Headline */}
        <p className="font-serif text-[13px] italic text-gold leading-7 mt-3
                      flex items-center gap-1.5">
          <span className="text-[11px]">✦</span>
          <span>{result.headline}</span>
          <span className="text-[11px]">✦</span>
        </p>

        {/* ふたりの関係 */}
        <div className="card mt-3 p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-gold text-sm">✦</span>
            <span className="font-sans text-[13px] font-bold text-[#F0F0F8]">ふたりの関係</span>
          </div>
          <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
            {result.relationship}
          </p>
        </div>

        {/* 根拠 toggle */}
        <div className="mt-2.5">
          <button onClick={() => setOpen(o => !o)}
            className="w-full flex items-center justify-center gap-2 py-3 cursor-pointer"
            style={{
              background:"rgba(20,25,60,.7)", border:"1px solid rgba(201,165,84,.35)",
              borderRadius: open ? "11px 11px 0 0" : 11,
            }}>
            <span className="text-[12px] text-gold">この相性の根拠を見る</span>
            <span className={clsx("text-gold text-[12px] transition-transform duration-200", open && "rotate-180")}>∨</span>
          </button>
          {open && (
            <div className="p-3 border border-gold/20 border-t-0"
              style={{ background:"rgba(15,20,50,.8)", borderRadius:"0 0 11px 11px" }}>
              {/* 天体の相性TOP3 */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-gold text-[11px]">✦</span>
                <span className="text-[12px] text-gold font-bold">天体の相性 TOP3</span>
              </div>
              {[
                { my:"太陽", their:"月",   rel:"調和して流れ込む",     imp:80, tone:"positive", theme:"感情と意志の補完関係" },
                { my:"金星", their:"木星", rel:"軽やかにサポートする", imp:86, tone:"positive", theme:"愛情の自然な拡大と成長" },
                { my:"土星", their:"火星", rel:"直角にぶつかる",       imp:72, tone:"warning",  theme:"行動のペースの違いと調整" },
              ].map((s, i) => (
                <div key={i} className="p-2.5 rounded-[10px] mb-2"
                  style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>
                  <div className="flex justify-between items-start mb-1.5 flex-wrap gap-1">
                    <span className="text-[12px] text-[#D0D0E8]">
                      あなたの{s.my} × お相手の{s.their}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background:`${TONE_COLOR[s.tone]}18`, color:TONE_COLOR[s.tone], border:`1px solid ${TONE_COLOR[s.tone]}30` }}>
                      {s.rel}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mb-1.5">テーマ：{s.theme}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[3px] rounded-full bg-white/[.06]">
                      <div className="h-full rounded-full" style={{ width:`${s.imp}%`, background:TONE_COLOR[s.tone] }} />
                    </div>
                    <span className="text-[10px] text-white/50 whitespace-nowrap">{s.imp} / 100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* テーマ別 2×2 */}
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          {THEME_CARDS.map(({ key, label, icon, c }) => {
            const item = (result as any)[key] as { tag:"◎"|"○"|"△"; text:string }
            const ev   = EVAL[item.tag] ?? EVAL["○"]
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
        <div className="card mt-2.5 p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-gold text-xs">✦</span>
            <span className="text-[12px] font-bold text-[#F0F0F8]">相性キーワード</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-[12px] text-gold"
                style={{ background:"rgba(201,165,84,.1)", border:"1px solid rgba(201,165,84,.3)" }}>
                #{kw}
              </span>
            ))}
          </div>
        </div>

        {/* 良いタイミング */}
        <div className="card mt-2.5 p-4" style={{ borderColor:"rgba(112,221,168,.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📅</span>
            <span className="text-[12px] font-bold text-[#70DDA8]">ふたりにとって良いタイミング</span>
          </div>
          <div className="font-serif text-[14px] text-[#70DDA8] font-semibold mb-1">
            {result.good_timing}
          </div>
          <p className="text-[11px] text-white/45">{result.good_timing_reason}</p>
        </div>

        {/* アドバイス */}
        <div className="card mt-2.5 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-gold text-xs">✦</span>
            <span className="text-[12px] font-bold text-[#F0F0F8]">アドバイス</span>
          </div>
          <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">
            {result.advice}
          </p>
        </div>

        {/* Back */}
        <button onClick={() => router.push("/compat")}
          className="btn-gold-outline w-full py-3.5 mt-4 rounded-full
                     flex items-center justify-center gap-2">
          <span>←</span><span>別の相性を診断する</span>
        </button>
      </div>

      <div className="md:hidden"><BottomNav /></div>
    </div>
  )
}

export default function CompatResultPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center">
        <Stars />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-gold/30 border-t-gold
                          animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-[14px]">診断中...</p>
        </div>
      </div>
    }>
      <CompatResultContent />
    </Suspense>
  )
}
