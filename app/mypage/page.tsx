"use client"
import { useState, useEffect, useRef } from "react"
import { mutate as globalMutate } from "swr"
import { useAuth } from "@/lib/auth-context"
import { useProfiles, useReadingHistory } from "@/hooks/useReading"
import { profileApi } from "@/lib/api"
import { Stars } from "@/components/ui/Stars"
import AstrologyLoading from "@/components/ui/AstrologyLoading"
import { BottomNav } from "@/components/layout/BottomNav"
import { XShareButton } from "@/components/ui/XShareButton"
import Link from "next/link"
import {
  calcElementBalance, elementPercents, getElementTitle, ELEMENTS, ELEMENT_INFO,
} from "@/lib/elements"
import { ReadingHistoryCard } from "@/components/ui/ReadingHistoryCard"
import { PremiumCard } from "@/components/asteria-ui"
import { getSunSign } from "@/lib/zodiac"

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
  const [natalPositions, setNatalPositions] = useState<Array<{ planet: string; sign: string }>>([])

  const profile = localProfile ?? profiles?.[0]
  // ハンドラ closure が古い profile を掴まないよう、最新値を ref に常に同期する
  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])

  // 直近5件表示用に6件取得（6件目の有無で「すべて見る」リンクの表示を判定）
  const { data: history } = useReadingHistory(profile?.id, 6)
  const allReadings = Array.isArray(history) ? history : history?.readings ?? []
  const readings = allReadings.slice(0, 5)
  const hasMore = allReadings.length > 5

  // プロフィールがあればネイタルチャートを取得（エレメントバランス算出用）
  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false
    profileApi.getNatalChart(profile.id)
      .then(chart => {
        if (cancelled) return
        const planets = (chart.planets ?? []).map((p: any) => ({ planet: p.planet, sign: p.sign }))
        setNatalPositions(planets)
      })
      .catch(() => { /* graceful: バランス表示なし */ })
    return () => { cancelled = true }
  }, [profile?.id])

  const elementBalance = natalPositions.length > 0 ? calcElementBalance(natalPositions) : null
  const elementPct     = elementBalance ? elementPercents(elementBalance) : null
  const elementTitle   = elementBalance ? getElementTitle(elementBalance) : ""

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

  useEffect(() => {
    if (profiles?.[0]) {
      const p = profiles[0] as any
      const existing = localStorage.getItem("asteria_profile")
      const parsed = existing ? JSON.parse(existing) : {}
      // API レスポンスに null/undefined が混ざってもローカル既存値を保持する
      localStorage.setItem("asteria_profile", JSON.stringify({
        ...parsed,
        id:               p.id ?? parsed.id,
        display_name:     p.display_name ?? parsed.display_name,
        birth_date:       p.birth_date ?? parsed.birth_date,
        birth_time:       p.birth_time ?? parsed.birth_time,
        birth_place_name: p.birth_place_name ?? parsed.birth_place_name,
        birth_timezone:   p.birth_timezone ?? parsed.birth_timezone,
        mbti_type:        p.mbti_type ?? parsed.mbti_type,
      }))
    }
  }, [profiles])

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
    try {
      let savedId: string | undefined = profile?.id

      if (savedId) {
        // 既存プロフィール更新
        await profileApi.update(savedId, {
          birth_date:       formattedDate || undefined,
          birth_time:       editForm.time || undefined,
          birth_place_name: editForm.place || undefined,
          mbti_type:        editForm.mbti || null,
        })
      } else {
        // プロフィール未作成 → バックエンドに新規作成
        const created = await profileApi.create({
          display_name:       "メイン",
          birth_date:         formattedDate,
          birth_time:         editForm.time || undefined,
          birth_time_unknown: !editForm.time,
          birth_place_name:   editForm.place,
          mbti_type:          editForm.mbti || null,
        })
        savedId = created.id
      }

      setMbtiType(editForm.mbti || "")

      const updatedProfile = {
        ...profile,
        id:               savedId,
        birth_date:       formattedDate,
        birth_time:       editForm.time,
        birth_place_name: editForm.place,
        mbti_type:        editForm.mbti || null,
      }
      localStorage.setItem("asteria_profile", JSON.stringify(updatedProfile))
      setLocalProfile(updatedProfile)
      setIsEditingProfile(false)

      // SWR の profiles キャッシュを再取得（他コンポーネントが最新を見られるように）
      await globalMutate("profiles")
    } catch (error) {
      console.error("Failed to save profile", error)
      alert("プロフィールの保存に失敗しました。出生地が見つからない可能性があります。")
    }
  }

  const handleEditFormChange = (key: string, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value }))
  }

  const handleFetchPersonality = async () => {
    // ref から最新 profile を取得（closure 経由だと初回クリック時に
    // 非同期で読み込まれた localStorage / SWR の値を取り逃す可能性がある）
    const current = profileRef.current
    if (!current?.id || !current?.birth_date) {
      // disabled 条件で UI 上は防いでいるが、ハイドレーション直後の極短時間や
      // キーボード操作等で抜けた場合のサイレントガード
      return
    }
    setLoadingPersonality(true)
    try {
      const data = await profileApi.getPersonality(current.id, current.mbti_type || undefined)
      setPersonalityResult(data)
    } catch (error: any) {
      console.error("Personality fetch failed:", error)
      const detail = error?.response?.data?.detail
      alert(detail ?? "性格分析の取得に失敗しました。時間をおいて再度お試しください。")
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
      <div className="relative z-10 max-w-app md:max-w-2xl mx-auto px-5 pt-5">
        {/* Title */}
        <div className="text-center mb-5 flex items-center gap-2.5 justify-center">
          <span className="text-gold text-sm">✦</span>
          <h1 className="font-serif text-2xl tracking-wide text-[#F0F0F8]">マイページ</h1>
          <span className="text-gold text-sm">✦</span>
        </div>

        {/* Profile card【案2】：バナー背景画像を再利用したヒーローバナー型プロフィール */}
        {(() => {
          const sunSign = profile?.birth_date ? getSunSign(profile.birth_date) : null
          const isPremium = (profile as any)?.is_premium === true
          return (
            <div
              className="relative mb-3 w-full overflow-hidden aspect-[1774/887] md:aspect-[1983/536] bg-[url('/asteria/assets/premium-banner-bg-mobile.png')] md:bg-[url('/asteria/assets/premium-banner-bg.png')] bg-cover bg-center bg-no-repeat"
            >
              {/* Premium バッジ（バナー枠の内側に被らないよう少し内側に） */}
              {isPremium && (
                <div
                  className="absolute right-[7%] top-[8%] z-10 inline-flex items-center gap-1 rounded-full border border-[#C9A554]/45 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em]"
                  style={{
                    background: "linear-gradient(135deg, rgba(201,165,84,0.28), rgba(231,208,138,0.12))",
                    color: "#E7D08A",
                    boxShadow: "0 0 14px rgba(201,165,84,0.32)",
                  }}
                >
                  <span className="text-[10px]">👑</span>
                  <span>PREMIUM</span>
                </div>
              )}

              {/* コンテンツ：メダリオン（左）＋ テキスト（右）。バナーのゴールド枠の内側に収める */}
              <div className="absolute inset-0 flex items-center gap-3 px-[7%] md:gap-6 md:px-[6%]">
                {/* メダリオン：高さは枠内に収まるよう % で指定。星雲背景に重なって幻想的に */}
                <div className="relative aspect-square h-[64%] shrink-0 md:h-[78%]">
                  <img
                    src={`/asteria/assets/${sunSign ? sunSign.en.toLowerCase() : "zodiac-medallion"}.png`}
                    alt={sunSign ? `${sunSign.sign} のメダリオン` : ""}
                    aria-hidden={!sunSign}
                    className="pointer-events-none h-full w-full object-contain drop-shadow-[0_0_22px_rgba(201,165,84,0.6)]"
                  />
                </div>

                {/* テキスト情報（中央寄せ、暗部の上に重ねる） */}
                <div className="relative z-10 min-w-0 flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center gap-2 text-[#E7D08A] md:justify-start">
                    <span className="text-[8px] md:text-[10px]">✦</span>
                    <span className="font-serif text-[10px] tracking-[0.3em] md:text-[11px] md:tracking-[0.34em]">MY ASTERIA</span>
                    <span className="text-[8px] md:text-[10px]">✦</span>
                  </div>

                  {sunSign ? (
                    <>
                      <h2
                        className="mt-1.5 whitespace-nowrap font-serif text-[clamp(18px,5.6vw,26px)] font-semibold leading-tight text-[#F7E9B5] md:mt-2 md:text-[28px]"
                        style={{ textShadow: "0 0 20px rgba(201,165,84,0.55), 0 0 8px rgba(201,165,84,0.35)" }}
                      >
                        {sunSign.sign}
                        {profile?.mbti_type && (
                          <span className="ml-2 text-[clamp(14px,4.4vw,20px)] font-normal text-[#C9A554]/90 md:text-[22px]">
                            × {profile.mbti_type}
                          </span>
                        )}
                      </h2>
                      <p className="mt-1 truncate font-serif text-[11px] tracking-[0.06em] text-[#F7F3E7]/75 md:mt-1.5 md:text-[13px]">
                        出生地：{abbreviatedPlace || "—"}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 font-serif text-[14px] text-[#F7F3E7]/70">プロフィール未設定</p>
                  )}

                  <button
                    type="button"
                    onClick={openProfileEdit}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#C9A554]/90 transition-colors hover:text-[#C9A554] md:mt-3 md:text-[12px]"
                  >
                    プロフィールを編集 <span>›</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

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

        {/* 案2: プロフィールカード自体がバナー背景を使うのでプレミアム誘導バナーは非表示 */}
        {/* <div className="mb-4">
          <PremiumCard onClick={() => alert("プレミアムプランは近日公開予定です。")} />
        </div> */}

        {/* Personality */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="text-gold text-sm">✦</span>
          <h2 className="font-serif text-[15px] text-[#F0F0F8]">星の性格分析</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
          <span className="text-gold text-sm">✦</span>
        </div>

        {elementPct && (
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-gold text-xs">✦</span>
                <span className="text-[12px] font-bold text-[#F0F0F8]">星の四元素バランス</span>
              </div>
              <span className="font-serif text-[12px] text-gold">{elementTitle}</span>
            </div>
            <div className="space-y-2">
              {ELEMENTS.map(el => (
                <div key={el} className="flex items-center gap-2">
                  <span className="text-[11px] w-16 shrink-0" style={{ color: ELEMENT_INFO[el].color }}>
                    {ELEMENT_INFO[el].ja}（{ELEMENT_INFO[el].desc.split("・")[0]}）
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-white/[.08] overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${elementPct[el]}%`, background: ELEMENT_INFO[el].color }} />
                  </div>
                  <span className="text-[10px] text-white/55 w-10 text-right tabular-nums">{elementPct[el]}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-4 mb-4">
          {profile?.mbti_type && (
            <div className="text-[11px] text-white/50 mb-3">
              MBTIタイプ：<span className="text-gold/85 font-medium tracking-wider">{profile.mbti_type}</span>
              <span className="text-white/30 ml-2">（プロフィール編集で変更可）</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleFetchPersonality}
            disabled={!profile?.id || !profile?.birth_date || loadingPersonality}
            className="btn-gold w-full py-3.5 text-[15px] mb-4"
          >
            {loadingPersonality ? "分析中..." : profile?.mbti_type ? "✦ 星とMBTIで読むあなたの性格分析" : "✦ あなたの星の性格分析"}
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
              {profile?.mbti_type && personalityResult.mbti_insight && (
                <div>
                  <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">
                    MBTIが示す行動パターン
                  </div>
                  <div className="text-[14px] text-[#F0F0F8] leading-6">
                    {personalityResult.mbti_insight}
                  </div>
                </div>
              )}
              {profile?.mbti_type && personalityResult.combined && (
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
              {personalityResult.type_name && (
                <div className="pt-2">
                  <XShareButton
                    text={`✦ 私は「${personalityResult.type_name}」タイプ。#ASTERIA #占星術`}
                  />
                </div>
              )}
            </div>
          )}
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
              <ReadingHistoryCard key={r.reading_id} reading={r} />
            ))}
            {hasMore && (
              <Link href="/reading/results"
                className="text-center text-[12px] text-gold/70 hover:text-gold transition-colors py-2">
                すべての鑑定履歴を見る →
              </Link>
            )}
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

/** プロフィールカード下段の小さな統計ブロック（太陽星座／月星座／MBTI） */
function StatBlock({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3.5 text-center backdrop-blur-sm">
      <div
        className="text-[18px] leading-none text-[#C9A554]"
        style={{ textShadow: "0 0 10px rgba(201,165,84,0.5)" }}
      >
        {icon}
      </div>
      <div className="mt-1.5 text-[10px] tracking-wider text-white/55">{label}</div>
      <div className="my-1.5 mx-auto h-px w-6 bg-[#C9A554]/30" />
      <div className="font-serif text-[14px] text-[#C9A554]">{value}</div>
    </div>
  )
}