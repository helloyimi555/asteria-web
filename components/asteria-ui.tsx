"use client";

import * as React from "react";

type ClassValue = string | false | null | undefined;

function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * ASTERIA UI Design Tokens
 *
 * 既存前提：
 * - 背景ベース: #04060F
 * - Gold: #C9A554
 */

const baseTransition = "transition duration-200 ease-out";

const baseDisabled =
  "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40";

const baseFocus =
  "focus:outline-none focus:ring-2 focus:ring-[#C9A554]/25 focus:border-[#C9A554]/60";

/* =========================================================
 * BaseCard
 * ======================================================= */

type BaseCardVariant = "default" | "summary" | "premium" | "notice" | "lucky";

type BaseCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: BaseCardVariant;
  interactive?: boolean;
};

export function BaseCard({
  variant = "default",
  interactive = false,
  className,
  children,
  style,
  ...props
}: BaseCardProps) {
  // 信頼性のため、ゴールド系グラデーション/ボーダー/シャドウはインラインスタイルで指定
  // （Tailwind の任意値 radial/linear-gradient は JIT で取りこぼされることがある）
  const variantStyles: Record<BaseCardVariant, React.CSSProperties> = {
    default: {
      borderColor: "rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      boxShadow: "0 0 30px rgba(201,165,84,0.06)",
    },
    summary: {
      borderColor: "rgba(201,165,84,0.35)",
      background:
        "radial-gradient(circle at top, rgba(201,165,84,0.16), rgba(255,255,255,0.045))",
      boxShadow: "0 0 42px rgba(201,165,84,0.14)",
    },
    premium: {
      borderColor: "rgba(201,165,84,0.45)",
      background:
        "linear-gradient(180deg, rgba(201,165,84,0.28), rgba(255,255,255,0.055) 34%, rgba(255,255,255,0.035))",
      boxShadow: "0 0 48px rgba(201,165,84,0.18)",
    },
    notice: {
      borderColor: "rgba(251,191,36,0.3)",
      background: "rgba(69,26,3,0.2)",
      boxShadow: "0 0 30px rgba(251,191,36,0.08)",
    },
    lucky: {
      borderColor: "rgba(110,231,183,0.25)",
      background: "rgba(2,44,34,0.2)",
      boxShadow: "0 0 30px rgba(110,231,183,0.08)",
    },
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(201,165,84,0.12),transparent_36%)] before:opacity-70",
        interactive &&
          cn(
            baseTransition,
            "hover:-translate-y-0.5 hover:border-[#C9A554]/45 hover:shadow-[0_0_42px_rgba(201,165,84,0.16)] active:translate-y-0"
          ),
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* =========================================================
 * ResultSummaryCard
 * ======================================================= */

type ResultSummaryCardProps = {
  title?: string;
  date?: string;
  theme: string;
  keywords?: string[];
  message?: string;
  className?: string;
};

export function ResultSummaryCard({
  title = "今日の星読み鑑定",
  date,
  theme,
  keywords = [],
  message,
  className,
}: ResultSummaryCardProps) {
  return (
    <BaseCard variant="summary" className={cn("text-center", className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A554]/40 bg-[#C9A554]/10 text-2xl text-[#C9A554]">
        ✦
      </div>

      <p className="mb-1 text-xs tracking-[0.28em] text-[#C9A554]/80">
        ASTERIA READING
      </p>

      <h2 className="text-xl font-semibold tracking-wide text-white">{title}</h2>

      {date && <p className="mt-1 text-xs text-white/45">{date}</p>}

      <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#C9A554]/45 to-transparent" />

      <p className="text-xs text-white/45">あなたのテーマ</p>

      <p className="mt-1 text-lg font-semibold tracking-wide text-[#C9A554]">
        {theme}
      </p>

      {keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-[#C9A554]/30 bg-[#C9A554]/10 px-3 py-1 text-xs text-[#C9A554]"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-left">
          <p className="mb-1 text-xs text-[#C9A554]/80">星からの一言</p>
          <p className="text-sm leading-7 text-white/80">{message}</p>
        </div>
      )}
    </BaseCard>
  );
}

/* =========================================================
 * PremiumCard
 * ======================================================= */

type PremiumCardProps = {
  /** メイン見出し */
  planName?: string;
  /** 機能を1行で説明するサブテキスト（背景バナー版で使用） */
  subtitle?: string;
  ctaLabel?: string;
  onClick?: () => void;
  className?: string;
};

/** プレミアム誘導バナー。背景画像（モバイル＝縦長／md以上＝横長）にテキストとCTAを CSS で重ねる。 */
export function PremiumCard({
  planName = "プレミアムプラン",
  subtitle = "詳細鑑定・保存・相性診断を解放",
  ctaLabel = "プランを見る",
  onClick,
  className,
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl",
        // モバイル/PC ともに横長スリムバナー（新画像のアスペクトに合わせる）
        "aspect-[1896/495] md:aspect-[1896/335]",
        // 背景画像（モバイル/デスクトップで切り替え）
        "bg-[url('/asteria/assets/premium-banner-bg-mobile.png')] md:bg-[url('/asteria/assets/premium-banner-bg.png')]",
        "bg-cover bg-center bg-no-repeat",
        className,
      )}
    >
      {/* テキスト＋CTA のオーバーレイ（左：テキスト群／右：CTA を横並びに） */}
      {/* 左側の王冠メダリオンを避けるため、padding-left でテキスト開始位置を内側にずらす */}
      <div className="absolute inset-0 flex items-center gap-2 pl-[26%] pr-3 md:gap-6 md:pl-[22%] md:pr-6">
        {/* テキスト群 */}
        <div className="relative z-10 min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 text-[#E7D08A]">
            <span className="text-[8px] md:text-[10px]">✦</span>
            <span className="font-serif text-[9px] tracking-[0.3em] md:text-[11px] md:tracking-[0.34em]">PREMIUM</span>
            <span className="text-[8px] md:text-[10px]">✦</span>
          </div>
          <h3
            className="mt-1 truncate font-serif text-[clamp(15px,4.5vw,24px)] font-semibold leading-tight text-[#F7E9B5] md:mt-1.5"
            style={{ textShadow: "0 0 18px rgba(201,165,84,0.55), 0 0 6px rgba(201,165,84,0.35)" }}
          >
            {planName}
          </h3>
          <p className="mt-1 truncate text-[10px] text-[#F7F3E7]/85 md:mt-1.5 md:text-[13px]">{subtitle}</p>
        </div>

        {/* CTA ボタン（常に右側） */}
        <button
          type="button"
          onClick={onClick}
          className="btn-gold relative z-10 inline-flex shrink-0 items-center justify-center gap-1 px-3 py-2 text-[11px] md:gap-2 md:px-6 md:py-2.5 md:text-[14px]"
        >
          {ctaLabel} <span>→</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 * NoticeCard
 * ======================================================= */

type NoticeCardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function NoticeCard({
  title = "注意ポイント",
  children,
  className,
}: NoticeCardProps) {
  return (
    <BaseCard variant="notice" className={className}>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/10 text-lg font-semibold text-amber-200">
          !
        </span>

        <h3 className="font-semibold text-amber-100">{title}</h3>
      </div>

      <div className="text-sm leading-7 text-amber-50/80">{children}</div>
    </BaseCard>
  );
}

/* =========================================================
 * LuckyActionCard
 * ======================================================= */

type LuckyActionCardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function LuckyActionCard({
  title = "ラッキーアクション",
  children,
  className,
}: LuckyActionCardProps) {
  return (
    <BaseCard variant="lucky" className={className}>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200/30 bg-emerald-200/10 text-lg text-emerald-100">
          ✦
        </span>

        <h3 className="font-semibold text-emerald-50">{title}</h3>
      </div>

      <div className="text-sm leading-7 text-emerald-50/80">{children}</div>
    </BaseCard>
  );
}

/* =========================================================
 * ChapterHeading
 * ======================================================= */

type ChapterHeadingProps = {
  number: string | number;
  title: string;
  subtitle?: string;
  className?: string;
};

export function ChapterHeading({
  number,
  title,
  subtitle,
  className,
}: ChapterHeadingProps) {
  const displayNumber = String(number).padStart(2, "0");

  return (
    <div className={cn("relative py-5", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#C9A554]/35 bg-[#C9A554]/10 shadow-[0_0_24px_rgba(201,165,84,0.10)]">
          <div className="text-center">
            <p className="text-[10px] leading-none text-[#C9A554]/70">Chapter</p>
            <p className="mt-0.5 text-2xl font-light leading-none text-[#C9A554]">
              {displayNumber}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-[#C9A554]/60 to-transparent" />
            <span className="text-xs text-[#C9A554]/70">✦</span>
          </div>

          <h2 className="text-lg font-semibold tracking-wide text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-white/50">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * OrnamentalDivider
 * ======================================================= */

export function OrnamentalDivider({ className }: { className?: string }) {
  return (
    <div className={cn("my-7 flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A554]/35 to-[#C9A554]/15" />
      <span className="text-xs text-[#C9A554]/70">✦</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C9A554]/35 to-[#C9A554]/15" />
    </div>
  );
}

/* =========================================================
 * Buttons
 * ======================================================= */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function GoldButton({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3",
        "bg-gradient-to-r from-[#B8892F] via-[#C9A554] to-[#E7D08A]",
        "text-sm font-semibold text-[#04060F]",
        "shadow-[0_0_24px_rgba(201,165,84,0.24)]",
        baseTransition,
        "hover:brightness-110 active:scale-[0.98]",
        baseFocus,
        baseDisabled,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3",
        "border border-[#C9A554]/40 bg-transparent",
        "text-sm font-semibold text-[#C9A554]",
        baseTransition,
        "hover:bg-[#C9A554]/10 hover:border-[#C9A554]/60 active:scale-[0.98]",
        baseFocus,
        baseDisabled,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type IconActionButtonProps = ButtonProps & {
  icon: React.ReactNode;
  label: string;
};

export function IconActionButton({
  icon,
  label,
  className,
  ...props
}: IconActionButtonProps) {
  return (
    <button
      className={cn(
        "group inline-flex min-w-[76px] flex-col items-center gap-2 rounded-2xl px-3 py-2",
        "text-white/70",
        baseTransition,
        "hover:text-[#C9A554] active:scale-[0.98]",
        baseFocus,
        baseDisabled,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          "border border-[#C9A554]/35 bg-white/[0.03]",
          "text-xl text-[#C9A554]",
          "shadow-[0_0_20px_rgba(201,165,84,0.08)]",
          baseTransition,
          "group-hover:border-[#C9A554]/60 group-hover:bg-[#C9A554]/10 group-hover:shadow-[0_0_28px_rgba(201,165,84,0.18)]"
        )}
      >
        {icon}
      </span>

      <span className="text-xs">{label}</span>
    </button>
  );
}

/* =========================================================
 * FormInput
 * ======================================================= */

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
  error?: string;
};

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput({ label, helperText, error, className, id, ...props }, ref) {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-medium tracking-wide text-white/65"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl px-3 text-sm",
            "bg-[#080D1A] text-white placeholder:text-white/30",
            "border",
            error
              ? "border-red-400/70 text-red-100 focus:border-red-400 focus:ring-red-400/20"
              : "border-white/10",
            !error && baseFocus,
            baseTransition,
            "disabled:cursor-not-allowed disabled:opacity-40",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-300">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-white/40">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

/* =========================================================
 * PremiumBadge
 * ======================================================= */

type PremiumBadgeProps = {
  label?: string;
  className?: string;
};

export function PremiumBadge({ label = "Premium", className }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[#C9A554]/45",
        "bg-[#C9A554]/15 px-3 py-1 text-[11px] font-semibold text-[#C9A554]",
        "shadow-[0_0_18px_rgba(201,165,84,0.12)]",
        className
      )}
    >
      <span>♛</span>
      {label}
    </span>
  );
}

/* =========================================================
 * AstroIconChip
 * ======================================================= */

type AstroIconChipProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  className?: string;
};

export function AstroIconChip({
  icon,
  label,
  active = false,
  className,
}: AstroIconChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        active
          ? "border-[#C9A554]/60 bg-[#C9A554]/15 text-[#C9A554]"
          : "border-white/10 bg-white/[0.03] text-white/65",
        "text-xs",
        className
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
