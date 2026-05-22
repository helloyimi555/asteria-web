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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
