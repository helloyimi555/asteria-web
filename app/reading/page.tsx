"use client"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import AstrologyLoading from "@/components/ui/AstrologyLoading"
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
  const [useExisting, setUseExisting] = useState(true)
  const [year,   setYear]   = useState("")
  const [month,  setMonth]  = useState("")
  const [day,    setDay]    = useState("")
  const [time,   setTime]   = useState("")
  const [noTime, setNoTime] = useState(false)
  const [place,  setPlace]  = useState("")
  const [theme,  setTheme]  = useState<string>("general")
  const [period, setPeriod] = useState<string>("week")
  const [mbti,   setMbti]   = useState<string>("")
  const [loading,setLoading]= useState(false)
  const [error,  setError]  = useState<string | null>(null)

  // 別の人を占う用のフォーム状態
  const [otherYear,  setOtherYear]  = useState("")
  const [otherMonth, setOtherMonth] = useState("")
  const [otherDay,   setOtherDay]   = useState("")
  const [otherTime,  setOtherTime]  = useState("")
  const [otherNoTime,setOtherNoTime]= useState(false)
  const [otherPlace, setOtherPlace] = useState("")
  const [otherMbti,  setOtherMbti]  = useState("")

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
          if (p.mbti_type) setMbti(p.mbti_type)
        }
      } catch {}
    }
  }, [])

  const actualUseExisting = Boolean(existingProfileId && useExisting)

  const activeDateStr = useMemo(() => {
    const y = actualUseExisting ? year : otherYear
    const m = actualUseExisting ? month : otherMonth
    const d = actualUseExisting ? day : otherDay
    if (!y || !m || !d) return ""
    return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`
  }, [actualUseExisting, year, month, day, otherYear, otherMonth, otherDay])

  const dateStr = useMemo(() => {
    if (!year || !month || !day) return ""
    return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
  }, [year, month, day])

  const sunSign = useMemo(() => getSunSign(activeDateStr), [activeDateStr])
  const activeTime  = actualUseExisting ? time  : otherTime
  const activePlace = actualUseExisting ? place : otherPlace

  // 出生時刻なしの境界日（前日 or 翌日と星座が違う）に隣接サインを返す
  const boundarySigns = useMemo(() => {
    if (!activeDateStr || activeTime) return null
    const [y, m, d] = activeDateStr.split("-").map(Number)
    if (!y || !m || !d) return null
    const toStr = (dt: Date) =>
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
    const cur  = new Date(y, m - 1, d)
    const prev = new Date(cur); prev.setDate(prev.getDate() - 1)
    const next = new Date(cur); next.setDate(next.getDate() + 1)
    const curSign  = getSunSign(activeDateStr)
    const prevSign = getSunSign(toStr(prev))
    const nextSign = getSunSign(toStr(next))
    if (!curSign) return null
    if (prevSign && prevSign.sign !== curSign.sign) return [prevSign, curSign]
    if (nextSign && nextSign.sign !== curSign.sign) return [curSign, nextSign]
    return null
  }, [activeDateStr, activeTime])
  const ok = actualUseExisting
    // 既存プロフィールで鑑定する場合: profile_id がバックエンドに送られ、出生地/日付は DB から取得される。
    // FE で必須にすべきは「プロフィールが存在すること」のみ（保険として activeDateStr もチェック）
    ? (!!existingProfileId && !!activeDateStr)
    // 新規プロフィール / 別の人を占う場合: 出生地は任意（空なら handleSubmit 内で「東京都」をデフォルト）
    : (!!otherYear && !!otherMonth && !!otherDay)

  // DEBUG: ボタンが押せない場合の原因切り分け用
  if (typeof window !== "undefined") {
    console.log("ok debug:", {
      existingProfileId,
      activeDateStr,
      actualUseExisting,
      useExisting,
      year, month, day,
      otherYear, otherMonth, otherDay,
      otherPlace,
      activeTime,
      loading,
      ok,
    })
  }

  const handleSubmit = async () => {
    if (!ok) return
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const [ps, pe] = getPeriodDates(period, now)

      // 出生地が空の場合は東京都をデフォルト値として使用
      const effectivePlace = activePlace.trim() || "東京都"

      if (!loggedIn) {
        const result = await guestReadingApi.create({
          birth_date:       activeDateStr,
          birth_place_name: effectivePlace,
          theme:            theme,
          period_start:     ps,
          period_end:       pe,
          mbti_type:        (useExisting ? mbti : otherMbti) || undefined,
        })
        localStorage.setItem(GUEST_KEY, "1")
        localStorage.setItem("asteria_guest_result", JSON.stringify(result))
        router.push("/reading/guest-result")
      } else {
        if (useExisting && existingProfileId) {
          // 自分のプロフィールで鑑定
          const result = await readingApi.pollUntilDone(
            (await readingApi.create({
              profile_id:   existingProfileId,
              theme:        theme as any,
              period_start: ps,
              period_end:   pe,
              mbti_type:    mbti || undefined,
            })).reading_id
          )
          router.push(`/reading/${result.reading_id}`)
        } else {
          // 別の人 or プロフィール未登録
          const profile = await profileApi.create({
            display_name:       "メイン",
            birth_date:         activeDateStr,
            birth_time:         (!(useExisting ? otherNoTime : noTime) && (useExisting ? otherTime : time)) ? (useExisting ? otherTime : time) : null,
            birth_time_unknown: (useExisting ? otherNoTime : noTime) || !(useExisting ? otherTime : time),
            birth_place_name:   effectivePlace,
          })
          if (!existingProfileId) {
            localStorage.setItem(PROFILE_KEY, JSON.stringify({
              id: profile.id,
              birth_date: activeDateStr,
              birth_time: useExisting ? otherTime : time,
              birth_time_unknown: useExisting ? otherNoTime : noTime,
              birth_place_name: effectivePlace,
            }))
          } else {
            // 既存のプロフィールがある場合は、別の人を占う際に保存済みプロフィールを上書きしない
          }
          const result = await readingApi.pollUntilDone(
            (await readingApi.create({
              profile_id:   profile.id,
              theme:        theme as any,
              period_start: ps,
              period_end:   pe,
              mbti_type:    (useExisting ? mbti : otherMbti) || undefined,
            })).reading_id
          )
          router.push(`/reading/${result.reading_id}`)
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "エラーが発生しました。もう一度お試しください。")
      setLoading(false)
    }
  }

  if (loading) {
    return <AstrologyLoading message="星図を読み解いています..." subMessage="あなたの天体配置から、今の運勢を紡いでいます" />
  }

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
            テーマと期間を選んでください
          </p>
          {!loggedIn && (
            <p className="text-[11px] text-gold/70 mt-1">
              ✦ 無料体験：総合運1回のみ
            </p>
          )}
        </div>

        {sunSign && (
          <div className="flex flex-col items-center mb-4">
            {boundarySigns ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{ background:`${sunSign.color}10`, border:`1px solid ${sunSign.color}30` }}>
                <span style={{ color: boundarySigns[0].color, fontSize:18 }}>{boundarySigns[0].symbol}</span>
                <span className="text-white/35 text-[12px]">/</span>
                <span style={{ color: boundarySigns[1].color, fontSize:18 }}>{boundarySigns[1].symbol}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{ background:`${sunSign.color}12`, border:`1px solid ${sunSign.color}30` }}>
                <span style={{ color:sunSign.color }}>{sunSign.symbol}</span>
                <span className="font-serif text-[13px]" style={{ color:sunSign.color }}>
                  {sunSign.sign}
                </span>
              </div>
            )}
            {boundarySigns && (
              <p className="mt-1.5 text-[10px] text-white/45 tracking-wider">時刻入力で確定</p>
            )}
          </div>
        )}

        <div className="card p-5 mb-3">

          {/* 自分 / 別の人 トグル */}
          {existingProfileId && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUseExisting(true)}
                className={clsx("flex-1 py-2 rounded-xl text-[12px] border transition-all",
                  useExisting ? "border-gold/60 bg-gold/10 text-gold" : "border-white/10 text-white/40")}>
                自分を占う
              </button>
              <button
                onClick={() => setUseExisting(false)}
                className={clsx("flex-1 py-2 rounded-xl text-[12px] border transition-all",
                  !useExisting ? "border-gold/60 bg-gold/10 text-gold" : "border-white/10 text-white/40")}>
                別の人を占う
              </button>
            </div>
          )}

          {/* 自分のプロフィール表示 */}
          {existingProfileId && useExisting && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-white/40 mb-1">登録済みの情報</div>
              <div className="text-[13px] text-white/70">{dateStr} / {place}</div>
            </div>
          )}

          {/* 別の人 or プロフィール未登録のフォーム */}
          {(!existingProfileId || !useExisting) && (
            <>
              <div className="mb-4">
                <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">
                  生年月日 *
                </label>
                <div className="grid grid-cols-[2fr_1.1fr_1.1fr] gap-2">
                  {[
                    { val:otherYear,  set:setOtherYear,  opts:YEARS,  ph:"年", fmt:(v:number) => `${v}年` },
                    { val:otherMonth, set:setOtherMonth, opts:MONTHS, ph:"月", fmt:(v:number) => `${String(v).padStart(2,"0")}月` },
                    { val:otherDay,   set:setOtherDay,   opts:DAYS,   ph:"日", fmt:(v:number) => `${String(v).padStart(2,"0")}日` },
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
                    <input type="checkbox" checked={otherNoTime} onChange={e => setOtherNoTime(e.target.checked)}
                      className="accent-gold w-3 h-3" />
                    時刻不明
                  </label>
                </div>
                <input type="time" value={otherTime} disabled={otherNoTime}
                  onChange={e => setOtherTime(e.target.value)}
                  className={clsx("input-field", otherNoTime && "opacity-40")} />
              </div>

              <div className="mb-4">
                <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">
                  出生地（任意）
                </label>
                <input type="text" value={otherPlace} placeholder="例：神奈川県横浜市"
                  onChange={e => setOtherPlace(e.target.value)} className="input-field" />
              </div>
            </>
          )}

          {/* MBTI */}
          <div className="mb-4">
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2.5">
              MBTIタイプ（任意・入力すると鑑定精度が上がります）
            </label>
            <select
              value={useExisting ? mbti : otherMbti}
              onChange={e => useExisting ? setMbti(e.target.value) : setOtherMbti(e.target.value)}
              className="input-field">
              <option value="">選択してください</option>
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