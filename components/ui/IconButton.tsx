"use client"
import type { ReactNode } from "react"

/** 02. 丸型アイコンボタン（保存・シェア・もう一度鑑定 など）
 *  ゴールドボーダーの円 + アイコン + 下にラベル。disabled 対応。 */
export function IconButton({
  icon, label, onClick, disabled = false, ariaLabel,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className="flex flex-col items-center gap-1.5 group disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span
        className="w-12 h-12 rounded-full flex items-center justify-center text-gold text-xl transition-colors
                   group-hover:enabled:border-gold/70 group-enabled:group-hover:bg-gold/10"
        style={{ border: "1px solid rgba(201,165,84,.4)", background: "rgba(201,165,84,.06)" }}
      >
        {icon}
      </span>
      <span className="text-[11px] text-white/60">{label}</span>
    </button>
  )
}
