"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { isLoggedIn, clearTokens } from "@/lib/api"

const FEATURES = [
  { icon:"🔭", title:"天体計算",  desc:"Swiss Ephemerisによる正確な計算" },
  { icon:"📖", title:"解釈ルール",desc:"占星術の知識をルール化" },
  { icon:"✨", title:"AI文章化",  desc:"あなただけの言葉で表現" },
]

export default function HomePage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(isLoggedIn())
  }, [])

  if (loggedIn) {
    return <LoggedInHome onLogout={() => {
      clearTokens()
      localStorage.removeItem("asteria_profile")
      setLoggedIn(false)
    }} />
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
      <Stars />

      <header className="relative z-10 w-full max-w-app px-5 pt-5 flex justify-between items-center">
        <span className="font-serif text-[15px] tracking-widest shimmer-gold">✦ ASTERIA</span>
        <Link href="/auth/login" className="text-sm text-white/50 hover:text-white/80 transition-colors">
          ログイン
        </Link>
      </header>

      <section className="relative z-10 w-full max-w-app px-5 flex flex-col items-center
                          justify-center text-center min-h-[60vh]">
        <ZodiacWheelSVG />
        <h1 className="font-serif text-[clamp(26px,7vw,36px)] font-normal leading-[1.45]
                       text-white mb-5 animate-fade-up">
          天体の動きを根拠に、<br />あなたの今を<br />言語化する
        </h1>
        <div className="flex items-center gap-2.5 w-full mb-4 opacity-0 animate-fade-up"
          style={{ animationDelay:"0.2s" }}>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-gold/70 text-sm">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/50" />
        </div>
        <p className="text-[13px] text-white/55 leading-7 mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay:"0.2s" }}>
          出生情報と現在・未来の天体配置から、<br />今のテーマを読み解きます
        </p>
        <div className="w-full opacity-0 animate-fade-up" style={{ animationDelay:"0.4s" }}>
          <Link href="/reading"
            className="btn-gold flex items-center justify-center gap-2 py-4 px-6 text-[16px] mb-3">
            ✦ 無料で鑑定を始める
          </Link>
          <Link href="/auth/register"
            className="btn-gold-outline flex items-center justify-center gap-2 py-3 px-6 text-[14px]">
            会員登録（無料）
          </Link>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-app px-5 pb-16">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
          <span className="font-serif text-[12px] text-gold tracking-widest">
            ✦ ASTERIAの3つの特徴 ✦
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="card border-gold-dim p-4 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center
                              text-xl bg-white/[0.06] border border-gold/30">
                {f.icon}
              </div>
              <div className="font-serif text-[12px] text-[#F0F0F8] font-semibold mb-1.5">
                {f.title}
              </div>
              <div className="w-4 h-px bg-gold/40 mx-auto mb-1.5" />
              <div className="text-[10px] text-white/45 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
        <Link href="/reading"
          className="btn-gold-outline flex items-center justify-center gap-2 py-3.5 px-6 text-[14px]">
          ✦ 今すぐ鑑定する <span>›</span>
        </Link>
      </section>
    </div>
  )
}

function LoggedInHome({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5">
        <div className="pt-9 pb-5 flex justify-between items-center">
          <span className="font-serif text-[15px] tracking-widest shimmer-gold">✦ ASTERIA</span>
          <button onClick={onLogout} className="text-[12px] text-white/40 hover:text-white/70 transition-colors">
            ログアウト
          </button>
        </div>

        <div className="text-center mb-8">
          <ZodiacWheelSVG />
          <h1 className="font-serif text-[22px] text-white mb-2">おかえりなさい</h1>
          <p className="text-[13px] text-white/50">今日の天体はあなたに何を語りますか</p>
        </div>

        <div className="space-y-3">
          <Link href="/reading"
            className="btn-gold flex items-center justify-center gap-2 py-4 text-[15px]">
            ✦ 新しい鑑定を始める
          </Link>

          <Link href="/reading/results"
            className="card flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-[13px] text-[#F0F0F8] font-bold mb-0.5">過去の鑑定を見る</div>
              <div className="text-[11px] text-white/40">これまでの鑑定履歴</div>
            </div>
            <span className="text-white/30">›</span>
          </Link>

          <Link href="/mypage"
            className="card flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-[13px] text-[#F0F0F8] font-bold mb-0.5">マイページ</div>
              <div className="text-[11px] text-white/40">プロフィール・設定</div>
            </div>
            <span className="text-white/30">›</span>
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function ZodiacWheelSVG() {
  const syms = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"]
  const R = 140, Ri = 105
  return (
    <svg viewBox="0 0 320 320"
      className="absolute top-1/2 left-1/2 opacity-[.18] pointer-events-none"
      style={{ transform:"translate(-50%,-52%)", width:"min(85vw,340px)", height:"min(85vw,340px)" }}>
      <circle cx="160" cy="160" r={R}  fill="none" stroke="#C9A554" strokeWidth="1.5" />
      <circle cx="160" cy="160" r={Ri} fill="none" stroke="#C9A554" strokeWidth="0.8" strokeDasharray="3,5" />
      <circle cx="160" cy="160" r="22" fill="none" stroke="#C9A554" strokeWidth="0.8" />
      {syms.map((_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        return <line key={i}
          x1={160 + Ri * Math.cos(a)} y1={160 + Ri * Math.sin(a)}
          x2={160 + R  * Math.cos(a)} y2={160 + R  * Math.sin(a)}
          stroke="#C9A554" strokeWidth="0.8" />
      })}
      {syms.map((s, i) => {
        const a = ((i + .5) * 30 - 90) * Math.PI / 180
        const rm = (R + Ri) / 2
        return <text key={i}
          x={160 + rm * Math.cos(a)} y={160 + rm * Math.sin(a)}
          textAnchor="middle" dominantBaseline="middle"
          fill="#C9A554" fontSize="15">{s}</text>
      })}
    </svg>
  )
}
