"use client"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { getSunSign, READING_THEMES, READING_PERIODS } from "@/lib/zodiac"
import { profileApi, readingApi, guestReadingApi, isLoggedIn } from "@/lib/api"
import clsx from "clsx"

const YEARS  = Array.from({ length:75 }, (_, i) => 2008 - i)
const MONTHS = Array.from({ length:12 }, (_, i) => i + 1)
const DAYS   = Array.from({ length:31 }, (_, i) => i + 1)

const PROFILE_KEY = "asteria_profile"
const GUEST_KEY   = "asteria_guest_used"

export default function ReadingInputPage() {
  const router  = useRouter()

  const [loggedIn, setLoggedIn] = useState(false)
  const [guestUsed, setGuestUsed] = useState(false)
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null)
  const [year,   setYear]   = useState("")
  const [month,  setMonth]  = useState("")
  const [day,    setDay]    = useState("")
  const [time,   setTime]   = useState("")
  const [noTime, setNoTime] = useState(false)
  const [place,  setPlace]  = useState("")
  const [theme,  setTheme]  = useState<string>("general")
  const [period, setPeriod] = useState<string>("week")
  const [loading,setLoading]= useState(false)
  const [error,  setError]  = useState<string | null>(null)

  useEffect(() => {
    const li = isLoggedIn()
    setLoggedIn(li)
    setGuestUsed(!!localStorage.getItem(GUEST_KEY))
    if (li) {
      try {
        const saved = localStorage.getItem(PROFILE_KEY)
        if (saved) {
          const p = JSON.parse(saved)
          setExistingProfileId(p.id)
          const [y, m, d] = (p.birth_date || "").split("-")
          if (y) setYear(y)
          if (m) setMonth(String(parseInt(m)))
          if (d) setDay(String(parseInt(d)))
          if (p.birth_time) setTime(p.birth_time)
          if (p.birth_time_unknown) setNoTime(p.birth_time_unknown)
          if (p.birth_place_name) setPlace(p.birth_place_name)
        }
      } catch {}
    }
  }, [])

  const dateStr = useMemo(() => {
    if (!year || !month || !day) return ""
    return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
  }, [year, month, day])

  const sunSign = useMemo(() => getSunSign(dateStr), [dateStr])
  const ok = !!dateStr && !!place.trim()

  const handleSubmit = async () => {
    if (!ok) return
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const [ps, pe] = getPeriodDates(period, now)

      if (!loggedIn) {
        // ゲスト鑑定
        const result = await guestReadingApi.create({
          birth_date:       dateStr,
          birth_place_name: place,
          theme:            theme,
          period_start:     ps,
          period_end:       pe,
        })
        localStorage.setItem(GUEST_KEY, "1")
        localStorage.setItem("asteria_guest_result", JSON.stringify(result))
        router.push("/reading/guest-result")
      } else {
        let profileId = existingProfileId
        if (!profileId) {
          const profile = await profileApi.create({
            display_name:       "メイン",
            birth_date:         dateStr,
            birth_time:         (!noTime && time) ? time : undefined,
            birth_time_unknown: noTime,
            birth_place_name:   place,
          })
          profileId = profile.id
          localStorage.setItem(PROFILE_KEY, JSON.stringify({
            id: profile.id,
            birth_date: dateStr,
            birth_time: time,
            birth_time_unknown: noTime,
            birth_place_name: place,
          }))
        }

        const result = await readingApi.pollUntilDone(
          (await readingApi.create({
            profile_id:   profileId!,
            theme:        theme as any,
            period_start: ps,
            period_end:   pe,
          })).reading_id
        )
        router.push(`/reading/${result.reading_id}`)
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "エラーが発生しました。もう一度お試しください。")
      setLoading(false)
    }
  }

  // ゲストが既に使用済みの場合
  if (!loggedIn && guestUsed) {
    return (
      <div className="relative min-h-screen pb-24">
        <Stars />
        <div className="relative z-10 max-w-app mx-auto px-5 flex flex-col items-center justify-center min-h-screen text-center">
          <div className="font-serif text-[15px] tracking-widest shimmer-gold mb-6">✦ ASTERIA ✦</div>
          <h2 className="font-serif text-xl text-[#F0F0F8] mb-3">無料体験は1回までです</h2>
          <p className="text-[13px] text-white/50 mb-8 leading-7">
            続けて鑑定するには<br />会員登録（無料）が必要です
          </p>
          <button onClick={() => router.push("/auth/register")}
            className="btn-gold w-full py-4 text-[15px] mb-3">
            無料で会員登録する
          </button>
          <button onClick={() => router.push("/auth/login")}
            className="text-[13px] text-white/40 hover:text-white/70">
            ログインはこちら
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5">
        <div className="pt-9 pb-5 text-center">
          <div className="font-serif text-[15px] tracking-widest shimmer-gold mb-2">
            ✦ ASTERIA ✦
          </div>
          <h1 className="font-serif text-xl text-[#F0F0F8]">鑑定を行う</h1>
          <p className="text-[12px] text-white/45 mt-1">
            {existingProfileId ? "テーマと期間を選んでください" : "あなたの情報を入力してください"}
          </p>
          {!loggedIn && (
            <p className="text-[11px] text-gold/70 mt-1">
              ✦ 無料体験：総合運1回のみ
            </p>
          )}
        </div>

        {sunSign && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background:`${sunSign.color}12`, border:`1px solid ${sunSign.color}30` }}>
              <span style={{ color:sunSign.color }}>{sunSign.symbol}</span>
              <span className="font-serif text-[13px]" style={{ color:sunSign.color }}>
                {sunSign.sign}
              </span>
            </div>
          </div>
        )}

        <div className="card p-5 mb-3">
          {!existingProfileId && (
            <>
              <div className="mb-4">
                <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">
                  生年月日 *
                </label>
                <div className="grid grid-cols-[2fr_1.1fr_1.1fr] gap-2">
                  {[
                    { val:year,  set:setYear,  opts:YEARS,  ph:"年", fmt:(v:number) => `${v}年` },
                    { val:month, set:setMonth, opts:MONTHS, ph:"月", fmt:(v:number) => `${String(v).padStart(2,"0")}月` },
                    { val:day,   set:setDay,   opts:DAYS,   ph:"日", fmt:(v:number) => `${String(v).padStart(2,"0")}日` },
                  ].map(({ val, set, opts, ph, fmt }, i) => (
                    <div key={i} className="relative">
                      <select value={val} onChange={e => set(e.target.value)} className="input-field">
                        <option value="">{ph}</option>
                        {opts.map(o => <option key={o} value={o}>{fmt(o)}</option>)}
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-[11px]">▾</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] text-white/50 tracking-widest uppercase">出生時刻</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-white/50">
                    <input type="checkbox" checked={noTime} onChange={e => setNoTime(e.target.checked)}
                      className="accent-gold w-3 h-3" />
                    時刻不明
                  </label>
                </div>
                <input type="time" value={time} disabled={noTime}
                  onChange={e => setTime(e.target.value)}
                  className={clsx("input-field", noTime && "opacity-40")} />
              </div>

              <div className="mb-4">
                <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">
                  出生地 *
                </label>
                <input type="text" value={place} placeholder="例：神奈川県横浜市"
                  onChange={e => setPlace(e.target.value)} className="input-field" />
              </div>
            </>
          )}

          {existingProfileId && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-white/40 mb-1">登録済みの情報</div>
              <div className="text-[13px] text-white/70">{dateStr} / {place}</div>
            </div>
          )}

          {/* テーマ */}
          <div className="mb-4">
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2.5">
              占いたいテーマ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {READING_THEMES.map(t => {
                const available = loggedIn || t.id === "general"
                return (
                  <button key={t.id}
                    onClick={() => available && setTheme(t.id)}
                    className={clsx("p-2.5 rounded-xl text-center transition-all border relative",
                      !available && "opacity-40 cursor-not-allowed",
                      theme === t.id && available
                        ? "border-gold/60 bg-gold/10"
                        : "border-white/10 bg-white/[0.03]")}>
                    <div className="text-[15px] mb-0.5">{t.icon}</div>
                    <div className={clsx("text-[11px]", theme === t.id && available ? "text-gold font-bold" : "text-white/50")}>
                      {t.label}
                    </div>
                    {!available && (
                      <div className="absolute top-1 right-1 text-[8px] text-gold/60">🔒</div>
                    )}
                  </button>
                )
              })}
            </div>
            {!loggedIn && (
              <p className="text-[11px] text-white/30 mt-2 text-center">
                他のテーマは
                <button onClick={() => router.push("/auth/register")} className="text-gold/70 underline mx-1">
                  会員登録
                </button>
                で利用可能
              </p>
            )}
          </div>

          {/* 期間 */}
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2.5">
              占いたい期間
            </label>
            <div className="grid grid-cols-3 gap-2">
              {READING_PERIODS.map(p => {
                const available = loggedIn || ["today", "tomorrow", "week"].includes(p.id)
                return (
                  <button key={p.id}
                    onClick={() => available && setPeriod(p.id)}
                    className={clsx("p-2.5 rounded-xl text-center transition-all border relative",
                      !available && "opacity-40 cursor-not-allowed",
                      period === p.id && available
                        ? "border-white/50 bg-white/10"
                        : "border-white/10 bg-white/[0.03]")}>
                    <div className={clsx("text-[13px]", period === p.id && available ? "text-[#F0F0F8] font-bold" : "text-white/50")}>
                      {p.label}
                    </div>
                    {!available && (
                      <div className="absolute top-1 right-1 text-[8px] text-gold/60">🔒</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/35
                          text-[12px] text-red-400 flex gap-2 mb-3">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!ok || loading}
          className="btn-gold w-full py-3.5 text-[15px]">
          {loading ? "鑑定中..." : "✦ 鑑定を開始する ✦"}
        </button>

        <p className="text-center text-[11px] text-white/30 mt-2.5 flex items-center justify-center gap-1">
          <span>🔒</span><span>出生情報は暗号化して保存されます</span>
        </p>
      </div>
      <BottomNav />
    </div>
  )
}

function getPeriodDates(periodId: string, now: Date): [string, string] {
  const fmt = (d: Date) => d.toISOString().split("T")[0]
  if (periodId === "today") {
    return [fmt(now), fmt(now)]
  }
  if (periodId === "tomorrow") {
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    return [fmt(tomorrow), fmt(tomorrow)]
  }
  if (periodId === "week") {
    const end = new Date(now)
    end.setDate(now.getDate() + 6)
    return [fmt(now), fmt(end)]
  }
  if (periodId === "month") {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return [fmt(now), fmt(end)]
  }
  if (periodId === "half2") {
    return [`${now.getFullYear()}-07-01`, `${now.getFullYear()}-12-31`]
  }
  return [`${now.getFullYear() + 1}-01-01`, `${now.getFullYear() + 1}-12-31`]
}