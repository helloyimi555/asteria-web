"use client"
import { Stars } from "@/components/ui/Stars"

type AstrologyLoadingProps = {
  className?: string;
  message?: string;
  subMessage?: string;
};
export default function AstrologyLoading({
  className = "",
  message = "星図を読み解いています...",
  subMessage = "あなたの天体配置から、今の運勢を紡いでいます",
}: AstrologyLoadingProps) {
  return (
    <section
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080C1E] px-6 text-[#F6F1E4] ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      {/* 他の画面と同じ星空背景（Stars コンポーネント） */}
      <Stars />
      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center -translate-y-32">
        <div className="relative aspect-square w-[min(108vw,430px)] -translate-y-10">
          <img
            src="/asteria/loading/zodiac-ring-transparent.png"
            alt=""
            className="absolute inset-0 h-full w-full animate-[asteria-spin_30s_linear_infinite] object-contain opacity-90 motion-reduce:animate-none"
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/asteria/loading/center-logo-transparent.png"
              alt="ASTERIA"
              className="w-[44%] animate-[asteria-pulse_3.4s_ease-in-out_infinite] object-contain opacity-95 motion-reduce:animate-none"
              draggable={false}
            />
          </div>
        </div>
        <div className="-mt-10 text-center font-serif">
          <div className="mb-4 flex items-center justify-center gap-4 text-[#C9A554]/70">
            <span className="h-px w-20 bg-[#C9A554]/25" />
            <span className="text-sm">✦</span>
            <span className="h-px w-20 bg-[#C9A554]/25" />
          </div>
          <p className="w-full text-center text-[20px] leading-relaxed tracking-[0.08em] text-[#F6F1E4]/95">
            {message}
          </p>
          <p className="w-full text-center mt-8 text-[13px] leading-loose tracking-[0.12em] text-[#F6F1E4]/58">
            {subMessage}
          </p>
        </div>
      </div>
      <style jsx>{`
        @keyframes asteria-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes asteria-pulse {
          0%,
          100% {
            opacity: 0.78;
            filter: drop-shadow(0 0 10px rgba(201, 165, 84, 0.18));
            transform: scale(0.985);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 24px rgba(201, 165, 84, 0.34));
            transform: scale(1.025);
          }
        }
      `}</style>
    </section>
  );
}