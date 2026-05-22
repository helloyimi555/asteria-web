"use client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { getSunSign, TONE_COLOR } from "@/lib/zodiac"

const EVAL_STYLE = {
  "◎": { c:"#70DDA8", bg:"rgba(112,221,168,.12)", bc:"rgba(112,221,168,.3)" },
  "○": { c:"#70B4FF", bg:"rgba(112,180,255,.12)", bc:"rgba(112,180,255,.3)" },
  "△": { c:"#FFC96E", bg:"rgba(255,201,110,.12)", bc:"rgba(255,201,110,.3)" },
}
const MOCK = {
  headline: "価値観の違いが、互いの成長を促す関係です",
  relationship: "堅実で安定を大切にするあなたと、自由と冒険を求めるお相手。アプローチや考え方は異なりますが、その違いが視野を広げ、新しい可能性をもたらしてくれます。互いに尊重し、それぞれのペースを認め合うことで、信頼が深まる関係へと発展します。",
  love:          { tag:"◎", text:"お互いの魅力に惹かれ合い、刺激し合える関係です。価値観の違いが新鮮さを保ち、深い絆を育てます。" },
  communication: { tag:"○", text:"考え方のペースが異なることがありますが、対話を重ねるほど理解が深まり、信頼が強くなっていきます。" },
  lifestyle:     { tag:"○", text:"大切にしていることに違いはあっても、互いの価値観を学び合うことで、より豊かな暮らしを築けます。" },
  caution:       { tag:"△", text:"自由を重んじるお相手に対して、束縛を感じさせないよう注意。また、決断のタイミングのズレに気をつけましょう。" },
  keywords: ["刺激し合う", "補完関係", "成長促進"],
  good_timing: "7/12(日)・8/3(月)・9/15(火)",
  good_timing_reason: "新しい一歩を踏み出したり、関係を深めるのに適した日です。",
  advice: "違いを楽しみ、相手の世界を尊重する姿勢が、ふたりの未来を明るくします。小さな気づきや感謝を言葉にすると、より良い関係が育っていきます。",
}
const SYNASTRY = [
  { myP:"太陽（牡牛座）", theirP:"月（射手座）", rel:"調和して流れ込む",     imp:80, tone:"positive", theme:"感情と意志の補完関係" },
  { myP:"金星",           theirP:"木星",          rel:"軽やかにサポートする", imp:86, tone:"positive", theme:"愛情の自然な拡大と成長" },
  { myP:"土星",           theirP:"火星",          rel:"直角にぶつかる",       imp:72, tone:"warning",  theme:"行動のペースの違いと調整" },
]
const THEMES = [
  { key:"love",          label:"恋愛・パートナーシップ", icon:"♡", c:"#F07098" },
  { key:"communication", label:"コミュニケーション",      icon:"◎", c:"#70B4FF" },
  { key:"lifestyle",     label:"価値観・ライフスタイル",  icon:"✿", c:"#70DDA8" },
  { key:"caution",       label:"注意が必要なこと",        icon:"△", c:"#FFC96E" },
]

export default function CompatResultPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [open, setOpen] = useState(false)
  const parts     = decodeURIComponent(String(id)).split("_")
  const mySign    = getSunSign(parts[0] ?? "")
  const theirSign = getSunSign(parts[1] ?? "")

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        <div className="flex justify-between items-center pt-4">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">✦ ASTERIA ✦</span>
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {[{sign:mySign,label:"あなた"},{sign:theirSign,label:"お相手"}].map(({sign,label},i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i===1 && <span className="text-gold text-base">✦</span>}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background:"rgba(255,255,255,.06)", border:`1px solid ${sign?.color??"#C9A554"}30` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                  style={{ background:`${sign?.color??"#C9A554"}18`, border:`1.5px solid ${sign?.color??"#C9A554"}45`, color:sign?.color??"#C9A554" }}>
                  {sign?.symbol}
                </div>
                <div>
                  <div className="font-serif text-[13px] text-[#F0F0F8] font-semibold leading-tight">{sign?.sign}</div>
                  <div className="text-[10px] text-white/45">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="font-serif text-[13px] italic text-gold leading-7 mt-3 flex items-center gap-1.5">
          <span className="text-[11px]">✦</span><span>{MOCK.headline}</span><span className="text-[11px]">✦</span>
        </p>
        <div className="card mt-3 p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-gold text-xs">✦</span>
            <span className="font-sans text-[13px] font-bold text-[#F0F0F8]">ふたりの関係</span>
          </div>
          <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">{MOCK.relationship}</p>
        </div>
        <div className="mt-2.5">
          <button onClick={() => setOpen(o=>!o)} className="w-full flex items-center justify-center gap-2 py-3"
            style={{ background:"rgba(20,25,60,.7)", border:"1px solid rgba(201,165,84,.35)", borderRadius:open?"12px 12px 0 0":"12px" }}>
            <span className="text-[12px] text-gold">この相性の根拠を見る</span>
            <span className={`text-gold text-[12px] transition-transform duration-200 ${open?"rotate-180":""}`}>∨</span>
          </button>
          {open && (
            <div className="p-3 border border-gold/20 border-t-0" style={{ background:"rgba(15,20,50,.8)", borderRadius:"0 0 12px 12px" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-gold text-[11px]">✦</span>
                <span className="text-[12px] text-gold font-bold">天体の相性 TOP3</span>
              </div>
              {SYNASTRY.map((s,i) => (
                <div key={i} className="p-2.5 rounded-lg mb-2 last:mb-0"
                  style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>
                  <div className="flex justify-between items-start mb-1 gap-2 flex-wrap">
                    <span className="text-[11px] text-[#D0D0E8]">あなたの{s.myP} × お相手の{s.theirP}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background:`${TONE_COLOR[s.tone]}18`, color:TONE_COLOR[s.tone], border:`1px solid ${TONE_COLOR[s.tone]}30` }}>
                      {s.rel}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/50 mb-1.5">テーマ：{s.theme}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-white/[0.06]">
                      <div style={{ width:`${s.imp}%`, background:TONE_COLOR[s.tone] }} className="h-full rounded-full" />
                    </div>
                    <span className="text-[10px] text-white/50 whitespace-nowrap">{s.imp} / 100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          {THEMES.map(({ key, label, icon, c }) => {
            const item = (MOCK as any)[key]
            if (!item) return null
            const ev = EVAL_STYLE[item.tag as keyof typeof EVAL_STYLE] ?? EVAL_STYLE["○"]
            return (
              <div key={key} className="card p-3.5" style={{ borderColor:`${c}18` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color:c }}>{icon}</span>
                    <span className="text-[11px] font-bold leading-tight" style={{ color:c }}>{label}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background:ev.bg, color:ev.c, border:`1px solid ${ev.bc}` }}>
                    {item.tag}
                  </span>
                </div>
                <p className="font-sans text-[11px] leading-[1.75] text-[#A0A0C0] font-light">{item.text}</p>
              </div>
            )
          })}
        </div>
        <div className="card mt-2.5 p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-gold text-xs">✦</span>
            <span className="text-[12px] font-bold text-[#F0F0F8]">相性キーワード</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MOCK.keywords.map((kw,i) => (
              <span key={i} className="px-3 py-1 rounded-full text-[12px] text-gold"
                style={{ background:"rgba(201,165,84,.1)", border:"1px solid rgba(201,165,84,.3)" }}>
                #{kw}
              </span>
            ))}
          </div>
        </div>
        <div className="card mt-2.5 p-4" style={{ borderColor:"rgba(112,221,168,.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#70DDA8]">📅</span>
            <span className="text-[12px] font-bold text-[#70DDA8]">ふたりにとって良いタイミング</span>
          </div>
          <div className="font-serif text-[14px] text-[#70DDA8] font-semibold mb-1">{MOCK.good_timing}</div>
          <div className="text-[11px] text-white/45">{MOCK.good_timing_reason}</div>
        </div>
        <div className="card mt-2.5 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-gold text-xs">✦</span>
            <span className="text-[12px] font-bold text-[#F0F0F8]">アドバイス</span>
          </div>
          <p className="font-serif text-[13px] leading-8 text-[#C0C0D8] font-light">{MOCK.advice}</p>
        </div>
        <button onClick={() => router.push("/compat")}
          className="btn-gold-outline w-full py-3.5 mt-4 flex items-center justify-center gap-2 rounded-full">
          <span>←</span><span>別の相性を診断する</span>
        </button>
      </div>
      <BottomNav />
    </div>
  )
}