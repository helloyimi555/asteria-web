import type { Metadata } from "next"
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const notoSerif = Noto_Serif_JP({
  subsets:  ["latin"],
  weight:   ["300", "400", "600"],
  variable: "--font-serif",
  display:  "swap",
})

const notoSans = Noto_Sans_JP({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "700"],
  variable: "--font-sans",
  display:  "swap",
})

export const metadata: Metadata = {
  title:       "ASTERIA - 天体の動きを根拠に、あなたの今を言語化する",
  description: "出生情報と現在・未来の天体配置から、今のテーマを読み解きます。",
  themeColor:  "#080C1E",
  openGraph: {
    title:       "ASTERIA",
    description: "天体の動きを根拠に、あなたの今を言語化する",
    type:        "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body className="bg-[#080C1E] text-[#E8E8F0] min-h-screen font-sans antialiased">
        {/* 全ページ共通の背景レイヤー（星背景より後ろ・クリック透過）。
            overflow-hidden で負オフセット要素のはみ出しによる横スクロールを防止 */}
        <div aria-hidden className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* ホロスコープ円（透かし）：右上に大きく薄く */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-15%",
              width: 600,
              height: 600,
              opacity: 0.07,
              backgroundImage: "url(/loading/zodiac-ring-transparent.png)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          {/* 星雲グロー：左下にゴールドの放射状グロー（CSSのみ） */}
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "-10%",
              width: 500,
              height: 500,
              background: "radial-gradient(circle, rgba(201,165,84,0.06) 0%, transparent 70%)",
            }}
          />
        </div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
