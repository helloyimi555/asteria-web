"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import clsx from "clsx"

const NAV_LINKS = [
  { href:"/",        label:"ホーム" },
  { href:"/reading", label:"鑑定する" },
  { href:"/reading/result", label:"結果を見る" },
  { href:"/compat",  label:"相性診断" },
  { href:"/guide",   label:"星ガイド" },
  { href:"/mypage",  label:"マイページ" },
]

export function TopNav() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08]"
      style={{ background:"rgba(8,12,30,.95)" }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif text-[15px] tracking-widest">
          <span className="shimmer-gold">✦ ASTERIA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href}
                className={clsx("text-[13px] pb-0.5 transition-colors",
                  active
                    ? "text-gold border-b border-gold"
                    : "text-white/60 hover:text-white/90")}>
                {link.label}
              </Link>
            )
          })}
        </nav>
        {isAuthenticated && (
          <button onClick={logout}
            className="hidden md:block text-[12px] text-white/40 hover:text-white/70 transition-colors">
            ログアウト
          </button>
        )}
      </div>
    </header>
  )
}
