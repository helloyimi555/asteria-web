"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { BottomNav } from "@/components/layout/BottomNav"
import AstrologyLoading from "@/components/ui/AstrologyLoading"
import { XShareButton } from "@/components/ui/XShareButton"
import { isLoggedIn, clearTokens, guestPersonalityApi, homeApi, readingApi, type GuestPersonalityResult, type DailyHome } from "@/lib/api"
import type { Reading } from "@/types"
import { formatReadingTitle, formatReadingDate, inferPeriodId } from "@/utils/dateUtils"
import { getThemeConfig } from "@/utils/themeConfig"
import { ZODIAC } from "@/lib/zodiac"

const zodiacFileBase = (jp?: string) =>
  jp ? (ZODIAC.find(z => z.sign === jp)?.en?.toLowerCase() ?? "") : ""

function MoodCell({ iconSrc, label, value }: { iconSrc: string; label: string; value?: string }) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      <div className="text-[10px] text-white/52 tracking-[0.12em] mb-1.5">{label}</div>
      <img src={iconSrc} alt="" aria-hidden className="h-16 w-16 mb-2 object-contain" />
      <div className="font-serif text-[13.5px] text-white/92 truncate w-full">{value || "—"}</div>
    </div>
  )
}

const FEATURES = [
  { icon:"🔭", title:"天体計算",  desc:"Swiss Ephemerisによる正確な計算" },
  { icon:"📖", title:"解釈ルール",desc:"占星術の知識をルール化" },
  { icon:"✨", title:"AI文章化",  desc:"あなただけの言葉で表現" },
]

const YEARS  = Array.from({ length:75 }, (_, i) => 2008 - i)
const MONTHS = Array.from({ length:12 }, (_, i) => i + 1)
const DAYS   = Array.from({ length:31 }, (_, i) => i + 1)

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

      <header className="relative z-10 w-full max-w-app md:max-w-2xl px-5 pt-5 flex justify-between items-center">
        <span className="font-serif text-[15px] tracking-widest shimmer-gold">✦ ASTERIA</span>
        <Link href="/auth/login" className="text-sm text-white/50 hover:text-white/80 transition-colors">
          ログイン
        </Link>
      </header>

      <section className="relative z-10 w-full max-w-app md:max-w-2xl px-5 flex flex-col items-center
                          justify-center text-center min-h-[60vh]">
        <ZodiacWheelSVG />
        <h1 className="font-serif text-[clamp(26px,7vw,36px)] font-normal leading-[1.45]
                       text-white mb-5 animate-fade-up">
          最強占い、はじまる。<br />星とMBTIで、<br />本質と相性を読み解く
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
          <div className="flex flex-col md:flex-row md:justify-center gap-3">
            <Link href="/reading"
              className="btn-gold flex items-center justify-center gap-2 py-4 px-6 text-[16px] md:text-lg w-full md:w-auto md:px-8">
              ✦ 無料で鑑定を始める
            </Link>
            <Link href="/auth/register"
              className="btn-gold-outline flex items-center justify-center gap-2 py-3 px-6 text-[14px] md:text-base w-full md:w-auto md:px-8">
              会員登録（無料）
            </Link>
          </div>
          <Link href="/auth/login"
            className="block text-center text-[13px] text-gold/60 hover:text-gold transition-colors mt-4">
            すでに会員の方はこちら → ログイン
          </Link>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-app md:max-w-2xl px-5 pb-16">
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
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [daily,    setDaily]    = useState<DailyHome | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])

  useEffect(() => {
    let cancelled = false
    homeApi.daily()
      .then(d => { if (!cancelled) setDaily(d) })
      .catch(() => { /* graceful */ })
    readingApi.list({ limit: 3 })
      .then(res => { if (!cancelled) setReadings(res.readings ?? []) })
      .catch(() => { /* graceful */ })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="relative min-h-screen pb-24">
      {partnerLoading && (
        <div className="fixed inset-0 z-50">
          <AstrologyLoading
            message="星の配置を読み解いています..."
            subMessage="あなたの本質的な才能と課題を紡いでいます"
          />
        </div>
      )}
      <Stars />
      <div className="relative z-10 max-w-app md:max-w-2xl mx-auto px-5">
        <div className="pt-7 pb-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <img src="/asteria/assets/header-logo-mark.png" alt="" aria-hidden className="h-11 w-11 object-contain" />
            <span className="font-serif text-[19px] tracking-[0.22em] shimmer-gold">ASTERIA</span>
          </div>
          <button onClick={onLogout} className="text-[12px] text-white/40 hover:text-white/70 transition-colors">
            ログアウト
          </button>
        </div>

        <div className="text-center mb-6 mt-2">
          <h1 className="font-serif text-[28px] tracking-wide text-white mb-2">おかえりなさい</h1>
          <p className="text-[13px] text-white/55 leading-relaxed">今日の星から、あなたへのメッセージを読み解きます</p>
        </div>

<div className="space-y-3">
          <Link href="/reading"
            className="btn-gold flex items-center justify-center gap-2 h-[56px] text-[14.5px] !rounded-full mx-auto w-[92%] max-w-[420px]"
            style={{ boxShadow: "0 4px 18px rgba(201,165,84,0.22)" }}>
            <span className="text-[#FFE6B0]">✦</span> 今日の鑑定を始める
          </Link>

          {/* 今日のあなたへの星メモ / 今日の星空ニュース */}
          {daily && (
            <div className="grid grid-cols-2 gap-3">
              {/* Personal card */}
              <div className="card flex flex-col p-3.5">
                <div className="mb-2 flex justify-end">
                  <span className="text-[9px] px-2 py-0.5 rounded-full text-gold whitespace-nowrap"
                    style={{ background: "rgba(201,165,84,.12)", border: "1px solid rgba(201,165,84,.32)" }}>
                    あなた向け
                  </span>
                </div>
                <div className="font-serif text-[12px] text-[#F0F0F8] mb-3 whitespace-nowrap">今日のあなたへの星メモ</div>
                <div className="rounded-xl px-2.5 py-2.5 flex items-start gap-2 flex-1"
                  style={{ background: "rgba(8,12,30,0.32)", border: "1px solid rgba(201,165,84,0.22)" }}>
                  <img src="/asteria/assets/home-card-personal-moon.png" alt="" aria-hidden
                    className="h-[60px] w-[60px] shrink-0 object-contain"
                    style={{ filter: "drop-shadow(0 0 12px rgba(201,165,84,0.22))" }} />
                  <p className="font-serif text-[11px] leading-[1.85] text-white/82 font-light line-clamp-3">
                    {daily.observation_point || daily.flow}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-center opacity-55">
                  <img src="/asteria/assets/divider-star.png" alt="" aria-hidden className="h-2.5" />
                </div>
              </div>
              {/* Universal card */}
              <div className="card flex flex-col p-3.5">
                <div className="mb-2 flex justify-end">
                  <span className="text-[9px] px-2 py-0.5 rounded-full text-[#A3C7FF] whitespace-nowrap"
                    style={{ background: "rgba(112,180,255,.10)", border: "1px solid rgba(112,180,255,.32)" }}>
                    全ユーザー共通
                  </span>
                </div>
                <div className="font-serif text-[12px] text-[#F0F0F8] mb-3 whitespace-nowrap">今日の星空ニュース</div>
                <div className="rounded-xl px-2.5 py-2.5 flex items-start gap-2 flex-1"
                  style={{ background: "rgba(8,12,30,0.32)", border: "1px solid rgba(201,165,84,0.22)" }}>
                  <img src="/asteria/assets/home-card-universal-saturn.png" alt="" aria-hidden
                    className="h-[60px] w-[60px] shrink-0 object-contain"
                    style={{ filter: "drop-shadow(0 0 12px rgba(201,165,84,0.22))" }} />
                  <p className="font-serif text-[11px] leading-[1.85] text-white/82 font-light line-clamp-3">
                    {daily.flow}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-center opacity-55">
                  <img src="/asteria/assets/divider-star.png" alt="" aria-hidden className="h-2.5" />
                </div>
              </div>
            </div>
          )}

          {/* 今日の星のムード */}
          {daily && (
            <div className="card p-4">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-gold text-xs">✦</span>
                <span className="font-serif text-[14px] text-[#F0F0F8]">今日の星のムード</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MoodCell
                  iconSrc="/asteria/assets/mood-icon-phase-moon.png"
                  label="月相"
                  value={daily.moon_phase}
                />
                <MoodCell
                  iconSrc={zodiacFileBase(daily.moon_sign) ? `/asteria/assets/${zodiacFileBase(daily.moon_sign)}.png` : "/asteria/assets/mood-icon-phase-moon.png"}
                  label="月のサイン"
                  value={daily.moon_sign}
                />
                <MoodCell
                  iconSrc="/asteria/assets/mood-icon-theme-star.png"
                  label="テーマ"
                  value={daily.main_theme}
                />
              </div>
              {daily.keywords?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {daily.keywords.map((k, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] text-gold"
                      style={{ background: "rgba(201,165,84,.10)", border: "1px solid rgba(201,165,84,.25)" }}>
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 最近読んだ鑑定 */}
          {readings.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-gold text-xs">✦</span>
                  <span className="font-serif text-[14px] text-[#F0F0F8]">最近読んだ鑑定</span>
                </div>
                <Link href="/reading/results" className="text-[11px] text-gold/65 hover:text-gold transition-colors flex items-center gap-0.5">
                  すべて見る <span>›</span>
                </Link>
              </div>
              {readings.slice(0, 3).map((r, i) => {
                const cfg = getThemeConfig(r.theme)
                const period = inferPeriodId(r.period_start, r.period_end)
                return (
                  <Link key={r.reading_id} href={`/reading/${r.reading_id}`}
                    className={`flex items-center gap-2.5 px-4 py-3 hover:bg-white/[0.02] transition-colors ${i > 0 ? "border-t border-white/[0.04]" : ""}`}
                    style={{ borderLeft: `2px solid ${cfg.color}` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px]"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}55`, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-white/92 font-medium">{formatReadingTitle(r.theme, period, r.created_at)}</div>
                      <div className="text-[10px] text-white/45 mt-0.5">{formatReadingDate(r.created_at)}に鑑定</div>
                    </div>
                    <span className="text-gold/65 text-xl leading-none">›</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="card p-5 text-center">
              <div className="text-gold/50 text-xl mb-1">✦</div>
              <p className="text-[12px] text-white/45">まだ星は記録されていません</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Link href="/compat"
              className="card relative flex items-center gap-2.5 overflow-hidden px-3 py-4 min-h-[124px]">
              <img src="/asteria/assets/home-feature-compat.png" alt="" aria-hidden
                className="h-[92px] w-[92px] shrink-0 object-contain pointer-events-none"
                style={{ filter: "drop-shadow(0 0 10px rgba(201,165,84,0.18))" }} />
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[14px] text-white/92 mb-1">相性診断</div>
                <div className="text-[10px] text-white/52 leading-[1.7]">ふたりの星が響き合うかを読み解きます</div>
              </div>
              <span className="absolute right-2.5 bottom-2.5 text-white/30 text-sm">›</span>
            </Link>
            <Link href="/guide"
              className="card relative flex items-center gap-2.5 overflow-hidden px-3 py-4 min-h-[124px]">
              <img src="/asteria/assets/home-feature-guide.png" alt="" aria-hidden
                className="h-[86px] w-[86px] shrink-0 object-contain pointer-events-none"
                style={{ filter: "drop-shadow(0 0 10px rgba(201,165,84,0.18))" }} />
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[14px] text-white/92 mb-1">星読みガイド</div>
                <div className="text-[10px] text-white/52 leading-[1.7]">星の知識を深めて、日々のヒントに</div>
              </div>
              <span className="absolute right-2.5 bottom-2.5 text-white/30 text-sm">›</span>
            </Link>
          </div>

          <PartnerPersonalityCard onLoadingChange={setPartnerLoading} />

          <Link href="/reading/results"
            className="card flex items-center gap-3 px-5 py-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="h-5 w-5 text-gold/70 shrink-0" aria-hidden>
              <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
              <path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" />
            </svg>
            <div className="flex-1 font-serif text-[14px] text-[#F0F0F8]">鑑定履歴を見る</div>
            <span className="text-white/30">›</span>
          </Link>

          <Link href="/mypage"
            className="card flex items-center gap-3 px-5 py-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="h-5 w-5 text-gold/70 shrink-0" aria-hidden>
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
            </svg>
            <div className="flex-1 font-serif text-[14px] text-[#F0F0F8]">マイページ</div>
            <span className="text-white/30">›</span>
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function PartnerPersonalityCard({ onLoadingChange }: { onLoadingChange?: (loading: boolean) => void }) {
  const [open, setOpen]             = useState(false)
  const [birthYear, setBirthYear]   = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay]     = useState("")
  const [birthPlace, setBirthPlace] = useState("")
  const [mbti, setMbti]             = useState("")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [result, setResult]         = useState<GuestPersonalityResult | null>(null)

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

  const dateReady = !!(birthYear && birthMonth && birthDay)
  const birthDate = dateReady
    ? `${birthYear}-${String(birthMonth).padStart(2,"0")}-${String(birthDay).padStart(2,"0")}`
    : ""

  const reset = () => {
    setResult(null)
    setBirthYear("")
    setBirthMonth("")
    setBirthDay("")
    setBirthPlace("")
    setMbti("")
    setError(null)
  }

  const submit = async () => {
    if (!dateReady) {
      setError("生年月日を入力してください")
      return
    }
    if (new Date(birthDate) > new Date()) {
      setError("未来の日付は入力できません")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await guestPersonalityApi.analyze({
        birth_date:       birthDate,
        birth_place_name: birthPlace || undefined,
        mbti_type:        mbti || undefined,
      })
      setResult(data)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "分析に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div>
          <div className="font-serif text-[14px] text-[#F0F0F8] mb-0.5 flex items-center gap-1.5">
            <span className="text-gold text-xs">✦</span>相手の性格を分析する
          </div>
          <div className="text-[11px] text-white/40">生年月日から本質と傾向を読み解く</div>
        </div>
        <span className={`text-white/30 transition-transform ${open ? "rotate-90" : ""}`}>›</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/[0.06]">
          {result ? (
            <div className="pt-4 space-y-3">
              <div className="text-center">
                <div className="text-[11px] text-gold/70 mb-1">タイプ</div>
                <div className="font-serif text-[16px] text-[#F0F0F8]">{result.type_name}</div>
              </div>
              <div>
                <div className="text-[11px] text-gold/70 mb-1">性格</div>
                <p className="text-[12px] text-white/75 leading-relaxed whitespace-pre-line">{result.personality}</p>
              </div>
              {result.strengths?.length > 0 && (
                <div>
                  <div className="text-[11px] text-gold/70 mb-1">強み</div>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-[12px] text-white/75 leading-relaxed pl-3 relative">
                        <span className="absolute left-0 text-gold/60">・</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.challenges?.length > 0 && (
                <div>
                  <div className="text-[11px] text-gold/70 mb-1">課題</div>
                  <ul className="space-y-1">
                    {result.challenges.map((c, i) => (
                      <li key={i} className="text-[12px] text-white/75 leading-relaxed pl-3 relative">
                        <span className="absolute left-0 text-gold/60">・</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result?.type_name && (
                <div className="pt-1">
                  <XShareButton
                    text={`✦ 相手は「${result.type_name}」タイプ。ASTERIAで星の性格分析をしました。#ASTERIA #占星術`}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={reset}
                className="btn-gold-outline w-full py-2.5 text-[13px] mt-1">
                別の人を分析する
              </button>
            </div>
          ) : (
            <div className="pt-4 space-y-3">
              <div>
                <label className="block text-[11px] text-white/50 mb-1.5">
                  生年月日 <span className="text-gold">*</span>
                </label>
                <div className="grid grid-cols-[2fr_1.1fr_1.1fr] gap-2">
                  {[
                    { val: birthYear,  set: setBirthYear,  opts: YEARS,  ph: "年", fmt: (v: number) => `${v}年` },
                    { val: birthMonth, set: setBirthMonth, opts: MONTHS, ph: "月", fmt: (v: number) => `${String(v).padStart(2,"0")}月` },
                    { val: birthDay,   set: setBirthDay,   opts: DAYS,   ph: "日", fmt: (v: number) => `${String(v).padStart(2,"0")}日` },
                  ].map(({ val, set, opts, ph, fmt }) => (
                    <div key={ph} className="relative">
                      <select
                        value={val}
                        onChange={e => { set(e.target.value); setError(null) }}
                        style={{ backgroundColor: "#0d0d1a" }}
                        className="w-full appearance-none border border-white/10 rounded-md pl-3 pr-7 py-2 text-[13px] text-white focus:outline-none focus:border-gold/50">
                        <option value="">{ph}</option>
                        {opts.map(o => <option key={o} value={o}>{fmt(o)}</option>)}
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-[10px]">▾</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-white/50 mb-1.5">出生地（任意）</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={e => setBirthPlace(e.target.value)}
                  placeholder="例：東京都"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-md px-3 py-2 text-[13px] text-white placeholder-white/25 focus:outline-none focus:border-gold/50" />
              </div>
              <div>
                <label className="block text-[11px] text-white/50 mb-1.5">MBTI（任意）</label>
                <select
                  value={mbti}
                  onChange={e => setMbti(e.target.value)}
                  style={{ backgroundColor: "#0d0d1a" }}
                  className="w-full border border-white/10 rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-gold/50">
                  <option value="">選択しない</option>
                  {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
                    "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="text-[12px] text-red-300/90">{error}</div>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={loading || !dateReady}
                className="btn-gold w-full py-3 text-[14px] disabled:opacity-50">
                {loading ? "分析中…" : "✦ 性格を分析する"}
              </button>
            </div>
          )}
        </div>
      )}
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
