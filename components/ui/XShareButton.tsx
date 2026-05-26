"use client"

const SHARE_URL = "https://asteria-web-beta.vercel.app/asteria"

interface XShareButtonProps {
  text: string
  className?: string
}

export function XShareButton({ text, className = "" }: XShareButtonProps) {
  const handleClick = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SHARE_URL)}`
    window.open(url, "_blank")
  }

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
