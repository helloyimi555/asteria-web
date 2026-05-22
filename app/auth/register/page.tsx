"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Stars } from "@/components/ui/Stars"

export default function RegisterPage() {
  const { register } = useAuth()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("パスワードが一致しません"); return }
    if (password.length < 8)  { setError("パスワードは8文字以上で設定してください"); return }
    setLoading(true); setError(null)
    try {
      await register(email, password)
    } catch {
      setError("登録に失敗しました。このメールアドレスはすでに使用されている可能性があります。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5">
      <Stars />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-[15px] tracking-widest shimmer-gold">✦ ASTERIA ✦</Link>
          <h1 className="font-serif text-xl text-[#F0F0F8] mt-3">新規登録</h1>
          <p className="text-[12px] text-white/45 mt-1">無料で鑑定を始めましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase mb-2 block">メールアドレス</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="input-field" placeholder="example@email.com" required />
          </div>
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase mb-2 block">パスワード</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              className="input-field" placeholder="8文字以上" required />
          </div>
          <div>
            <label className="text-[11px] text-white/50 tracking-widest uppercase mb-2 block">パスワード（確認）</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
              className="input-field" placeholder="もう一度入力" required />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-[12px] text-red-400 flex gap-2">
              <span>⚠</span><span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-gold py-3.5 text-[15px] mt-1">
            {loading ? "登録中..." : "✦ 無料で始める"}
          </button>
        </form>

        <p className="text-center text-[12px] text-white/40 mt-4">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/auth/login" className="text-gold underline">ログイン</Link>
        </p>
        <p className="text-center text-[10px] text-white/25 mt-2 leading-relaxed px-4">
          登録することで利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  )
}
