"use client"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import AstrologyLoading from "@/components/ui/AstrologyLoading"
import { BottomNav } from "@/components/layout/BottomNav"
import { HintBox } from "@/components/ui/HintBox"
import { getSunSign } from "@/lib/zodiac"
import clsx from "clsx"
import { compatApi, isLoggedIn } from "@/lib/api"

const YEARS  = Array.from({ length:75 }, (_, i) => 2008 - i)
const MONTHS = Array.from({ length:12 }, (_, i) => i + 1)
const DAYS   = Array.from({ length:31 }, (_, i) => i + 1)

const REL_TYPES = [
  { id:"partner", label:"恋人・パートナー", icon:"♡" },
  { id:"friend",  label:"友人・知人",       icon:"✿" },
  { id:"work",    label:"仕事・同僚",       icon:"⬡" },
]

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
]

function PersonPanel({ title, form, setForm, sign, mbti, setMbti }) {
  const update = (k, v) => setForm({ ...form, [k]: v })
  return (
    <div className="card p-4" style={{ border:"1px solid rgba(201,165,84,.25)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gold">✦</span>
        {sign && <span style={{ color:sign.color }}>{sign.symbol}</span>}
        <span className="font-serif text-[14px] text-gold font-semibold">{title}</span>
      </div>
      <div className="mb-3">
        <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">生年月日 *</label>
        <div className="grid grid-cols-[2fr_1.1fr_1.1fr] gap-2">
          {[{k:"year",opts:YEARS,ph:"年",fmt:v=>`${v}年`},{k:"month",opts:MONTHS,ph:"月",fmt:v=>`${String(v).padStart(2,"0")}月`},{k:"day",opts:DAYS,ph:"日",fmt:v=>`${String(v).padStart(2,"0")}日`}].map(({k,opts,ph,fmt})=>(
            <div key={k} className="relative min-w-0">
              <select value={form[k]} onChange={e=>update(k,e.target.value)} className="input-field max-w-full truncate">
                <option value="">{ph}</option>
                {opts.map(o=><option key={o} value={o}>{fmt(o)}</option>)}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-[10px]">▾</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">出生時刻</label>
        <input type="time" value={form.time} onChange={e=>update("time",e.target.value)} className="input-field w-full max-w-full" />
      </div>
      <div>
        <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">出生地（任意）</label>
        <input type="text" value={form.place} placeholder={title.includes("あなた")?"東京都":"大阪府"}
          onChange={e=>update("place",e.target.value)} className="input-field w-full max-w-full overflow-hidden truncate" />
      </div>
      <div className="mt-3">
        <label className="text-[11px] text-white/50 tracking-widest uppercase block mb-2">MBTIタイプ（任意）</label>
        <select value={mbti ?? ""} onChange={e => setMbti?.(e.target.value)} className="input-field w-full max-w-full">
          <option value="">選択しない</option>
          {MBTI_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function CompatInputPage() {
  const router = useRouter()
  const [myForm,      setMyForm]      = useState({ year:"",month:"",day:"",time:"",place:"" })
  const [theirForm,   setTheirForm]   = useState({ year:"",month:"",day:"",time:"",place:"" })
  const [myMbti,      setMyMbti]      = useState<string | undefined>(undefined)
  const [theirMbti,   setTheirMbti]   = useState<string | undefined>(undefined)
  const [relType,     setRelType]     = useState("partner")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) return
    const rawProfile = localStorage.getItem("asteria_profile")
    if (!rawProfile) return

    try {
      const profile = JSON.parse(rawProfile)
      const nextForm: { year?: string; month?: string; day?: string; time?: string; place?: string } = {}
      if (profile.year) nextForm.year = String(profile.year)
      if (profile.month) nextForm.month = String(profile.month)
      if (profile.day) nextForm.day = String(profile.day)
      if (profile.birth_date || profile.birthDate) {
        const birthDate = profile.birth_date || profile.birthDate
        if (typeof birthDate === "string") {
          const [year, month, day] = birthDate.split("-")
          if (year && month && day) {
            nextForm.year = String(year)
            nextForm.month = String(Number(month))
            nextForm.day = String(Number(day))
          }
        }
      }
      if (profile.birth_time) nextForm.time = profile.birth_time
      const place = profile.birth_place_name || profile.birthPlaceName || profile.place || profile.birth_place
      if (place) nextForm.place = place
      if (Object.keys(nextForm).length) {
        setMyForm(prev => ({ ...prev, ...nextForm }))
      }

      const profileMbti = profile.mbti_type || profile.mbtiType
      const legacyMbti  = localStorage.getItem("asteria_mbti")
      const resolvedMbti = profileMbti || legacyMbti
      if (resolvedMbti) {
        setMyMbti(resolvedMbti)
      }
    } catch {
      // ignore malformed stored profile
    }
  }, [])

  const toDate = (f) => f.year && f.month && f.day
    ? `${f.year}-${String(f.month).padStart(2,"0")}-${String(f.day).padStart(2,"0")}` : ""

  const myDate    = useMemo(() => toDate(myForm),    [myForm])
  const theirDate = useMemo(() => toDate(theirForm), [theirForm])
  const mySign    = useMemo(() => getSunSign(myDate),    [myDate])
  const theirSign = useMemo(() => getSunSign(theirDate), [theirDate])
  const ok = !!myDate && !!theirDate

const handleSubmit = async () => {
    if (!ok) return
    setLoading(true); setError(null)
    try {
      const result = await compatApi.create({
        my_birth_date:         myDate,
        my_birth_place_name:   myForm.place || "東京都",
        my_birth_time:         myForm.time || undefined,
        my_mbti_type:          myMbti || undefined,
        their_birth_date:      theirDate,
        their_birth_place_name: theirForm.place || "東京都",
        their_birth_time:      theirForm.time || undefined,
        their_mbti_type:       theirMbti || undefined,
        relationship_type:     relType,
      })
      // 結果を localStorage に保存（API が落ちた時のフォールバック・即時表示用）
      localStorage.setItem("asteria_compat_result", JSON.stringify(result))
      const compatId = result?.compat_id
      if (compatId) {
        router.push(`/compat/${compatId}`)
      } else {
        // 認証無し時など compat_id が無いケースは旧 result ページへフォールバック
        router.push(`/compat/result`)
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "エラーが発生しました。もう一度お試しください。")
      setLoading(false)
    }
  }

  if (loading) {
    return <AstrologyLoading message="ふたりの星の相性を読み解いています..." subMessage="シナストリー計算とAI分析を行っています" />
  }

  return (
    <div className="relative min-h-screen pb-24">
      <Stars />
      <div className="relative z-10 max-w-app md:max-w-2xl mx-auto px-5">
        <div className="pt-8 pb-5 text-center">
          <div className="font-serif text-[15px] tracking-widest shimmer-gold mb-2">✦ ASTERIA ✦</div>
          <h1 className="font-serif text-2xl tracking-wide text-[#F0F0F8]">相性診断</h1>
          <div className="flex items-center gap-2.5 justify-center mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <span className="text-gold text-xs">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-4 md:items-start">
          <PersonPanel title="あなたの情報" form={myForm} setForm={setMyForm} sign={mySign} mbti={myMbti} setMbti={setMyMbti} />
          {/* 連結ハート（縦並びのモバイルのみ。md の横2カラムでは非表示） */}
          <div className="flex items-center justify-center py-3 relative md:hidden">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
              style={{ background:"linear-gradient(to right,transparent,rgba(201,165,84,.25),transparent)" }} />
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-gold z-10"
              style={{ background:"rgba(201,165,84,.08)", border:"1px solid rgba(201,165,84,.35)", boxShadow:"0 0 20px rgba(201,165,84,.2)" }}>♡</div>
          </div>
          <PersonPanel title="お相手の情報" form={theirForm} setForm={setTheirForm} sign={theirSign} mbti={theirMbti} setMbti={setTheirMbti} />
        </div>
        <div className="card mt-3 p-4">
          <div className="text-[11px] text-white/50 tracking-widest uppercase mb-3">関係性選択（任意）</div>
          <div className="grid grid-cols-3 gap-2">
            {REL_TYPES.map(r => (
              <button key={r.id} onClick={() => setRelType(r.id)}
                className={`p-3 rounded-xl text-center transition-all border ${relType===r.id?"border-gold/50 bg-gold/10":"border-white/10 bg-white/[0.03]"}`}>
                <div className={`text-lg mb-1 ${relType===r.id?"text-gold":"text-white/50"}`}>{r.icon}</div>
                <div className={`text-[10px] leading-tight ${relType===r.id?"text-gold font-bold":"text-white/40"}`}>{r.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <HintBox items={[
            "出生時刻が不明でも診断できます",
            "出生地は市区町村までで問題ありません",
            "MBTIは任意です",
            "個人情報は暗号化され安全に保護されます",
          ]} />
        </div>
        {error && <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/35 text-[12px] text-red-400 flex gap-2"><span>⚠</span><span>{error}</span></div>}
        <button onClick={handleSubmit} disabled={!ok||loading} className="btn-gold w-full py-4 text-[16px] mt-4">
          {loading?"診断中...":"✦ 相性を診断する"}
        </button>
        <p className="text-center text-[11px] text-white/30 mt-2">出生時刻がわからない場合でも診断できます</p>
      </div>
      <BottomNav />
    </div>
  )
}