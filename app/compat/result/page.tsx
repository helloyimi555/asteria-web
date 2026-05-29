"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"

/**
 * 旧 /compat/result はもう localStorage ベースの単一スロットでは運用しない。
 * 互換のため、保存済みデータがあれば対応する `/compat/[id]` へリダイレクトする。
 * compat_id が分からなければ /compat (入力画面) に戻す。
 */
export default function LegacyCompatResultRedirect() {
  const router = useRouter()

  useEffect(() => {
    try {
      const saved = localStorage.getItem("asteria_compat_result")
      if (saved) {
        const parsed = JSON.parse(saved)
        const id = parsed?.compat_id
        if (id) {
          router.replace(`/compat/${id}`)
          return
        }
      }
    } catch {
      /* fall through to /compat */
    }
    router.replace("/compat")
  }, [router])

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
