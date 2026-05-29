"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { themeLabel as resolveThemeLabel } from "@/utils/dateUtils"

export default function GuestResultPage() {
  const router = useRouter()
  const [reading, setReading] = useState<any>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("asteria_guest_result")
      if (saved) {
        setReading(JSON.parse(saved))
      } else {
        router.push("/reading")
      }
    } catch {
      router.push("/reading")
    }
  }, [])

  if (!reading) return null

  const { outputs, theme } = reading
  const themeLabel = resolveThemeLabel(theme)

  return (
    <div className="relative min-h-screen pb-28">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-[18px]">
        <div className="flex justify-between items-center pt-4 pb-0">
          <span className="font-serif text-[13px] tracking-wider shimmer-gold">ASTERIA</span>
        </div>

        {/* メインテーマ（前半のみ） */}
        {outputs?.overall && (
          <div className="card mt-3 p-4 relative overflow-hidden" style={{ borderLeft:"3px solid rgba(201,165,84,.6)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-gold text-sm">✦</span>
              <span className="font-serif text-[14px] text-[#F0F0F8]">{themeLabel}</span>
            </div>
            <GuestOverallText text={outputs.overall} />
          </div>
        )}

        {/* ペイウォール */}
        <div className="mt-4 p-5 rounded-xl text-center"
          style={{ background:"linear-gradient(135deg,rgba(30,20,60,.95),rgba(20,15,50,.95))", border:"1px solid rgba(201,165,84,.3)" }}>
          <div className="text-gold text-lg mb-2">✦</div>
          <h3 className="font-serif text-[15px] text-[#F0F0F8] mb-2">続きを読む・詳細を見る</h3>
          <p className="text-[12px] text-white/50 mb-1 leading-6">
            会員登録（無料）で
          </p>
          <div className="text-[12px] text-white/70 mb-4 space-y-1">
            <p>✦ 鑑定全文を読む</p>
            <p>✦ 仕事運・恋愛運・健康運など全テーマ</p>
            <p>✦ キーワード・ラッキーアクション</p>
            <p>✦ 鑑定履歴の保存</p>
          </div>
          <button onClick={() => router.push("/auth/register")}
            className="btn-gold w-full py-3.5 text-[14px] mb-2">
            無料で会員登録する
          </button>
          <button onClick={() => router.push("/auth/login")}
            className="text-[12px] text-white/40 hover:text-white/70">
            すでにアカウントをお持ちの方
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function GuestOverallText({ text }: { text: string }) {
  const parts = text.split(/(?=【)/)
  const firstPart = parts[0] || text

  const match = firstPart.match(/^【(.+?)】(.*)$/s)
  const displayText = match ? match[2].trim() : firstPart.trim()
  const heading = match ? match[1] : null

  // 最初の200字程度で切る
  const truncated = displayText.length > 200 ? displayText.slice(0, 200) + "…" : displayText

  return (
    <div className="relative">
      {heading && (
        <div className="text-[12px] font-bold text-gold/80 mb-1.5">【{heading}】</div>
      )}
      <p className="font-serif text-[13px] leading-8 text-[#D0D0E8] font-light">
        {truncated}
      </p>
      <div className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background:"linear-gradient(to bottom, transparent, rgba(10,12,30,0.95))" }} />
    </div>
  )
}