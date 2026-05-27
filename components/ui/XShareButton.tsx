"use client"

const SHARE_URL = "https://asteria-web-beta.vercel.app/asteria"

interface XShareButtonProps {
  text: string
  className?: string
  variant?: "dark" | "gold"
}

export function XShareButton({ text, className = "", variant = "dark" }: XShareButtonProps) {
  const handleClick = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SHARE_URL)}`
    window.open(url, "_blank")
  }

  // ゴールド CTA バリアント（目立たせたい場面用）
  if (variant === "gold") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-[15px] ${className}`}
      >
        <span className="text-[18px] font-bold leading-none">𝕏</span>
        <span>X でシェアする</span>
      </button>
    )
  }

  // 既定のダークバリアント
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full py-3.5 rounded-full bg-black text-white border border-white/25 hover:border-white/50 transition-colors flex items-center justify-center gap-2 text-[14px] ${className}`}
    >
      <span className="text-[18px] font-bold leading-none">𝕏</span>
      <span>でシェア</span>
    </button>
  )
}
