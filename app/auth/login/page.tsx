"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Stars } from "@/components/ui/Stars"

export default function LoginPage() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch {
      setError("メールアドレスまたはパスワードが正しくありません")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <Stars />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-[15px] tracking-widest shimmer-gold">
            ✦ ASTERIA ✦
          </Link>
          <h1 className="font-serif text-xl text-[#F0F0F8] mt-3">ログイン</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase mb-2 block">
              メールアドレス
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="example@email.com" required />
          </div>
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase mb-2 block">
              パスワード
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30
                            text-[12px] text-red-400 flex items-center gap-2">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-gold py-3.5 text-[15px] mt-1">
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-center text-[12px] text-white/40 mt-4">
          アカウントをお持ちでない方は{" "}
          <Link href="/auth/register" className="text-gold hover:text-gold-light underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
