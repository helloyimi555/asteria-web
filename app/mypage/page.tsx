"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useProfiles, useReadingHistory } from "@/hooks/useReading"
import { profileApi } from "@/lib/api"
import { Stars } from "@/components/ui/Stars"
import AstrologyLoading from "@/components/ui/AstrologyLoading"
import { BottomNav } from "@/components/layout/BottomNav"
import Link from "next/link"

const YEARS = Array.from({ length: 75 }, (_, i) => 2008 - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export default function MyPage() {
  const { isAuthenticated, logout } = useAuth()
  const { data: profiles } = useProfiles()
  const [personalityResult, setPersonalityResult] = useState<any | null>(null)
  const [loadingPersonality, setLoadingPersonality] = useState(false)
  const [mbtiType, setMbtiType] = useState<string>("")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [localProfile, setLocalProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState({ year: "", month: "", day: "", time: "", place: "", mbti: "" })

  const profile = localProfile ?? profiles?.[0]
  const { data: history } = useReadingHistory(profile?.id)
  const readings = Array.isArray(history) ? history : history?.readings ?? []

  useEffect(() => {
    if (!profile) return
    if (profile.mbti_type) {
      setMbtiType(profile.mbti_type)
    }
  }, [profile?.id, profile?.mbti_type])

  useEffect(() => {
    const saved = localStorage.getItem("asteria_profile")
    if (saved) {
      try {
        setLocalProfile(JSON.parse(saved))
      } catch {
        // ignore invalid saved data
      }
    }
  }, [])

  const abbreviatedPlace = profile ? (() => {
    const parts = (profile.birth_place_name || "").split(",").map(p => p.trim()).filter(Boolean)
    while (parts.length > 0) {
      const last = parts[parts.length - 1]
      if (last === "日本" || /^\d{3}-\d{4}$/.test(last) || /\d/.test(last)) {
        parts.pop()
      } else {
        break
      }
    }
    return parts.slice(-2).join(", ")
  })() : ""

  const getBirthDateParts = (value: string | undefined) => {
    if (!value) return { year: "", month: "", day: "" }
    const [year, month, day] = value.split("-")
    return {
      year: year ?? "",
      month: month ? String(Number(month)) : "",
      day: day ? String(Number(day)) : "",
    }
  }

  const openProfileEdit = () => {
    const birthDate = profile?.birth_date || profile?.birthDate || ""
    const { year, month, day } = getBirthDateParts(birthDate)
    setEditForm({
      year,
      month,
      day,
      time: profile?.birth_time || profile?.birthTime || "",
      place: profile?.birth_place_name || profile?.birthPlaceName || "",
      mbti: profile?.mbti_type || "",
    })
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
  }

  const handleSaveProfile = async () => {
    // Validation: require birth date and place
    if (!(editForm.year && editForm.month && editForm.day && editForm.place && editForm.place.trim())) {
      alert("生年月日と出生地を入力してください")
      return
    }

    const formattedDate = `${editForm.year}-${String(editForm.month).padStart(2, "0")}-${String(editForm.day).padStart(2, "0")}`
    const updatedProfile = {
      ...profile,
      birth_date: formattedDate,
      birth_time: editForm.time,
      birth_place_name: editForm.place,
      mbti_type: editForm.mbti || null,
    }
    try {
      if (profile?.id) {
        await profileApi.update(profile.id, { mbti_type: editForm.mbti || null })
        setMbtiType(editForm.mbti || "")
      }
      localStorage.setItem("asteria_profile", JSON.stringify(updatedProfile))
      setLocalProfile(updatedProfile)
      setIsEditingProfile(false)
    } catch (error) {
      console.error("Failed to save profile", error)
    }
  }

  const handleEditFormChange = (key: string, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value }))
  }

  const handleFetchPersonality = async () => {
    if (!profile) return
    if (!profile.birth_date) {
      alert("生年月日を登録してから性格分析を行ってください")
      return
    }
    setLoadingPersonality(true)
    try {
      if (profile.id) {
        await profileApi.update(profile.id, { mbti_type: mbtiType ?? null })
      }
      const data = await profileApi.getPersonality(profile.id, mbtiType || undefined)
      setPersonalityResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingPersonality(false)
    }
  }

  if (loadingPersonality) {
    return (
      <AstrologyLoading
        message="星の配置を読み解いています..."
        subMessage="あなたの本質的な才能と課題を紡いでいます"
      />
    )
  }

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
                <div className="text-[11px] text-white/50">{abbreviatedPlace}</div>
              </>
            ) : (
              <div className="text-[13px] text-white/50">プロフィール未設定</div>
            )}
            <button type="button" onClick={openProfileEdit}
              className="text-[12px] text-gold mt-1.5 inline-flex items-center gap-1">
              プロフィールを編集 <span>›</span>
            </button>
          </div>
        </div>

        {isEditingProfile && (
          <div className="card mb-3 p-4" style={{ border:"1px solid rgba(201,165,84,.25)" }}>
            <div className="mb-4">
              <div className="text-[12px] text-gold font-semibold mb-2">プロフィールを編集</div>
              <div className="grid gap-3">
                <div>
                  <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">生年月日</label>
                  <div className="grid grid-cols-[2fr_1.1fr_1.1fr] gap-2">
                    <select value={editForm.year} onChange={e => handleEditFormChange("year", e.target.value)} className="input-field">
                      <option value="">年</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select value={editForm.month} onChange={e => handleEditFormChange("month", e.target.value)} className="input-field">
                      <option value="">月</option>
                      {MONTHS.map(m => <option key={m} value={m}>{String(m).padStart(2, "0")}月</option>)}
                    </select>
                    <select value={editForm.day} onChange={e => handleEditFormChange("day", e.target.value)} className="input-field">
                      <option value="">日</option>
                      {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2, "0")}日</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">出生時刻</label>
                  <input type="time" value={editForm.time} onChange={e => handleEditFormChange("time", e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">出生地</label>
                  <input type="text" value={editForm.place} onChange={e => handleEditFormChange("place", e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">MBTIタイプ（任意）</label>
                  <select value={editForm.mbti ?? ""} onChange={e => handleEditFormChange("mbti", e.target.value)} className="input-field w-full">
                    <option value="">選択しない</option>
                    {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleSaveProfile} className="btn-gold flex-1 py-3 text-[14px]">保存する</button>
              <button type="button" onClick={handleCancelEdit} className="btn-gold-outline flex-1 py-3 text-[14px]">キャンセル</button>
            </div>
          </div>
        )}

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

        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="text-gold text-sm">✦</span>
          <h2 className="font-serif text-[15px] text-[#F0F0F8]">星の性格分析</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
          <span className="text-gold text-sm">✦</span>
        </div>

        <div className="card p-4 mb-4">
          <div className="mb-4">
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">
              MBTIタイプ（任意）
            </label>
            <select value={mbtiType} onChange={e => setMbtiType(e.target.value)} className="input-field w-full">
              <option value="">選択しない</option>
              {[
                "INTJ", "INTP", "ENTJ", "ENTP",
                "INFJ", "INFP", "ENFJ", "ENFP",
                "ISTJ", "ISFJ", "ESTJ", "ESFJ",
                "ISTP", "ISFP", "ESTP", "ESFP",
              ].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleFetchPersonality}
            disabled={!profile || loadingPersonality}
            className="btn-gold w-full py-3.5 text-[15px] mb-4"
          >
            {loadingPersonality ? "分析中..." : mbtiType ? "✦ 星とMBTIで読むあなたの性格分析" : "✦ あなたの星の性格分析"}
          </button>

          {personalityResult && (
            <div className="space-y-4">
              {personalityResult.type_name && (
                <div className="font-serif text-center text-gold text-[17px] mb-4">
                  あなたは「{personalityResult.type_name}」タイプです
                </div>
              )}
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                  星が示す本質
                </div>
                <div className="text-[14px] text-[#F0F0F8] leading-6">
                  {personalityResult.personality}
                </div>
              </div>
              {mbtiType && personalityResult.mbti_insight && (
                <div>
                  <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                    MBTIが示す行動パターン
                  </div>
                  <div className="text-[14px] text-[#F0F0F8] leading-6">
                    {personalityResult.mbti_insight}
                  </div>
                </div>
              )}
              {mbtiType && personalityResult.combined && (
                <div>
                  <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                    星×MBTIの総合
                  </div>
                  <div className="text-[14px] text-[#F0F0F8] leading-6">
                    {personalityResult.combined}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                  強み
                </div>
                <div className="flex flex-wrap gap-2">
                  {(personalityResult.strengths ?? []).map((item: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[12px]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                  課題
                </div>
                <div className="flex flex-wrap gap-2">
                  {(personalityResult.challenges ?? []).map((item: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-white/5 text-white/75 text-[12px]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                  人生のテーマ
                </div>
                <div className="text-[14px] text-[#F0F0F8] leading-6">
                  {personalityResult.life_theme}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                  仕事・才能
                </div>
                <div className="text-[14px] text-[#F0F0F8] leading-6">
                  {personalityResult.career}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                  対人関係・恋愛
                </div>
                <div className="text-[14px] text-[#F0F0F8] leading-6">
                  {personalityResult.relationships}
                </div>
              </div>
            </div>
          )}
        </div>

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