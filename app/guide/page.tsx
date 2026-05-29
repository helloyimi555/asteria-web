"use client"
import { useEffect, useState } from "react"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { OrnamentalDivider } from "@/components/asteria-ui"

const PLANETS = [
  { planet:"Sun",     name_ja:"太陽",   symbol:"☉", color:"#C9A554", kw:["自己表現","アイデンティティ","生命力"], desc:"あなたの中心にある「自分らしさ」を表します。人生の目的や目指す方向、意志力や創造性の源となる天体です。" },
  { planet:"Moon",    name_ja:"月",     symbol:"☽", color:"#B0A8F0", kw:["感情","本能","習慣"],           desc:"感情・本能・習慣・過去の記憶を司る。日常の感情の波を示す天体です。" },
  { planet:"Mercury", name_ja:"水星",   symbol:"☿", color:"#70B4FF", kw:["思考","言語","コミュニケーション"], desc:"知性・言語・コミュニケーションを司る天体です。" },
  { planet:"Venus",   name_ja:"金星",   symbol:"♀", color:"#F07098", kw:["愛","美","調和","価値観"],         desc:"愛・美・価値観・芸術を司る天体です。" },
  { planet:"Mars",    name_ja:"火星",   symbol:"♂", color:"#FF8A70", kw:["行動","意欲","競争"],              desc:"行動力・意欲・競争心を司る天体です。" },
  { planet:"Jupiter", name_ja:"木星",   symbol:"♃", color:"#70DDA8", kw:["拡大","幸運","成長"],              desc:"拡大・成長・幸運・哲学を司る社会的天体です。" },
  { planet:"Saturn",  name_ja:"土星",   symbol:"♄", color:"#A07CF0", kw:["制限","責任","試練","現実化"],     desc:"制限・責任・試練・現実化を司る天体。29.5年で一周します。" },
  { planet:"Uranus",  name_ja:"天王星", symbol:"♅", color:"#50C8D8", kw:["革新","変革","自由"],              desc:"革新・変革・独自性を司る世代的天体です。" },
  { planet:"Neptune", name_ja:"海王星", symbol:"♆", color:"#70B4FF", kw:["夢","幻想","直感","霊性"],         desc:"夢・幻想・直感・霊性を司る世代的天体です。" },
  { planet:"Pluto",   name_ja:"冥王星", symbol:"♇", color:"#C070E0", kw:["変容","死と再生","権力"],          desc:"変容・死と再生・深層心理を司る天体です。" },
]
const ASPECTS = [
  { name:"コンジャンクション", rel:"強く重なる",          deg:"0°",   c:"#C9A554", desc:"2つの星のエネルギーが合体・強調される。" },
  { name:"オポジション",       rel:"真向かいに対立する",  deg:"180°", c:"#FF8A70", desc:"引き合う磁石のように、互いを意識させ緊張と統合をもたらす。" },
  { name:"トライン",           rel:"調和して流れ込む",    deg:"120°", c:"#70DDA8", desc:"才能が自然に開花しやすい、好調な流れの角度。" },
  { name:"スクエア",           rel:"直角にぶつかる",      deg:"90°",  c:"#FFC96E", desc:"摩擦が生まれるが、乗り越えると大きな成長に繋がる。" },
  { name:"セクスタイル",       rel:"軽やかにサポートする",deg:"60°",  c:"#70B4FF", desc:"協力的でチャンスをもたらす、穏やかな好影響の角度。" },
]
const SIGNS = [
  { sign:"牡羊座", sym:"♈", el:"fire",  kw:"開拓・行動・情熱" },
  { sign:"牡牛座", sym:"♉", el:"earth", kw:"安定・感覚・忍耐" },
  { sign:"双子座", sym:"♊", el:"air",   kw:"知識・好奇心・変化" },
  { sign:"蟹座",   sym:"♋", el:"water", kw:"感情・家族・保護" },
  { sign:"獅子座", sym:"♌", el:"fire",  kw:"自己表現・創造・誇り" },
  { sign:"乙女座", sym:"♍", el:"earth", kw:"分析・完璧主義・奉仕" },
  { sign:"天秤座", sym:"♎", el:"air",   kw:"調和・バランス・美" },
  { sign:"蠍座",   sym:"♏", el:"water", kw:"変容・情熱・深層" },
  { sign:"射手座", sym:"♐", el:"fire",  kw:"自由・冒険・哲学" },
  { sign:"山羊座", sym:"♑", el:"earth", kw:"野心・忍耐・現実" },
  { sign:"水瓶座", sym:"♒", el:"air",   kw:"革新・独自性・未来" },
  { sign:"魚座",   sym:"♓", el:"water", kw:"直感・霊性・共感" },
]
const EL_COLOR: Record<string, string> = { fire:"#FF8A70", earth:"#C9A554", air:"#70B4FF", water:"#70DDD8" }

// 12星座タブのエレメントタグ（日本語・色分け）
const EL_TAG: Record<string, { ja: string; cls: string }> = {
  fire:  { ja:"火", cls:"text-red-300 bg-red-900/20 border-red-400/30" },
  earth: { ja:"地", cls:"text-emerald-300 bg-emerald-900/20 border-emerald-400/30" },
  air:   { ja:"風", cls:"text-sky-300 bg-sky-900/20 border-sky-400/30" },
  water: { ja:"水", cls:"text-violet-300 bg-violet-900/20 border-violet-400/30" },
}

function OrbitSVG({ symbol, color }: { symbol: string; color: string }) {
  const cx=44, cy=44, R=38, ri=24
  const dots = [0,120,240].map(deg => {
    const a = (deg - 90) * Math.PI / 180
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  })
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth="1" opacity=".55" />
      {dots.map((d,i) => <circle key={i} cx={d.x} cy={d.y} r={2.5} fill={color} opacity=".9" />)}
      <circle cx={cx} cy={cy} r={ri} fill={color+"12"} stroke={color} strokeWidth="1.5" />
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="22" fontFamily="serif">{symbol}</text>
    </svg>
  )
}

export default function GuidePage() {
  const [tab, setTab] = useState(0)
  const tabs = ["天体（10）","角度の種類","12星座"]

  // /guide#sun などのハッシュリンクから着地した時に
  // 該当天体タブを開いてアンカーへスクロール
  useEffect(() => {
    const planetNames = PLANETS.map(p => p.planet.toLowerCase())
    const handleHash = () => {
      const hash = window.location.hash.slice(1).toLowerCase()
      if (!hash || !planetNames.includes(hash)) return
      setTab(0)
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 80)
    }
    handleHash()
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app md:max-w-2xl mx-auto">
        <div className="pt-5 pb-4 text-center">
          <h1 className="font-serif text-2xl tracking-wide shimmer-gold">✦ 星ガイド ✦</h1>
        </div>
        <div className="mx-4 mb-4 flex rounded-xl overflow-hidden"
          style={{ background:"rgba(20,25,60,.7)", border:"1px solid rgba(255,255,255,.1)" }}>
          {tabs.map((t,i) => (
            <button key={i} onClick={() => setTab(i)} className="flex-1 py-3 text-[12px] transition-all font-sans"
              style={{ color:tab===i?"#C9A554":"rgba(255,255,255,.5)", borderBottom:tab===i?"2px solid #C9A554":"2px solid transparent", background:tab===i?"rgba(201,165,84,.08)":"transparent" }}>
              {t}
            </button>
          ))}
        </div>

        {tab===0 && (
          <div className="px-4 flex flex-col gap-3">
            {PLANETS.map(p => (
              <div key={p.planet} id={p.planet.toLowerCase()} className="card p-4 flex gap-3 scroll-mt-24"
                style={{ borderLeft:`2px solid ${p.color}` }}>
                <OrbitSVG symbol={p.symbol} color={p.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-serif text-xl text-[#F0F0F8]">{p.name_ja}</span>
                    <span className="font-serif text-base" style={{ color:p.color }}>{p.symbol}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.kw.map((k,i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-md text-[10px] border border-[#C9A554]/30 bg-[#C9A554]/10 text-[#C9A554]">{k}</span>
                    ))}
                  </div>
                  <p className="font-serif text-[13px] text-white/75 leading-[1.85] font-light">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab===1 && (
          <div className="px-4 flex flex-col gap-3">
            <p className="text-center text-[12px] text-white/55 leading-7 mb-1">
              アスペクト（角度）は、天体同士の関係性を表します。<br/>角度によって、エネルギーの質が変わります。
            </p>
            {ASPECTS.map((a,i) => (
              <div key={a.name}>
                {i > 0 && <OrnamentalDivider />}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-serif text-[18px] text-[#F0F0F8] mb-1">{a.name}</div>
                  <div className="text-[11px] text-gold flex items-center gap-1.5 mb-2">
                    <span>✦</span><span>{a.rel}</span><span>✦</span>
                  </div>
                  <div className="font-serif text-4xl leading-none mb-3" style={{ color:a.c }}>{a.deg}</div>
                  <p className="font-serif text-[13px] text-white/75 leading-[1.85] font-light">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab===2 && (
          <div className="px-4">
            <div className="grid grid-cols-2 gap-2.5">
              {SIGNS.map(s => {
                const c = EL_COLOR[s.el] ?? "#C9A554"
                const tag = EL_TAG[s.el]
                return (
                  <div key={s.sign} className="card p-3.5" style={{ borderColor:c+"20" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color:c, fontSize:"20px" }}>{s.sym}</span>
                      <span className="font-serif text-[14px] text-[#F0F0F8]">{s.sign}</span>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-md inline-block mb-1.5 border ${tag?.cls ?? ""}`}>
                      {tag?.ja ?? s.el}
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{s.kw}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}