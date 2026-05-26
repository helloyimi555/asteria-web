"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const NAV_ITEMS = [
  { href:"/",        label:"ホーム",   icon:"⌂" },
  { href:"/reading", label:"鑑定する", icon:"⊕" },
  { href:"/reading/results", label:"結果を見る", icon:"✦" },
  { href:"/compat",  label:"相性診断", icon:"♡" },
  { href:"/mypage",  label:"マイページ",icon:"◯" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08]"
      style={{ background:"rgba(8,12,30,.95)", paddingBottom:"calc(8px + env(safe-area-inset-bottom))" }}>
      <div className="flex justify-around pt-2">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1">
              <span className={clsx("text-lg", active ? "text-gold" : "text-white/40")}>
                {item.icon}
              </span>
              <span className={clsx("text-[10px] font-sans",
                active ? "text-gold" : "text-white/40")}>
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-gold absolute bottom-1" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
