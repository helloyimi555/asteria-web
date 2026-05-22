"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import { getSunSign, READING_THEMES, READING_PERIODS } from "@/lib/zodiac"
import { profileApi, readingApi } from "@/lib/api"
import clsx from "clsx"

const YEARS  = Array.from({ length:75 }, (_, i) => 2008 - i)
const MONTHS = Array.from({ length:12 }, (_, i) => i + 1)
const DAYS   = Array.from({ length:31 }, (_, i) => i + 1)

export default function ReadingInputPage() {
  const router  = useRouter()

  const [year,   setYear]   = useState("")
  const [month,  setMonth]  = useState("")
  const [day,    setDay]    = useState("")
  const [time,   setTime]   = useState("")
  const [noTime, setNoTime] = useState(false)
  const [place,  setPlace]  = useState("")
  const [theme,  setTheme]  = useState<string>("general")
  const [period, setPeriod] = useState<string>("half2")
  const [loading,setLoading]= useState(false)
  const [error,  setError]  = useState<string | null>(null)

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
      // プロフィール作成
      const profile = await profileApi.create({
        display_name:       "メイン",
        birth_date:         dateStr,
        birth_time:         (!noTime && time) ? time : undefined,
        birth_time_unknown: noTime,
        birth_place_name:   place,
      })

      // 期間計算
      const now  = new Date()
      const [ps, pe] = getPeriodDates(period, now)

      // 鑑定リクエスト → ポーリング
      const result = await readingApi.pollUntilDone(
        (await readingApi.create({
          profile_id:   profile.id,
          theme:        theme as any,
          period_start: ps,
          period_end:   pe,
        })).reading_id
      )
      router.push(`/reading/${result.reading_id}`)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "エラーが発生しました。もう一度お試しください。")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5">
        {/* Header */}
        <div className="pt-9 pb-5 text-center">
          <div className="font-serif text-[15px] tracking-widest shimmer-gold mb-2">
            ✦ ASTERIA ✦
          </div>
          <h1 className="font-serif text-xl text-[#F0F0F8]">鑑定を行う</h1>
          <p className="text-[12px] text-white/45 mt-1">あなたの情報を入力してください</p>
        </div>

        {/* Sign badge */}
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

        {/* Form */}
        <div className="card p-5 mb-3">
          {/* 生年月日 */}
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

          {/* 出生時刻 */}
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

          {/* 出生地 */}
          <div className="mb-4">
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">
              出生地 *
            </label>
            <input type="text" value={place} placeholder="例：神奈川県横浜市"
              onChange={e => setPlace(e.target.value)} className="input-field" />
          </div>

          {/* テーマ */}
          <div className="mb-4">
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2.5">
              占いたいテーマ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {READING_THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={clsx("p-2.5 rounded-xl text-center transition-all border",
                    theme === t.id
                      ? "border-gold/60 bg-gold/10"
                      : "border-white/10 bg-white/[0.03]")}>
                  <div className="text-[15px] mb-0.5">{t.icon}</div>
                  <div className={clsx("text-[11px]", theme === t.id ? "text-gold font-bold" : "text-white/50")}>
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 期間 */}
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2.5">
              占いたい期間
            </label>
            <div className="grid grid-cols-3 gap-2">
              {READING_PERIODS.map(p => (
                <button key={p.id} onClick={() => setPeriod(p.id)}
                  className={clsx("p-2.5 rounded-xl text-center transition-all border",
                    period === p.id
                      ? "border-white/50 bg-white/10"
                      : "border-white/10 bg-white/[0.03]")}>
                  <div className={clsx("text-[13px]", period === p.id ? "text-[#F0F0F8] font-bold" : "text-white/50")}>
                    {p.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/35
                          text-[12px] text-red-400 flex gap-2 mb-3">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {/* CTA */}
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
  if (periodId === "month") {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return [fmt(now), fmt(end)]
  }
  if (periodId === "half2") {
    return [`${now.getFullYear()}-07-01`, `${now.getFullYear()}-12-31`]
  }
  return [`${now.getFullYear() + 1}-01-01`, `${now.getFullYear() + 1}-12-31`]
}
