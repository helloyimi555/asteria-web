"use client"
import { useAuth } from "@/lib/auth-context"
import { useProfiles, useReadingHistory } from "@/hooks/useReading"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import Link from "next/link"

export default function MyPage() {
  const { isAuthenticated, logout } = useAuth()
  const { data: profiles } = useProfiles()
  const { data: history  } = useReadingHistory()

  const profile = profiles?.[0]
  const readings = history?.readings ?? []

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5 pt-5">
        {/* Title */}
        <div className="text-center mb-5 flex items-center gap-2.5 justify-center">
          <span className="text-gold text-sm">✦</span>
          <h1 className="font-serif text-lg tracking-wide text-[#F0F0F8]">マイページ</h1>
          <span className="text-gold text-sm">✦</span>
        </div>

        {/* Profile card */}
        <div className="card mb-3 p-4 flex items-center gap-4"
          style={{ background:"linear-gradient(135deg,rgba(20,25,70,.9),rgba(10,14,40,.9))" }}>
          <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center
                          text-2xl text-gold"
            style={{ background:"rgba(201,165,84,.12)", border:"2px solid rgba(201,165,84,.4)" }}>
            {profile ? "♉" : "✦"}
          </div>
          <div className="flex-1">
            {profile ? (
              <>
                <div className="font-serif text-[17px] text-[#F0F0F8] font-semibold mb-0.5">
                  {profile.display_name}
                </div>
                <div className="text-[11px] text-white/50">{profile.birth_place_name}</div>
              </>
            ) : (
              <div className="text-[13px] text-white/50">プロフィール未設定</div>
            )}
            <Link href="/reading"
              className="text-[12px] text-gold mt-1.5 inline-flex items-center gap-1">
              プロフィールを編集 <span>›</span>
            </Link>
          </div>
        </div>

        {/* Premium badge */}
        <div className="card mb-4 p-3.5 flex items-center justify-between cursor-pointer"
          style={{ border:"1px solid rgba(201,165,84,.4)" }}>
          <div className="flex items-center gap-2">
            <span className="text-gold text-sm">✦</span>
            <span className="font-serif text-[14px] text-gold tracking-wide">プレミアムプラン</span>
          </div>
          <span className="text-white/30 text-sm">✦✦</span>
        </div>

        {/* History */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="text-gold text-sm">✦</span>
          <h2 className="font-serif text-[15px] text-[#F0F0F8]">鑑定履歴</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
          <span className="text-gold text-sm">✦</span>
        </div>

        {readings.length === 0 ? (
          <div className="card p-10 text-center mb-4">
            <div className="text-5xl text-gold/60 mb-4">✦</div>
            <div className="font-serif text-[15px] text-[#F0F0F8] mb-2">
              まだ鑑定履歴がありません
            </div>
            <div className="text-[12px] text-white/50">最初の鑑定を始めてみましょう</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {readings.map(r => (
              <Link key={r.reading_id} href={`/reading/${r.reading_id}`}
                className="card p-3.5 flex items-center gap-3 hover:border-gold/20 transition-colors">
                <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center
                                text-gold text-lg"
                  style={{ background:"rgba(201,165,84,.12)", border:"1px solid rgba(201,165,84,.3)" }}>
                  ✦
                </div>
                <div className="flex-1">
                  <div className="text-[14px] text-[#F0F0F8] font-medium mb-0.5">
                    {r.theme} / 鑑定
                  </div>
                  <div className="text-[11px] text-white/40 flex items-center gap-1">
                    <span>📅</span>
                    <span>{new Date(r.created_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gold">
                  <span className="text-[12px]">結果を見る</span>
                  <span className="text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link href="/reading"
          className="btn-gold flex items-center justify-center gap-2 py-4 text-[15px]">
          <span>✦</span><span>新しい鑑定を行う</span><span className="text-base">›</span>
        </Link>
      </div>
      <BottomNav />
    </div>
  )
}
