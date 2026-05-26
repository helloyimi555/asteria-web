"use client"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Stars } from "@/components/ui/Stars"
import { authApi } from "@/lib/api"

type Status = "verifying" | "success" | "error"

function VerifyFallback() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <Stars />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-serif text-[15px] tracking-widest shimmer-gold">✦ ASTERIA ✦</span>
        </div>
        <div className="card p-6 text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-gold/25 border-t-gold rounded-full animate-spin" />
          <p className="text-[13px] text-white/70">読み込み中…</p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const params = useSearchParams()
  const [status,  setStatus]  = useState<Status>("verifying")
  const [email,   setEmail]   = useState<string | null>(null)
  const [message, setMessage] = useState<string>("メール確認を完了しています…")

  useEffect(() => {
    const token = params.get("token")
    if (!token) {
      setStatus("error")
      setMessage("確認トークンが見つかりませんでした。メールのリンクから開きなおしてください。")
      return
    }

    let cancelled = false
    authApi.verifyEmail(token)
      .then(res => {
        if (cancelled) return
        setEmail(res.email)
        setStatus("success")
        setMessage("メール認証が完了しました")
      })
      .catch((e: any) => {
        if (cancelled) return
        setStatus("error")
        const detail = e?.response?.data?.detail
        const code   = e?.response?.status
        if (code === 410) {
          setMessage("確認リンクの有効期限が切れています。お手数ですが再度登録してください。")
        } else if (code === 404) {
          setMessage("このリンクは既に使用済みか無効です。")
        } else {
          setMessage(detail ?? "メール認証に失敗しました。お手数ですが再度お試しください。")
        }
      })
    return () => { cancelled = true }
  }, [params])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <Stars />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-[15px] tracking-widest shimmer-gold">✦ ASTERIA ✦</Link>
        </div>
        <div className="card p-6 text-center">
          {status === "verifying" && (
            <>
              <div className="w-10 h-10 mx-auto mb-4 border-2 border-gold/25 border-t-gold rounded-full animate-spin" />
              <p className="text-[13px] text-white/70">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="text-4xl text-gold mb-3">✓</div>
              <h1 className="font-serif text-[18px] text-[#F0F0F8] mb-2">{message}</h1>
              {email && (
                <p className="text-[12px] text-white/55 mb-5">
                  <span className="text-gold/85">{email}</span> の認証を確認しました。
                </p>
              )}
              <Link href="/reading" className="btn-gold inline-block px-6 py-2.5 text-[14px]">
                ✦ 鑑定を始める
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="text-3xl text-red-400/80 mb-3">⚠</div>
              <h1 className="font-serif text-[16px] text-[#F0F0F8] mb-3">認証に失敗しました</h1>
              <p className="text-[12px] text-white/55 leading-6 mb-5">{message}</p>
              <Link href="/auth/login" className="btn-gold-outline inline-block px-6 py-2.5 text-[13px]">
                ログイン画面へ
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
