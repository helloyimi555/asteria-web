"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Stars } from "@/components/ui/Stars"
import { getSupabase } from "@/lib/supabase"
import { authApi } from "@/lib/api"

type Status = "verifying" | "success" | "error"

export default function VerifyEmailPage() {
  const [status,  setStatus]  = useState<Status>("verifying")
  const [email,   setEmail]   = useState<string | null>(null)
  const [message, setMessage] = useState<string>("メール確認を完了しています…")

  useEffect(() => {
    const run = async () => {
      // 1. URL hash から Supabase の access_token を取り出す
      //    形式: #access_token=xxx&refresh_token=yyy&type=signup&...
      let accessToken: string | null = null

      const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : ""
      if (hash) {
        const params = new URLSearchParams(hash)
        accessToken = params.get("access_token")
      }

      // 2. fallback: Supabase JS が自動でセッションを検出している場合はそこから取得
      if (!accessToken) {
        const supa = getSupabase()
        if (supa) {
          const { data } = await supa.auth.getSession()
          accessToken = data.session?.access_token ?? null
        }
      }

      if (!accessToken) {
        setStatus("error")
        setMessage("確認トークンが見つかりませんでした。メールのリンクから開きなおしてください。")
        return
      }

      // 3. バックエンドに送信して is_email_verified を立てる
      try {
        const res = await authApi.verifyEmail(accessToken)
        setEmail(res.email)
        setStatus("success")
        setMessage("メール認証が完了しました")
        // URL hash をクリア（トークン漏洩防止）
        if (typeof window !== "undefined" && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname)
        }
      } catch (e: any) {
        setStatus("error")
        setMessage(e?.response?.data?.detail ?? "メール認証に失敗しました。お手数ですが再度お試しください。")
      }
    }
    run()
  }, [])

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
