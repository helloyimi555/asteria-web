"use client"
import { useParams, useRouter } from "next/navigation"
import { useReading } from "@/hooks/useReading"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { TopNav } from "@/components/layout/TopNav"
import clsx from "clsx"
import { useState } from "react"

const THEME_CARDS = [
  { key:"work",    label:"仕事運",  icon:"💼", c:"#70B4FF", bg:"rgba(112,180,255,.15)" },
  { key:"love",    label:"恋愛運",  icon:"♡",  c:"#F07098", bg:"rgba(240,112,152,.15)" },
  { key:"health",  label:"健康運",  icon:"◎",  c:"#70DDA8", bg:"rgba(112,221,168,.15)" },
  { key:"caution", label:"注意点",  icon:"△",  c:"#FFC96E", bg:"rgba(255,201,110,.15)" },
]

const THEME_LABEL: Record<string, string> = {
  general:      "総合運",
  work:         "仕事運",
  love:         "恋愛運",
  health:       "健康運",
  money:        "金運",
  relationship: "人間関係",
}

export default function ReadingResultPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const { data: reading, isLoading } = useReading(id)
  const [open,  setOpen] = useState(false)

  if (isLoading || reading?.status === "pending" || reading?.status === "processing") {
    return <LoadingView />
  }
  if (!reading || reading.status === "failed") {
    return <ErrorView onBack={() => router.push("/reading")} />
  }

  const { outputs } = reading
  const themeLabel = THEME_LABEL[reading.theme] ?? "鑑定結果"

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />
      <div className="hidden md:block"><TopNav /></div>

      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        {/* Nav */}
        <div className="flex justify-between items-center pt-4 pb-0 md:hidden">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">ASTERIA</span>
          <span className="text-white/50 text-lg">☰</span>
        </div>

        {/* Headline */}
        {outputs?.headline && (
          <p className="font-serif text-[13px] italic text-gold leading-7 mt-3">
            {outputs.headline}
          </p>
        )}

        {/* メインテーマ */}
        {outputs?.overall && (
          <div className="card mt-3 p-4" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-gold text-sm">✦</span>
              <span className="font-sans text-[13px] font-bold text-[#F0F0F8]">{themeLabel}</span>
            </div>
            <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
              {outputs.overall}
            </p>
          </div>
        )}

        {/* 根拠 toggle */}
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

        {/* テーマ別 2x2 */}
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          {THEME_CARDS.map(({ key, label, icon, c, bg }) => {
            const text = (outputs as any)?.[key]
            if (!text) return null
            return (
              <div key={key} className="card p-3.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2 text-lg"
                  style={{ background:bg, border:`1px solid ${c}30`, color:c }}>
                  {icon}
                </div>
                <div className="text-[12px] font-bold mb-1.5" style={{ color:c }}>{label}</div>
                <p className="font-sans text-[11px] leading-[1.75] text-[#A0A0C0] font-light">{text}</p>
              </div>
            )
          })}
        </div>

        {/* キーワード */}
        {(outputs?.keywords as any)?.length > 0 && (
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

        {/* ラッキーアクション */}
        {outputs?.lucky_action && (
          <div className="mt-2.5 p-4 rounded-xl"
            style={{ background:"linear-gradient(135deg,rgba(120,80,10,.85),rgba(80,50,5,.85))", border:"1px solid rgba(201,165,84,.3)" }}>
            <div className="text-[11px] text-gold tracking-wider mb-1.5">✦ ラッキーアクション</div>
            <div className="font-serif text-[15px] italic text-[#F0D880] leading-relaxed">
              {outputs.lucky_action}
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
              {outputs.advice}
            </p>
          </div>
        )}

        {/* Back */}
        <button onClick={() => router.push("/reading")}
          className="btn-gold-outline w-full py-3.5 mt-4 flex items-center justify-center gap-2">
          <span>←</span><span>別の鑑定を行う</span>
        </button>
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